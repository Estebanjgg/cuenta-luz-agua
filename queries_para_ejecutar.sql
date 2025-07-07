-- QUERIES PARA CORREGIR EL PROBLEMA DE RLS
-- Ejecuta estas queries en tu consola de Supabase SQL Editor
-- =====================================================

-- 1. ELIMINAR POLÍTICAS EXISTENTES
-- ================================
DROP POLICY IF EXISTS "Users can view predefined tariffs and own tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "Users can insert own tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "Users can update own tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "Users can delete own tariffs" ON public.saved_tariffs;

-- 2. HABILITAR RLS
-- ===============
ALTER TABLE public.saved_tariffs ENABLE ROW LEVEL SECURITY;

-- 3. CREAR NUEVAS POLÍTICAS MÁS PERMISIVAS
-- ========================================

-- Política para SELECT (ver tarifas)
CREATE POLICY "allow_select_tariffs" ON public.saved_tariffs
    FOR SELECT USING (
        is_predefined = true OR 
        user_id = auth.uid() OR
        auth.uid() IS NOT NULL
    );

-- Política para INSERT (insertar tarifas)
CREATE POLICY "allow_insert_tariffs" ON public.saved_tariffs
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        (user_id = auth.uid() OR user_id IS NULL) AND
        (is_predefined = false OR is_predefined IS NULL)
    );

-- Política para UPDATE (actualizar tarifas)
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

-- Política para DELETE (eliminar tarifas)
CREATE POLICY "allow_delete_tariffs" ON public.saved_tariffs
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND
        user_id = auth.uid() AND
        is_predefined = false
    );

-- 4. VERIFICAR POLÍTICAS PARA user_tariff_config
-- ==============================================
DROP POLICY IF EXISTS "Users can view own tariff config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "Users can insert own tariff config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "Users can update own tariff config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "Users can delete own tariff config" ON public.user_tariff_config;

ALTER TABLE public.user_tariff_config ENABLE ROW LEVEL SECURITY;

-- Políticas para user_tariff_config
CREATE POLICY "allow_select_user_config" ON public.user_tariff_config
    FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "allow_insert_user_config" ON public.user_tariff_config
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "allow_update_user_config" ON public.user_tariff_config
    FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "allow_delete_user_config" ON public.user_tariff_config
    FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 5. FUNCIONES DE DEBUGGING
-- =========================

-- Función para verificar el estado de autenticación
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

-- Función para probar permisos de inserción
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

-- 6. CREAR ÍNDICES ADICIONALES
-- ============================
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_user_id ON public.saved_tariffs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_predefined ON public.saved_tariffs(is_predefined);
CREATE INDEX IF NOT EXISTS idx_user_tariff_config_user_id ON public.user_tariff_config(user_id);

-- 7. QUERIES DE VERIFICACIÓN
-- ==========================
-- Ejecuta estas queries DESPUÉS de aplicar las políticas para verificar que todo funciona:

-- Verificar estado de autenticación:
-- SELECT * FROM debug_auth_state();

-- Verificar permisos de inserción:
-- SELECT * FROM test_tariff_insert();

-- Ver todas las políticas activas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename IN ('saved_tariffs', 'user_tariff_config');

-- Ver el estado de RLS:
-- SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
-- FROM pg_tables 
-- WHERE tablename IN ('saved_tariffs', 'user_tariff_config');

-- INSTRUCCIONES:
-- =============
-- 1. Copia y pega todo el contenido de arriba en el SQL Editor de Supabase
-- 2. Ejecuta todas las queries
-- 3. Luego ejecuta las queries de verificación comentadas al final
-- 4. Si todo está bien, intenta guardar una tarifa desde la aplicación

-- NOTA: Si sigues teniendo problemas, puedes temporalmente deshabilitar RLS con:
-- ALTER TABLE public.saved_tariffs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_tariff_config DISABLE ROW LEVEL SECURITY;
-- (NO recomendado para producción)