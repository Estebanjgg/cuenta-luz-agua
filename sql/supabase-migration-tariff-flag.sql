-- Migración para agregar la columna tariff_flag a la tabla user_energy_data
-- Ejecutar esta migración en Supabase si ya tienes datos existentes

-- Agregar la columna tariff_flag con valor por defecto 'GREEN'
ALTER TABLE user_energy_data 
ADD COLUMN IF NOT EXISTS tariff_flag VARCHAR(20) DEFAULT 'GREEN';

-- Agregar constraint para validar los valores permitidos
ALTER TABLE user_energy_data 
ADD CONSTRAINT check_tariff_flag 
CHECK (tariff_flag IN ('GREEN', 'YELLOW', 'RED_LEVEL_1', 'RED_LEVEL_2'));

-- Actualizar registros existentes que puedan tener tariff_flag como NULL
UPDATE user_energy_data 
SET tariff_flag = 'GREEN' 
WHERE tariff_flag IS NULL;

-- Comentario: Esta migración es segura de ejecutar múltiples veces
-- gracias al uso de IF NOT EXISTS y la verificación de NULL