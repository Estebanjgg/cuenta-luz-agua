-- 🔍 Script de Verificación - Bandeiras Tarifárias
-- Ejecutar en Supabase SQL Editor para verificar la implementación

-- ✅ 1. Verificar que la columna tariff_flag existe
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_energy_data' 
AND column_name = 'tariff_flag';

-- Resultado esperado:
-- column_name: tariff_flag
-- data_type: character varying
-- column_default: 'GREEN'::character varying
-- is_nullable: YES

-- ✅ 2. Verificar que el constraint existe
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'check_tariff_flag';

-- Resultado esperado:
-- constraint_name: check_tariff_flag
-- check_clause: ((tariff_flag)::text = ANY ((ARRAY['GREEN'::character varying, 'YELLOW'::character varying, 'RED_LEVEL_1'::character varying, 'RED_LEVEL_2'::character varying])::text[]))

-- ✅ 3. Verificar distribución de banderas en datos existentes
SELECT 
    tariff_flag,
    COUNT(*) as total_records,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM user_energy_data 
GROUP BY tariff_flag
ORDER BY total_records DESC;

-- Resultado esperado (para datos migrados):
-- GREEN | [número] | 100.00

-- ✅ 4. Verificar que no hay valores NULL
SELECT COUNT(*) as null_tariff_flags
FROM user_energy_data 
WHERE tariff_flag IS NULL;

-- Resultado esperado: 0

-- ✅ 5. Verificar estructura completa de la tabla
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_energy_data'
ORDER BY ordinal_position;

-- ✅ 6. Probar inserción con diferentes banderas
-- NOTA: Solo ejecutar si quieres crear datos de prueba
/*
INSERT INTO user_energy_data (
    user_id,
    month,
    year,
    initial_reading,
    total_consumption,
    estimated_cost,
    tariff_flag
) VALUES 
    (auth.uid(), 'test_green', 2024, 1000, 100, 150.00, 'GREEN'),
    (auth.uid(), 'test_yellow', 2024, 1100, 120, 180.00, 'YELLOW'),
    (auth.uid(), 'test_red1', 2024, 1220, 110, 170.00, 'RED_LEVEL_1'),
    (auth.uid(), 'test_red2', 2024, 1330, 130, 200.00, 'RED_LEVEL_2');
*/

-- ✅ 7. Verificar que las políticas RLS siguen funcionando
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_energy_data';

-- ✅ 8. Probar constraint con valor inválido (debe fallar)
-- NOTA: Este comando DEBE fallar si el constraint está funcionando
/*
INSERT INTO user_energy_data (
    user_id,
    month,
    year,
    initial_reading,
    tariff_flag
) VALUES (
    auth.uid(),
    'test_invalid',
    2024,
    1000,
    'INVALID_FLAG'
);
*/

-- ✅ 9. Verificar índices existentes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_energy_data';

-- ✅ 10. Resumen final de verificación
SELECT 
    'Verificación Completa' as status,
    (
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'user_energy_data' 
        AND column_name = 'tariff_flag'
    ) as column_exists,
    (
        SELECT COUNT(*) 
        FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_tariff_flag'
    ) as constraint_exists,
    (
        SELECT COUNT(*) 
        FROM user_energy_data 
        WHERE tariff_flag IS NULL
    ) as null_values,
    (
        SELECT COUNT(DISTINCT tariff_flag) 
        FROM user_energy_data
    ) as distinct_flags;

-- Resultado esperado:
-- status: Verificación Completa
-- column_exists: 1
-- constraint_exists: 1
-- null_values: 0
-- distinct_flags: 1 (si solo hay datos migrados con GREEN)

-- 🎉 Si todos los resultados son como se esperaba, 
-- la migración fue exitosa y las banderas tarifarias están listas para usar!