-- Crear tabla para tarifas guardadas/predefinidas
CREATE TABLE IF NOT EXISTS saved_tariffs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL, -- Nombre descriptivo de la tarifa
  company_name VARCHAR(255) NOT NULL, -- Nombre de la compañía eléctrica
  company_code VARCHAR(50), -- Código/sigla de la compañía
  city VARCHAR(255), -- Ciudad (ej: Bragança Paulista)
  state VARCHAR(2) NOT NULL, -- Estado (ej: SP)
  price_per_kwh DECIMAL(10,6) NOT NULL, -- Tarifa por kWh
  public_lighting_fee DECIMAL(10,2) DEFAULT 0, -- Taxa de iluminação pública
  additional_fees DECIMAL(10,2) DEFAULT 0, -- Taxas adicionais
  source_type VARCHAR(50) DEFAULT 'manual', -- 'manual', 'aneel', 'invoice'
  is_predefined BOOLEAN DEFAULT false, -- Si es una tarifa predefinida del sistema
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Usuario que creó la tarifa (NULL para predefinidas)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_user_id ON saved_tariffs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_state ON saved_tariffs(state);
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_city ON saved_tariffs(city);
CREATE INDEX IF NOT EXISTS idx_saved_tariffs_predefined ON saved_tariffs(is_predefined);

-- Insertar tarifa predefinida de Bragança Paulista
INSERT INTO saved_tariffs (
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
  'CPFL Paulista - Bragança Paulista',
  'CPFL Paulista',
  'CPFL',
  'Bragança Paulista',
  'SP',
  0.795,
  15.50,
  41.12,
  'invoice',
  true,
  NULL
) ON CONFLICT DO NOTHING;

-- Política de seguridad: usuarios pueden ver tarifas predefinidas y sus propias tarifas
CREATE POLICY "Users can view predefined tariffs and own tariffs" ON saved_tariffs
  FOR SELECT USING (
    is_predefined = true OR 
    auth.uid() = user_id
  );

-- Política de seguridad: usuarios pueden insertar sus propias tarifas
CREATE POLICY "Users can insert own tariffs" ON saved_tariffs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    is_predefined = false
  );

-- Política de seguridad: usuarios pueden actualizar sus propias tarifas
CREATE POLICY "Users can update own tariffs" ON saved_tariffs
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    is_predefined = false
  );

-- Política de seguridad: usuarios pueden eliminar sus propias tarifas
CREATE POLICY "Users can delete own tariffs" ON saved_tariffs
  FOR DELETE USING (
    auth.uid() = user_id AND 
    is_predefined = false
  );

-- Habilitar RLS
ALTER TABLE saved_tariffs ENABLE ROW LEVEL SECURITY;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_saved_tariffs_updated_at 
  BEFORE UPDATE ON saved_tariffs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();