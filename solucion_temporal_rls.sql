-- SOLUCIÓN TEMPORAL PARA EL PROBLEMA DE RLS
-- ==========================================
-- USAR SOLO SI LAS POLÍTICAS RLS NO FUNCIONAN
-- Esta es una solución temporal que deshabilita RLS para permitir el funcionamiento
-- NO recomendado para producción, pero útil para desarrollo y testing

-- OPCIÓN 1: DESHABILITAR RLS COMPLETAMENTE (MÁS SIMPLE)
-- =====================================================

-- Deshabilitar RLS en ambas tablas
ALTER TABLE public.saved_tariffs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tariff_config DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('saved_tariffs', 'user_tariff_config');

-- OPCIÓN 2: POLÍTICAS MUY PERMISIVAS (MÁS SEGURO)
-- ===============================================
-- Si prefieres mantener RLS pero con políticas muy permisivas:

/*
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "allow_select_tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "allow_insert_tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "allow_update_tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "allow_delete_tariffs" ON public.saved_tariffs;

-- Habilitar RLS
ALTER TABLE public.saved_tariffs ENABLE ROW LEVEL SECURITY;

-- Crear políticas muy permisivas para saved_tariffs
CREATE POLICY "permissive_select" ON public.saved_tariffs FOR SELECT USING (true);
CREATE POLICY "permissive_insert" ON public.saved_tariffs FOR INSERT WITH CHECK (true);
CREATE POLICY "permissive_update" ON public.saved_tariffs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "permissive_delete" ON public.saved_tariffs FOR DELETE USING (true);

-- Hacer lo mismo para user_tariff_config
DROP POLICY IF EXISTS "allow_select_user_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "allow_insert_user_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "allow_update_user_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "allow_delete_user_config" ON public.user_tariff_config;

ALTER TABLE public.user_tariff_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissive_select_config" ON public.user_tariff_config FOR SELECT USING (true);
CREATE POLICY "permissive_insert_config" ON public.user_tariff_config FOR INSERT WITH CHECK (true);
CREATE POLICY "permissive_update_config" ON public.user_tariff_config FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "permissive_delete_config" ON public.user_tariff_config FOR DELETE USING (true);
*/

-- OPCIÓN 3: VERIFICAR Y CORREGIR PROBLEMAS ESPECÍFICOS
-- ====================================================

-- Si el problema es que auth.uid() no funciona, puedes crear políticas que no dependan de él:
/*
-- Para desarrollo, permitir operaciones sin verificar usuario
CREATE POLICY "dev_allow_all" ON public.saved_tariffs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_config" ON public.user_tariff_config FOR ALL USING (true) WITH CHECK (true);
*/

-- VERIFICACIÓN DESPUÉS DE APLICAR LA SOLUCIÓN
-- ===========================================

-- Verificar que las tablas son accesibles
SELECT COUNT(*) as total_saved_tariffs FROM public.saved_tariffs;
SELECT COUNT(*) as total_user_configs FROM public.user_tariff_config;

-- Probar inserción de prueba
/*
INSERT INTO public.saved_tariffs (
    name,
    company_name,
    company_code,
    city,
    state,
    price_per_kwh,
    public_lighting_fee,
    additional_fees,
    source_type,
    is_predefined,
    user_id
) VALUES (
    'Test Tariff - Temporal',
    'Test Company',
    'TEST',
    'Test City',
    'SP',
    0.80,
    15.0,
    40.0,
    'manual',
    false,
    '00000000-0000-0000-0000-000000000000'  -- UUID temporal
) RETURNING id, name;
*/

-- PARA REVERTIR LA SOLUCIÓN TEMPORAL (CUANDO TENGAS LAS POLÍTICAS CORRECTAS)
-- ==========================================================================

/*
-- Eliminar datos de prueba
DELETE FROM public.saved_tariffs WHERE name LIKE '%Test%' OR name LIKE '%Temporal%';

-- Volver a habilitar RLS
ALTER TABLE public.saved_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tariff_config ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas permisivas
DROP POLICY IF EXISTS "permissive_select" ON public.saved_tariffs;
DROP POLICY IF EXISTS "permissive_insert" ON public.saved_tariffs;
DROP POLICY IF EXISTS "permissive_update" ON public.saved_tariffs;
DROP POLICY IF EXISTS "permissive_delete" ON public.saved_tariffs;
DROP POLICY IF EXISTS "dev_allow_all" ON public.saved_tariffs;

DROP POLICY IF EXISTS "permissive_select_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "permissive_insert_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "permissive_update_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "permissive_delete_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "dev_allow_all_config" ON public.user_tariff_config;

-- Luego aplicar las políticas correctas desde queries_para_ejecutar.sql
*/

-- NOTAS IMPORTANTES:
-- ==================
-- 1. Esta es una solución TEMPORAL para desarrollo
-- 2. NO uses esto en producción sin políticas de seguridad adecuadas
-- 3. Una vez que funcione, implementa las políticas RLS correctas
-- 4. Siempre haz backup antes de modificar políticas de seguridad
-- 5. Considera usar la OPCIÓN 1 (deshabilitar RLS) para desarrollo rápido
-- 6. Para producción, usa políticas RLS apropiadas que verifiquen auth.uid()