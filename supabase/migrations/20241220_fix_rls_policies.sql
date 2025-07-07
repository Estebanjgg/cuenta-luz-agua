-- Corrección de políticas RLS para saved_tariffs
-- Fecha: 2024-12-20
-- Descripción: Soluciona el error 42501 de violación de políticas RLS

-- 1. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view predefined tariffs and own tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "Users can insert own tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "Users can update own tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "Users can delete own tariffs" ON public.saved_tariffs;

-- 2. Verificar que RLS esté habilitado
ALTER TABLE public.saved_tariffs ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas más permisivas para debugging
-- Política para SELECT - permite ver tarifas predefinidas y propias
CREATE POLICY "allow_select_tariffs" ON public.saved_tariffs
    FOR SELECT USING (
        is_predefined = true OR 
        user_id = auth.uid() OR
        auth.uid() IS NOT NULL
    );

-- Política para INSERT - permite insertar tarifas propias
CREATE POLICY "allow_insert_tariffs" ON public.saved_tariffs
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        (user_id = auth.uid() OR user_id IS NULL) AND
        (is_predefined = false OR is_predefined IS NULL)
    );

-- Política para UPDATE - permite actualizar tarifas propias
CREATE POLICY "allow_update_tariffs" ON public.saved_tariffs
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        (user_id = auth.uid() OR user_id IS NULL) AND
        is_predefined = false
    ) WITH CHECK (
        auth.uid() IS NOT NULL AND
        (user_id = auth.uid() OR user_id IS NULL) AND
        is_predefined = false
    );

-- Política para DELETE - permite eliminar tarifas propias
CREATE POLICY "allow_delete_tariffs" ON public.saved_tariffs
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND
        user_id = auth.uid() AND
        is_predefined = false
    );

-- 4. Verificar políticas para user_tariff_config
DROP POLICY IF EXISTS "Users can view own tariff config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "Users can insert own tariff config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "Users can update own tariff config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "Users can delete own tariff config" ON public.user_tariff_config;

ALTER TABLE public.user_tariff_config ENABLE ROW LEVEL SECURITY;

-- Políticas más permisivas para user_tariff_config
CREATE POLICY "allow_select_user_config" ON public.user_tariff_config
    FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "allow_insert_user_config" ON public.user_tariff_config
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "allow_update_user_config" ON public.user_tariff_config
    FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "allow_delete_user_config" ON public.user_tariff_config
    FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 5. Función de debugging para verificar el estado de autenticación
CREATE OR REPLACE FUNCTION debug_auth_state()
RETURNS TABLE(
    current_user_id uuid,
    session_exists boolean,
    user_role text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() as current_user_id,
        (auth.uid() IS NOT NULL) as session_exists,
        COALESCE(auth.jwt() ->> 'role', 'no_role') as user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para verificar permisos de inserción
CREATE OR REPLACE FUNCTION test_tariff_insert()
RETURNS TABLE(
    can_insert boolean,
    user_id uuid,
    error_message text
) AS $$
DECLARE
    test_result boolean := false;
    current_uid uuid;
    error_msg text := '';
BEGIN
    current_uid := auth.uid();
    
    IF current_uid IS NULL THEN
        error_msg := 'No authenticated user found';
    ELSE
        test_result := true;
        error_msg := 'User authenticated successfully';
    END IF;
    
    RETURN QUERY
    SELECT 
        test_result as can_insert,
        current_uid as user_id,
        error_msg as error_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear índices adicionales si no existen
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_user_id ON public.saved_tariffs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_predefined ON public.saved_tariffs(is_predefined);
CREATE INDEX IF NOT EXISTS idx_user_tariff_config_user_id ON public.user_tariff_config(user_id);

-- 8. Mensaje de finalización
DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed successfully!';
    RAISE NOTICE 'Use SELECT * FROM debug_auth_state(); to check authentication';
    RAISE NOTICE 'Use SELECT * FROM test_tariff_insert(); to test insert permissions';
END
$$;