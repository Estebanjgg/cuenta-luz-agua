-- Crear tabla para preferencias del usuario
-- Esta tabla almacenará configuraciones específicas del usuario como el mes seleccionado

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_month_key VARCHAR(20), -- formato: 'mes-año' ej: 'julio-2025'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para asegurar un registro por usuario
  CONSTRAINT unique_user_preferences UNIQUE(user_id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_selected_month ON user_preferences(user_id, selected_month_key);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios solo pueden ver y modificar sus propias preferencias
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Comentarios explicativos
COMMENT ON TABLE user_preferences IS 'Tabla para almacenar preferencias específicas del usuario';
COMMENT ON COLUMN user_preferences.selected_month_key IS 'Clave del mes actualmente seleccionado por el usuario (formato: mes-año)';
COMMENT ON COLUMN user_preferences.user_id IS 'ID del usuario propietario de las preferencias';
COMMENT ON COLUMN user_preferences.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN user_preferences.updated_at IS 'Fecha de última actualización del registro';