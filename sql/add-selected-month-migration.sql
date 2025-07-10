-- Migración para agregar columna selected_month_key a user_energy_data
-- Esta columna almacenará el mes actualmente seleccionado por el usuario

-- Agregar la nueva columna
ALTER TABLE user_energy_data 
ADD COLUMN selected_month_key VARCHAR(20);

-- Crear índice para mejorar el rendimiento de consultas
CREATE INDEX idx_user_energy_data_selected_month 
ON user_energy_data(user_id, selected_month_key);

-- Comentario explicativo
COMMENT ON COLUMN user_energy_data.selected_month_key IS 'Clave del mes actualmente seleccionado por el usuario (formato: mes-año)';

-- Opcional: Establecer el mes actual como seleccionado para usuarios existentes
-- UPDATE user_energy_data 
-- SET selected_month_key = month || '-' || year 
-- WHERE selected_month_key IS NULL 
-- AND (month, year) = (SELECT month, year FROM user_energy_data WHERE user_id = user_energy_data.user_id ORDER BY year DESC, 
--   CASE month 
--     WHEN 'enero' THEN 1 WHEN 'febrero' THEN 2 WHEN 'marzo' THEN 3 
--     WHEN 'abril' THEN 4 WHEN 'mayo' THEN 5 WHEN 'junio' THEN 6 
--     WHEN 'julio' THEN 7 WHEN 'agosto' THEN 8 WHEN 'septiembre' THEN 9 
--     WHEN 'octubre' THEN 10 WHEN 'noviembre' THEN 11 WHEN 'diciembre' THEN 12 
--   END DESC LIMIT 1);