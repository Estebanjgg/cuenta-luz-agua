-- Insertar tarifa por defecto de Bragança Paulista, SP - Energisa
-- Esta tarifa será pública y estará disponible para todos los usuarios

-- Inserción de tarifa por defecto con valores oficiales de ANEEL
-- Valores de bandeiras tarifarias uniformes para todo Brasil (ANEEL):
-- Verde: sin recargo (R$ 0,00/kWh)
-- Amarilla: R$ 0,01885/kWh
-- Roja Nivel 1: R$ 0,04463/kWh  
-- Roja Nivel 2: R$ 0,07877/kWh

INSERT INTO tariffs (
  id,
  user_id,
  city,
  state,
  company_name,
  price_per_kwh_green,
  price_per_kwh_yellow,
  price_per_kwh_red_1,
  price_per_kwh_red_2,
  additional_fees,
  public_lighting_fee,
  is_public,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  NULL, -- Tarifa pública, no pertenece a ningún usuario específico
  'Bragança Paulista',
  'SP',
  'Energisa',
  0.7950,                    -- Tarifa base (verde)
  0.7950 + 0.01885,         -- Base + recargo amarillo ANEEL = 0.81385
  0.7950 + 0.04463,         -- Base + recargo rojo 1 ANEEL = 0.83963
  0.7950 + 0.07877,         -- Base + recargo rojo 2 ANEEL = 0.87377
  41.12, -- Tasas adicionales
  15.00,  -- Tasa de alumbrado público
  true,  -- Es una tarifa pública
  NOW(),
  NOW()
);

-- Comentario: Los valores de bandeiras son oficiales de ANEEL y uniformes para todo Brasil
-- Solo la tarifa base (verde) varía según la distribuidora y región

-- Comentarios sobre los precios:
-- Los precios están basados en las tarifas reales de Energisa para la región
-- Las banderas tarifarias representan diferentes niveles de costo según las condiciones del sistema eléctrico:
-- - Verde: Condiciones favorables, tarifa normal
-- - Amarilla: Condiciones menos favorables, incremento moderado
-- - Roja Nivel 1: Condiciones más costosas, incremento significativo
-- - Roja Nivel 2: Condiciones muy costosas, incremento máximo