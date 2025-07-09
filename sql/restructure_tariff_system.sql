-- REESTRUCTURACIÓN COMPLETA DEL SISTEMA DE TARIFAS
-- Agregar campo base_price_per_kwh y modificar la lógica de cálculo

-- 1. Agregar el nuevo campo base_price_per_kwh a la tabla tariffs
ALTER TABLE tariffs ADD COLUMN IF NOT EXISTS base_price_per_kwh DECIMAL(10, 4);

-- 2. Actualizar los registros existentes calculando la tarifa base desde price_per_kwh_green
-- Asumimos que price_per_kwh_green era la tarifa base
UPDATE tariffs 
SET base_price_per_kwh = price_per_kwh_green
WHERE base_price_per_kwh IS NULL;

-- 3. Hacer el campo obligatorio después de la migración
ALTER TABLE tariffs ALTER COLUMN base_price_per_kwh SET NOT NULL;

-- 4. Actualizar los valores de las banderas para que sean recargos sobre la base
-- Valores oficiales ANEEL 2025:
-- Verde: R$ 0.000 (sin recargo)
-- Amarilla: R$ 0.01885 por kWh
-- Roja Nivel 1: R$ 0.04463 por kWh  
-- Roja Nivel 2: R$ 0.07877 por kWh

UPDATE tariffs SET 
  price_per_kwh_green = base_price_per_kwh + 0.0000,
  price_per_kwh_yellow = base_price_per_kwh + 0.01885,
  price_per_kwh_red_1 = base_price_per_kwh + 0.04463,
  price_per_kwh_red_2 = base_price_per_kwh + 0.07877;

-- 5. Insertar/actualizar la tarifa por defecto con la nueva estructura
INSERT INTO tariffs (
  city, 
  state, 
  company_name, 
  base_price_per_kwh,
  price_per_kwh_green, 
  price_per_kwh_yellow, 
  price_per_kwh_red_1, 
  price_per_kwh_red_2, 
  additional_fees, 
  public_lighting_fee, 
  is_public
)
VALUES (
  'Bragança Paulista', 
  'SP', 
  'Energisa', 
  0.795,                    -- Tarifa base de la factura
  0.795,                    -- Verde: base + 0.000
  0.81385,                  -- Amarilla: base + 0.01885
  0.83963,                  -- Roja 1: base + 0.04463
  0.87377,                  -- Roja 2: base + 0.07877
  41.12, 
  15.00, 
  TRUE
)
ON CONFLICT (city, state, company_name, user_id) 
DO UPDATE SET 
  base_price_per_kwh = EXCLUDED.base_price_per_kwh,
  price_per_kwh_green = EXCLUDED.price_per_kwh_green,
  price_per_kwh_yellow = EXCLUDED.price_per_kwh_yellow,
  price_per_kwh_red_1 = EXCLUDED.price_per_kwh_red_1,
  price_per_kwh_red_2 = EXCLUDED.price_per_kwh_red_2,
  additional_fees = EXCLUDED.additional_fees,
  public_lighting_fee = EXCLUDED.public_lighting_fee,
  updated_at = NOW();

-- 6. Crear función para calcular automáticamente las tarifas de banderas
CREATE OR REPLACE FUNCTION calculate_flag_prices()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular automáticamente los precios de las banderas basados en la tarifa base
  NEW.price_per_kwh_green := NEW.base_price_per_kwh + 0.0000;
  NEW.price_per_kwh_yellow := NEW.base_price_per_kwh + 0.01885;
  NEW.price_per_kwh_red_1 := NEW.base_price_per_kwh + 0.04463;
  NEW.price_per_kwh_red_2 := NEW.base_price_per_kwh + 0.07877;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para calcular automáticamente las tarifas cuando se actualiza base_price_per_kwh
DROP TRIGGER IF EXISTS trigger_calculate_flag_prices ON tariffs;
CREATE TRIGGER trigger_calculate_flag_prices
  BEFORE INSERT OR UPDATE OF base_price_per_kwh ON tariffs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_flag_prices();

-- 8. Agregar comentarios para documentar la nueva estructura
COMMENT ON COLUMN tariffs.base_price_per_kwh IS 'Tarifa base por kWh que aparece en la factura (sin recargos de banderas)';
COMMENT ON COLUMN tariffs.price_per_kwh_green IS 'Precio final con bandera verde (base + R$ 0.000)';
COMMENT ON COLUMN tariffs.price_per_kwh_yellow IS 'Precio final con bandera amarilla (base + R$ 0.01885)';
COMMENT ON COLUMN tariffs.price_per_kwh_red_1 IS 'Precio final con bandera roja nivel 1 (base + R$ 0.04463)';
COMMENT ON COLUMN tariffs.price_per_kwh_red_2 IS 'Precio final con bandera roja nivel 2 (base + R$ 0.07877)';
COMMENT ON COLUMN tariffs.additional_fees IS 'Tarifas fijas mensuales (independientes del consumo)';
COMMENT ON COLUMN tariffs.public_lighting_fee IS 'Tarifa de alumbrado público mensual';

-- 9. Crear vista para facilitar consultas con información calculada
CREATE OR REPLACE VIEW tariffs_with_surcharges AS
SELECT 
  *,
  (price_per_kwh_green - base_price_per_kwh) AS green_surcharge,
  (price_per_kwh_yellow - base_price_per_kwh) AS yellow_surcharge,
  (price_per_kwh_red_1 - base_price_per_kwh) AS red_1_surcharge,
  (price_per_kwh_red_2 - base_price_per_kwh) AS red_2_surcharge
FROM tariffs;

-- 10. Crear índice para el nuevo campo
CREATE INDEX IF NOT EXISTS idx_tariffs_base_price ON tariffs(base_price_per_kwh);

-- Verificación final
SELECT 
  'Verificación de estructura actualizada' as status,
  COUNT(*) as total_tariffs,
  AVG(base_price_per_kwh) as avg_base_price,
  AVG(price_per_kwh_green) as avg_green_price,
  AVG(price_per_kwh_yellow - base_price_per_kwh) as avg_yellow_surcharge
FROM tariffs;