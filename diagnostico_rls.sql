-- QUERIES DE DIAGNÓSTICO PARA EL PROBLEMA DE RLS
-- Ejecuta estas queries para diagnosticar el problema paso a paso
-- ==============================================================

-- 1. VERIFICAR ESTADO ACTUAL DE LAS TABLAS
-- ========================================

-- Ver si las tablas existen y tienen RLS habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled, 
    forcerowsecurity as force_rls
FROM pg_tables 
WHERE tablename IN ('saved_tariffs', 'user_tariff_config')
ORDER BY tablename;

-- 2. VER POLÍTICAS ACTUALES
-- =========================

-- Ver todas las políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename IN ('saved_tariffs', 'user_tariff_config')
ORDER BY tablename, policyname;

-- 3. VERIFICAR ESTRUCTURA DE LAS TABLAS
-- =====================================

-- Ver columnas de saved_tariffs
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'saved_tariffs' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver columnas de user_tariff_config
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_tariff_config' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTADO DE AUTENTICACIÓN
-- ====================================

-- Verificar si auth.uid() funciona (ejecutar cuando estés logueado)
SELECT 
    auth.uid() as current_user_id,
    (auth.uid() IS NOT NULL) as is_authenticated,
    auth.jwt() ->> 'role' as user_role,
    auth.jwt() ->> 'email' as user_email;

-- 5. PROBAR INSERCIÓN MANUAL
-- ==========================

-- Intenta insertar una tarifa de prueba (ejecutar cuando estés logueado)
-- NOTA: Reemplaza 'TU_USER_ID_AQUI' con tu ID real de usuario
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
    'Tarifa de Prueba',
    'Empresa Test',
    'TEST',
    'Ciudad Test',
    'SP',
    0.75,
    10.0,
    30.0,
    'manual',
    false,
    auth.uid()  -- Esto debería usar tu ID de usuario actual
);
*/

-- 6. VER DATOS EXISTENTES
-- =======================

-- Ver tarifas predefinidas
SELECT 
    id,
    name,
    company_name,
    state,
    is_predefined,
    user_id,
    created_at
FROM public.saved_tariffs 
WHERE is_predefined = true
ORDER BY created_at DESC;

-- Ver tarifas de usuario (si las hay)
SELECT 
    id,
    name,
    company_name,
    state,
    is_predefined,
    user_id,
    created_at
FROM public.saved_tariffs 
WHERE is_predefined = false
ORDER BY created_at DESC;

-- Ver configuraciones de usuario
SELECT 
    user_id,
    price_per_kwh,
    additional_fees,
    public_lighting_fee,
    updated_at
FROM public.user_tariff_config
ORDER BY updated_at DESC;

-- 7. VERIFICAR PERMISOS DE USUARIO
-- ================================

-- Ver roles del usuario actual
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles 
WHERE rolname = current_user;

-- 8. QUERIES DE LIMPIEZA (SI ES NECESARIO)
-- ========================================

-- Eliminar todas las políticas RLS (usar solo si necesitas empezar de cero)
/*
DROP POLICY IF EXISTS "allow_select_tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "allow_insert_tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "allow_update_tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "allow_delete_tariffs" ON public.saved_tariffs;
DROP POLICY IF EXISTS "allow_select_user_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "allow_insert_user_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "allow_update_user_config" ON public.user_tariff_config;
DROP POLICY IF EXISTS "allow_delete_user_config" ON public.user_tariff_config;
*/

-- Deshabilitar RLS temporalmente (usar solo para testing)
/*
ALTER TABLE public.saved_tariffs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tariff_config DISABLE ROW LEVEL SECURITY;
*/

-- INSTRUCCIONES DE USO:
-- ====================
-- 1. Ejecuta las queries de la sección 1-4 para ver el estado actual
-- 2. Si ves que no hay políticas o RLS está deshabilitado, ejecuta queries_para_ejecutar.sql
-- 3. Si auth.uid() devuelve NULL, el problema es de autenticación
-- 4. Si todo parece correcto pero sigue fallando, intenta la inserción manual de la sección 5
-- 5. Usa las queries de limpieza solo si necesitas empezar de cero