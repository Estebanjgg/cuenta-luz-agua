# 🚨 MIGRACIÓN URGENTE REQUERIDA

## Problema
La aplicación está fallando porque la columna `tariff_flag` no existe en la tabla `user_energy_data` de Supabase.

## Solución
Ejecuta el siguiente SQL en el **SQL Editor** de Supabase:

### 1. Ve a tu proyecto en Supabase
- Abre https://supabase.com/dashboard
- Selecciona tu proyecto
- Ve a "SQL Editor" en el menú lateral

### 2. Ejecuta esta migración

```sql
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
```

### 3. Después de ejecutar la migración

1. **Descomenta las líneas en el código:**
   - En `app/hooks/useSupabaseEnergyData.ts` línea ~77: descomenta `tariffFlag: record.tariff_flag || 'GREEN'`
   - En `app/hooks/useSupabaseEnergyData.ts` línea ~130: descomenta `tariff_flag: monthData.tariffFlag || 'GREEN',`

2. **Reinicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## Verificación
Después de ejecutar la migración, puedes verificar que funcionó ejecutando:

```sql
-- Verificar que la columna existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_energy_data' 
AND column_name = 'tariff_flag';

-- Verificar los datos
SELECT tariff_flag, COUNT(*) 
FROM user_energy_data 
GROUP BY tariff_flag;
```

## Estado Actual
- ✅ Código temporalmente modificado para evitar errores
- ⏳ Migración pendiente de ejecutar
- ⏳ Descomentado de líneas pendiente

**IMPORTANTE:** La funcionalidad de cambio de banderas tarifarias estará limitada hasta que se complete esta migración.