-- Migración para reestructurar el sistema de tarifas
-- Fecha: 2024-12-20
-- Descripción: Actualiza la estructura para separar correctamente saved_tariffs y user_tariff_config

-- 1. Verificar que las tablas existen con la estructura correcta
-- (Las tablas ya fueron creadas según el esquema proporcionado)

-- 2. Agregar índices adicionales para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_company_name ON public.saved_tariffs USING btree (company_name);
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_source_type ON public.saved_tariffs USING btree (source_type);
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_created_at ON public.saved_tariffs USING btree (created_at DESC);

-- 3. Agregar políticas RLS (Row Level Security) para saved_tariffs
ALTER TABLE public.saved_tariffs ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver tarifas predefinidas y sus propias tarifas
CREATE POLICY "Users can view predefined tariffs and own tariffs" ON public.saved_tariffs
    FOR SELECT USING (
        is_predefined = true OR 
        user_id = auth.uid()
    );

-- Política para que los usuarios puedan insertar sus propias tarifas
CREATE POLICY "Users can insert own tariffs" ON public.saved_tariffs
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND 
        is_predefined = false
    );

-- Política para que los usuarios puedan actualizar sus propias tarifas
CREATE POLICY "Users can update own tariffs" ON public.saved_tariffs
    FOR UPDATE USING (
        user_id = auth.uid() AND 
        is_predefined = false
    ) WITH CHECK (
        user_id = auth.uid() AND 
        is_predefined = false
    );

-- Política para que los usuarios puedan eliminar sus propias tarifas
CREATE POLICY "Users can delete own tariffs" ON public.saved_tariffs
    FOR DELETE USING (
        user_id = auth.uid() AND 
        is_predefined = false
    );

-- 4. Agregar políticas RLS para user_tariff_config
ALTER TABLE public.user_tariff_config ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver su propia configuración
CREATE POLICY "Users can view own tariff config" ON public.user_tariff_config
    FOR SELECT USING (user_id = auth.uid());

-- Política para que los usuarios puedan insertar su propia configuración
CREATE POLICY "Users can insert own tariff config" ON public.user_tariff_config
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Política para que los usuarios puedan actualizar su propia configuración
CREATE POLICY "Users can update own tariff config" ON public.user_tariff_config
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Política para que los usuarios puedan eliminar su propia configuración
CREATE POLICY "Users can delete own tariff config" ON public.user_tariff_config
    FOR DELETE USING (user_id = auth.uid());

-- 5. Insertar algunas tarifas predefinidas de ejemplo
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
) VALUES 
    ('CPFL Paulista - Residencial', 'CPFL Paulista', 'CPFL', 'Campinas', 'SP', 0.87234, 15.50, 41.12, 'aneel', true, null),
    ('Enel São Paulo - Residencial', 'Enel São Paulo', 'ENEL', 'São Paulo', 'SP', 0.79543, 12.30, 38.75, 'aneel', true, null),
    ('Energisa Borborema - Residencial', 'Energisa Borborema', 'ENB', 'Campina Grande', 'PB', 0.65432, 8.90, 25.60, 'aneel', true, null),
    ('Light - Residencial', 'Light Serviços de Eletricidade', 'LIGHT', 'Rio de Janeiro', 'RJ', 0.92156, 18.20, 45.30, 'aneel', true, null),
    ('Cemig - Residencial', 'Cemig Distribuição', 'CEMIG', 'Belo Horizonte', 'MG', 0.78901, 14.75, 39.80, 'aneel', true, null)
ON CONFLICT (name, company_name, state) DO NOTHING;

-- 6. Crear función para migrar datos existentes (si los hay)
CREATE OR REPLACE FUNCTION migrate_existing_tariff_data()
RETURNS void AS $$
BEGIN
    -- Esta función puede ser usada para migrar datos existentes
    -- si hay datos en otras tablas que necesiten ser movidos
    
    -- Por ejemplo, si hubiera una tabla antigua de configuraciones:
    -- INSERT INTO user_tariff_config (user_id, price_per_kwh, additional_fees, public_lighting_fee)
    -- SELECT user_id, price_per_kwh, additional_fees, public_lighting_fee
    -- FROM old_tariff_table
    -- ON CONFLICT (user_id) DO UPDATE SET
    --     price_per_kwh = EXCLUDED.price_per_kwh,
    --     additional_fees = EXCLUDED.additional_fees,
    --     public_lighting_fee = EXCLUDED.public_lighting_fee,
    --     updated_at = now();
    
    RAISE NOTICE 'Migration function executed successfully';
END;
$$ LANGUAGE plpgsql;

-- 7. Crear vista para facilitar consultas complejas
CREATE OR REPLACE VIEW user_tariff_summary AS
SELECT 
    utc.user_id,
    utc.price_per_kwh,
    utc.additional_fees,
    utc.public_lighting_fee,
    utc.updated_at as config_updated_at,
    COUNT(st.id) as saved_tariffs_count,
    MAX(st.created_at) as last_tariff_saved
FROM user_tariff_config utc
LEFT JOIN saved_tariffs st ON st.user_id = utc.user_id AND st.is_predefined = false
GROUP BY utc.user_id, utc.price_per_kwh, utc.additional_fees, utc.public_lighting_fee, utc.updated_at;

-- 8. Comentarios para documentación
COMMENT ON TABLE public.saved_tariffs IS 'Tabla para almacenar tarifas guardadas, tanto predefinidas como creadas por usuarios';
COMMENT ON TABLE public.user_tariff_config IS 'Tabla para almacenar la configuración actual de tarifa de cada usuario';
COMMENT ON VIEW user_tariff_summary IS 'Vista que resume la configuración de tarifa del usuario y sus tarifas guardadas';

-- 9. Crear función para limpiar datos huérfanos
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS void AS $$
BEGIN
    -- Eliminar tarifas guardadas de usuarios que ya no existen
    DELETE FROM saved_tariffs 
    WHERE user_id IS NOT NULL 
    AND user_id NOT IN (SELECT id FROM auth.users);
    
    -- Eliminar configuraciones de usuarios que ya no existen
    DELETE FROM user_tariff_config 
    WHERE user_id IS NOT NULL 
    AND user_id NOT IN (SELECT id FROM auth.users);
    
    RAISE NOTICE 'Orphaned data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la migración
SELECT migrate_existing_tariff_data();

-- Mensaje de finalización
DO $$
BEGIN
    RAISE NOTICE 'Tariff restructure migration completed successfully!';
    RAISE NOTICE 'Tables: saved_tariffs, user_tariff_config';
    RAISE NOTICE 'RLS policies: Enabled and configured';
    RAISE NOTICE 'Sample data: Predefined tariffs inserted';
END
$$;