-- 1. Crear la nueva tabla de tarifas (tariffs)
CREATE TABLE IF NOT EXISTS tariffs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Puede ser nulo para tarifas del sistema
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  company_name VARCHAR(100) NOT NULL,
  price_per_kwh_green DECIMAL(10, 4) NOT NULL,       -- Tarifa para consumo normal (antes GREEN)
  price_per_kwh_yellow DECIMAL(10, 4) NOT NULL,      -- Tarifa para bandera amarilla
  price_per_kwh_red_1 DECIMAL(10, 4) NOT NULL,       -- Tarifa para bandera roja nivel 1
  price_per_kwh_red_2 DECIMAL(10, 4) NOT NULL,       -- Tarifa para bandera roja nivel 2
  additional_fees DECIMAL(10, 2) DEFAULT 0,
  public_lighting_fee DECIMAL(10, 2) DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(city, state, company_name, user_id) -- Evitar duplicados por usuario
);

-- 2. Crear la tabla que relaciona al usuario, el mes y la tarifa
CREATE TABLE IF NOT EXISTS user_monthly_tariffs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  energy_data_id UUID REFERENCES user_energy_data(id) ON DELETE CASCADE,
  tariff_id UUID REFERENCES tariffs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, energy_data_id)
);

-- 3. Modificar la tabla user_energy_data para eliminar tariff_flag
-- Nota: Asegúrate de haber migrado la lógica en tu aplicación antes de eliminar esta columna.
ALTER TABLE user_energy_data DROP COLUMN IF EXISTS tariff_flag;

-- 4. Insertar la tarifa por defecto de Bragança Paulista como una tarifa pública del sistema
-- (los valores de kwh son ejemplos, ajústalos a los correctos)
INSERT INTO tariffs (city, state, company_name, price_per_kwh_green, price_per_kwh_yellow, price_per_kwh_red_1, price_per_kwh_red_2, additional_fees, public_lighting_fee, is_public)
VALUES ('Bragança Paulista', 'SP', 'Energisa', 0.795, 0.815, 0.835, 0.855, 41.12, 15.00, TRUE)
ON CONFLICT (city, state, company_name, user_id) DO NOTHING;

-- 5. Políticas de seguridad para las nuevas tablas

-- Políticas para `tariffs`
ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public tariffs" ON tariffs
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view their own tariffs" ON tariffs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tariffs" ON tariffs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tariffs" ON tariffs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tariffs" ON tariffs
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para `user_monthly_tariffs`
ALTER TABLE user_monthly_tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own monthly tariffs" ON user_monthly_tariffs
  FOR ALL USING (auth.uid() = user_id);


-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tariffs_user_id ON tariffs(user_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_public ON tariffs(is_public);
CREATE INDEX IF NOT EXISTS idx_user_monthly_tariffs_user_id ON user_monthly_tariffs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_monthly_tariffs_energy_data_id ON user_monthly_tariffs(energy_data_id);

-- Triggers para actualizar 'updated_at'
CREATE TRIGGER update_tariffs_updated_at
  BEFORE UPDATE ON tariffs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();