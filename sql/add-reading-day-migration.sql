-- Migración para agregar el campo reading_day a la tabla user_energy_data
-- Esta migración agrega el día del mes en que se realizó la medición inicial

-- Agregar la columna reading_day
ALTER TABLE user_energy_data 
ADD COLUMN IF NOT EXISTS reading_day INTEGER DEFAULT 1 CHECK (reading_day >= 1 AND reading_day <= 31);

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN user_energy_data.reading_day IS 'Día del mes en que se realizó la medición inicial (1-31)';

-- Actualizar registros existentes para que tengan reading_day = 1 por defecto
UPDATE user_energy_data 
SET reading_day = 1 
WHERE reading_day IS NULL;

-- Hacer el campo NOT NULL después de actualizar los registros existentes
ALTER TABLE user_energy_data 
ALTER COLUMN reading_day SET NOT NULL;