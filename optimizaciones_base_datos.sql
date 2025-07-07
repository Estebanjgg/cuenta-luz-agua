-- 🚀 Optimizaciones de Base de Datos para Sistema de Tarifas
-- Ejecutar después de aplicar las políticas RLS

-- ============================================================================
-- 📊 ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================================================

-- Índice compuesto para consultas frecuentes de tarifas por usuario
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_tariffs_user_predefined 
ON saved_tariffs (user_id, is_predefined, created_at DESC) 
WHERE is_predefined = false;

-- Índice para búsquedas por estado y empresa
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_tariffs_location 
ON saved_tariffs (state, company_name) 
WHERE is_predefined = true;

-- Índice para búsqueda de texto completo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_tariffs_search 
ON saved_tariffs USING gin(to_tsvector('spanish', name || ' ' || company_name || ' ' || city));

-- Índice para configuración de usuario activa
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_tariff_config_active 
ON user_tariff_config (user_id, updated_at DESC);

-- Índice parcial para tarifas predefinidas activas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_tariffs_predefined_active 
ON saved_tariffs (state, company_name, created_at DESC) 
WHERE is_predefined = true;

-- ============================================================================
-- 🧹 FUNCIONES DE LIMPIEZA Y MANTENIMIENTO
-- ============================================================================

-- Función para limpiar tarifas huérfanas (sin usuario activo)
CREATE OR REPLACE FUNCTION cleanup_orphaned_tariffs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar tarifas de usuarios que no han estado activos en 6 meses
    DELETE FROM saved_tariffs 
    WHERE is_predefined = false 
      AND user_id NOT IN (
          SELECT DISTINCT user_id 
          FROM user_tariff_config 
          WHERE updated_at > NOW() - INTERVAL '6 months'
      )
      AND created_at < NOW() - INTERVAL '3 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Eliminadas % tarifas huérfanas', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar configuraciones antiguas
CREATE OR REPLACE FUNCTION cleanup_old_configs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mantener solo la configuración más reciente por usuario
    WITH ranked_configs AS (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
        FROM user_tariff_config
    )
    DELETE FROM user_tariff_config 
    WHERE id IN (
        SELECT id FROM ranked_configs WHERE rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Eliminadas % configuraciones antiguas', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 📈 FUNCIONES DE ESTADÍSTICAS Y MONITOREO
-- ============================================================================

-- Función para obtener estadísticas del sistema
CREATE OR REPLACE FUNCTION get_tariff_stats()
RETURNS TABLE (
    total_users INTEGER,
    total_saved_tariffs INTEGER,
    predefined_tariffs INTEGER,
    user_tariffs INTEGER,
    active_configs INTEGER,
    avg_tariffs_per_user NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT user_id) FROM user_tariff_config)::INTEGER as total_users,
        (SELECT COUNT(*) FROM saved_tariffs)::INTEGER as total_saved_tariffs,
        (SELECT COUNT(*) FROM saved_tariffs WHERE is_predefined = true)::INTEGER as predefined_tariffs,
        (SELECT COUNT(*) FROM saved_tariffs WHERE is_predefined = false)::INTEGER as user_tariffs,
        (SELECT COUNT(*) FROM user_tariff_config WHERE updated_at > NOW() - INTERVAL '30 days')::INTEGER as active_configs,
        (SELECT ROUND(AVG(tariff_count), 2) 
         FROM (
             SELECT COUNT(*) as tariff_count 
             FROM saved_tariffs 
             WHERE is_predefined = false 
             GROUP BY user_id
         ) subq) as avg_tariffs_per_user;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tarifas más utilizadas
CREATE OR REPLACE FUNCTION get_popular_tariffs(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    tariff_name TEXT,
    company_name TEXT,
    state TEXT,
    usage_count BIGINT,
    avg_price NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.name as tariff_name,
        st.company_name,
        st.state,
        COUNT(utc.user_id) as usage_count,
        ROUND((st.config->>'pricePerKwh')::NUMERIC, 4) as avg_price
    FROM saved_tariffs st
    LEFT JOIN user_tariff_config utc ON utc.config = st.config
    WHERE st.is_predefined = true
    GROUP BY st.id, st.name, st.company_name, st.state, st.config
    ORDER BY usage_count DESC, st.name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🔍 FUNCIONES DE BÚSQUEDA AVANZADA
-- ============================================================================

-- Función para búsqueda inteligente de tarifas
CREATE OR REPLACE FUNCTION search_tariffs(
    search_term TEXT,
    user_state TEXT DEFAULT NULL,
    max_price NUMERIC DEFAULT NULL,
    include_user_tariffs BOOLEAN DEFAULT false,
    requesting_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    company_name TEXT,
    state TEXT,
    city TEXT,
    price_per_kwh NUMERIC,
    is_predefined BOOLEAN,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.id,
        st.name,
        st.company_name,
        st.state,
        st.city,
        ROUND((st.config->>'pricePerKwh')::NUMERIC, 4) as price_per_kwh,
        st.is_predefined,
        ts_rank(to_tsvector('spanish', st.name || ' ' || st.company_name || ' ' || st.city), 
                plainto_tsquery('spanish', search_term)) as relevance_score
    FROM saved_tariffs st
    WHERE 
        -- Filtro de texto
        (search_term IS NULL OR 
         to_tsvector('spanish', st.name || ' ' || st.company_name || ' ' || st.city) @@ 
         plainto_tsquery('spanish', search_term))
        -- Filtro de estado
        AND (user_state IS NULL OR st.state = user_state)
        -- Filtro de precio
        AND (max_price IS NULL OR (st.config->>'pricePerKwh')::NUMERIC <= max_price)
        -- Filtro de visibilidad
        AND (
            st.is_predefined = true OR 
            (include_user_tariffs = true AND st.user_id = requesting_user_id)
        )
    ORDER BY 
        relevance_score DESC,
        st.is_predefined DESC,
        st.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ⚡ FUNCIONES DE OPTIMIZACIÓN AUTOMÁTICA
-- ============================================================================

-- Función para recomendar tarifas similares
CREATE OR REPLACE FUNCTION recommend_similar_tariffs(
    base_config JSONB,
    user_state TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    company_name TEXT,
    state TEXT,
    price_per_kwh NUMERIC,
    price_difference NUMERIC,
    similarity_score NUMERIC
) AS $$
DECLARE
    base_price NUMERIC;
BEGIN
    base_price := (base_config->>'pricePerKwh')::NUMERIC;
    
    RETURN QUERY
    SELECT 
        st.id,
        st.name,
        st.company_name,
        st.state,
        ROUND((st.config->>'pricePerKwh')::NUMERIC, 4) as price_per_kwh,
        ROUND((st.config->>'pricePerKwh')::NUMERIC - base_price, 4) as price_difference,
        ROUND(
            100 - ABS((st.config->>'pricePerKwh')::NUMERIC - base_price) * 100 / base_price,
            2
        ) as similarity_score
    FROM saved_tariffs st
    WHERE 
        st.is_predefined = true
        AND (user_state IS NULL OR st.state = user_state)
        AND ABS((st.config->>'pricePerKwh')::NUMERIC - base_price) <= base_price * 0.3 -- 30% de diferencia máxima
    ORDER BY 
        ABS((st.config->>'pricePerKwh')::NUMERIC - base_price),
        st.name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🔧 TRIGGERS PARA MANTENIMIENTO AUTOMÁTICO
-- ============================================================================

-- Trigger para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a user_tariff_config
DROP TRIGGER IF EXISTS update_user_tariff_config_updated_at ON user_tariff_config;
CREATE TRIGGER update_user_tariff_config_updated_at
    BEFORE UPDATE ON user_tariff_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para validar configuración JSON
CREATE OR REPLACE FUNCTION validate_tariff_config()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que pricePerKwh existe y es válido
    IF NEW.config->>'pricePerKwh' IS NULL OR 
       (NEW.config->>'pricePerKwh')::NUMERIC <= 0 OR 
       (NEW.config->>'pricePerKwh')::NUMERIC > 10 THEN
        RAISE EXCEPTION 'pricePerKwh debe estar entre 0.01 y 10.00';
    END IF;
    
    -- Validar tarifas adicionales si existen
    IF NEW.config->>'additionalFees' IS NOT NULL AND 
       (NEW.config->>'additionalFees')::NUMERIC < 0 THEN
        RAISE EXCEPTION 'additionalFees no puede ser negativo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de validación
DROP TRIGGER IF EXISTS validate_saved_tariffs_config ON saved_tariffs;
CREATE TRIGGER validate_saved_tariffs_config
    BEFORE INSERT OR UPDATE ON saved_tariffs
    FOR EACH ROW
    EXECUTE FUNCTION validate_tariff_config();

DROP TRIGGER IF EXISTS validate_user_tariff_config_config ON user_tariff_config;
CREATE TRIGGER validate_user_tariff_config_config
    BEFORE INSERT OR UPDATE ON user_tariff_config
    FOR EACH ROW
    EXECUTE FUNCTION validate_tariff_config();

-- ============================================================================
-- 📋 VISTAS PARA CONSULTAS FRECUENTES
-- ============================================================================

-- Vista para tarifas predefinidas con estadísticas
CREATE OR REPLACE VIEW predefined_tariffs_with_stats AS
SELECT 
    st.*,
    COUNT(utc.user_id) as usage_count,
    ROUND((st.config->>'pricePerKwh')::NUMERIC, 4) as price_per_kwh,
    ROUND((st.config->>'additionalFees')::NUMERIC, 2) as additional_fees
FROM saved_tariffs st
LEFT JOIN user_tariff_config utc ON utc.config = st.config
WHERE st.is_predefined = true
GROUP BY st.id, st.name, st.company_name, st.state, st.city, st.config, st.created_at, st.updated_at, st.user_id, st.is_predefined
ORDER BY usage_count DESC, st.state, st.company_name;

-- Vista para configuraciones activas de usuarios
CREATE OR REPLACE VIEW active_user_configs AS
SELECT 
    utc.*,
    ROUND((utc.config->>'pricePerKwh')::NUMERIC, 4) as price_per_kwh,
    ROUND((utc.config->>'additionalFees')::NUMERIC, 2) as additional_fees,
    CASE 
        WHEN utc.updated_at > NOW() - INTERVAL '7 days' THEN 'recent'
        WHEN utc.updated_at > NOW() - INTERVAL '30 days' THEN 'active'
        ELSE 'inactive'
    END as activity_status
FROM user_tariff_config utc
ORDER BY utc.updated_at DESC;

-- ============================================================================
-- 🚀 SCRIPT DE MANTENIMIENTO PROGRAMADO
-- ============================================================================

-- Función principal de mantenimiento (ejecutar semanalmente)
CREATE OR REPLACE FUNCTION weekly_maintenance()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    orphaned_count INTEGER;
    old_configs_count INTEGER;
BEGIN
    -- Limpiar tarifas huérfanas
    SELECT cleanup_orphaned_tariffs() INTO orphaned_count;
    result := result || 'Tarifas huérfanas eliminadas: ' || orphaned_count || E'\n';
    
    -- Limpiar configuraciones antiguas
    SELECT cleanup_old_configs() INTO old_configs_count;
    result := result || 'Configuraciones antiguas eliminadas: ' || old_configs_count || E'\n';
    
    -- Actualizar estadísticas de tablas
    ANALYZE saved_tariffs;
    ANALYZE user_tariff_config;
    result := result || 'Estadísticas de tablas actualizadas' || E'\n';
    
    -- Reindexar si es necesario
    REINDEX INDEX CONCURRENTLY idx_saved_tariffs_search;
    result := result || 'Índices de búsqueda reindexados' || E'\n';
    
    result := result || 'Mantenimiento completado: ' || NOW();
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 📊 CONSULTAS DE EJEMPLO PARA VERIFICAR OPTIMIZACIONES
-- ============================================================================

-- Verificar estadísticas del sistema
-- SELECT * FROM get_tariff_stats();

-- Ver tarifas más populares
-- SELECT * FROM get_popular_tariffs(5);

-- Buscar tarifas
-- SELECT * FROM search_tariffs('CEMIG', 'MG', 1.0, false, NULL);

-- Obtener recomendaciones
-- SELECT * FROM recommend_similar_tariffs('{"pricePerKwh": 0.85}'::jsonb, 'MG', 3);

-- Ejecutar mantenimiento
-- SELECT weekly_maintenance();

-- Verificar rendimiento de índices
-- SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE tablename IN ('saved_tariffs', 'user_tariff_config')
-- ORDER BY idx_tup_read DESC;

-- ============================================================================
-- ✅ SCRIPT COMPLETADO
-- ============================================================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '🚀 Optimizaciones de base de datos aplicadas exitosamente!';
    RAISE NOTICE '📊 Índices creados para mejorar performance';
    RAISE NOTICE '🧹 Funciones de limpieza configuradas';
    RAISE NOTICE '📈 Funciones de estadísticas disponibles';
    RAISE NOTICE '🔍 Búsqueda avanzada implementada';
    RAISE NOTICE '⚡ Triggers de validación activados';
    RAISE NOTICE '📋 Vistas de consulta creadas';
    RAISE NOTICE '';
    RAISE NOTICE 'Ejecuta SELECT weekly_maintenance(); para mantenimiento';
    RAISE NOTICE 'Ejecuta SELECT * FROM get_tariff_stats(); para estadísticas';
END $$;