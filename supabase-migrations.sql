-- Crear tabla para datos de energía de usuarios
CREATE TABLE IF NOT EXISTS user_energy_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  initial_reading DECIMAL(10,2) NOT NULL,
  readings JSONB DEFAULT '[]'::jsonb,
  total_consumption DECIMAL(10,2) DEFAULT 0,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Crear tabla para configuración de tarifas de usuarios
CREATE TABLE IF NOT EXISTS user_tariff_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  price_per_kwh DECIMAL(10,4) NOT NULL DEFAULT 0.795,
  additional_fees DECIMAL(10,2) DEFAULT 41.12,
  public_lighting_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_energy_data_user_id ON user_energy_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_energy_data_month_year ON user_energy_data(month, year);
CREATE INDEX IF NOT EXISTS idx_user_tariff_config_user_id ON user_tariff_config(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_energy_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tariff_config ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para user_energy_data
CREATE POLICY "Users can view their own energy data" ON user_energy_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy data" ON user_energy_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy data" ON user_energy_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own energy data" ON user_energy_data
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de seguridad para user_tariff_config
CREATE POLICY "Users can view their own tariff config" ON user_tariff_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tariff config" ON user_tariff_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tariff config" ON user_tariff_config
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tariff config" ON user_tariff_config
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_user_energy_data_updated_at
  BEFORE UPDATE ON user_energy_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tariff_config_updated_at
  BEFORE UPDATE ON user_tariff_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();