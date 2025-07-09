# 📅 Migración: Campo Día de Medición

## 🎯 Objetivo
Esta migración agrega la funcionalidad para registrar el **día específico del mes** en que se realizó la medición inicial, permitiendo un seguimiento más preciso de las lecturas de energía.

## 🔧 Cambios Realizados

### 1. **Base de Datos**
- ✅ Agregado campo `reading_day` a la tabla `user_energy_data`
- ✅ Tipo: `INTEGER` con validación (1-31)
- ✅ Valor por defecto: `1`
- ✅ Restricción: `CHECK (reading_day >= 1 AND reading_day <= 31)`

### 2. **Tipos TypeScript**
- ✅ Actualizada interfaz `MonthData` en `app/types/index.ts`
- ✅ Agregado campo opcional `readingDay?: number`
- ✅ Actualizada interfaz `Database` en `app/lib/supabase.ts`

### 3. **Componentes UI**
- ✅ **MonthSelector**: Campo "Día de medición" en modal de nuevo período
- ✅ **PeriodNavigator**: Campo "Día de medición" en modal de nuevo período
- ✅ Validación de entrada (1-31 días)
- ✅ Valor por defecto: día 1

### 4. **Hooks y Lógica**
- ✅ **useSupabaseEnergyData**: Soporte para `readingDay` en todas las operaciones
- ✅ **useEnergyData**: Soporte para `readingDay` (modo local)
- ✅ Funciones `changeMonth` actualizadas para aceptar parámetro opcional
- ✅ Funciones `saveMonthData` y `loadUserData` actualizadas

## 📋 Archivos de Migración

### SQL Migration
```sql
-- Archivo: sql/add-reading-day-migration.sql
ALTER TABLE user_energy_data 
ADD COLUMN IF NOT EXISTS reading_day INTEGER DEFAULT 1 
CHECK (reading_day >= 1 AND reading_day <= 31);

UPDATE user_energy_data 
SET reading_day = 1 
WHERE reading_day IS NULL;

ALTER TABLE user_energy_data 
ALTER COLUMN reading_day SET NOT NULL;
```

## 🚀 Instrucciones de Despliegue

### 1. **Ejecutar Migración SQL**
```bash
# En Supabase Dashboard > SQL Editor
# Ejecutar el contenido de: sql/add-reading-day-migration.sql
```

### 2. **Verificar Migración**
```sql
-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_energy_data' 
AND column_name = 'reading_day';

-- Verificar datos existentes
SELECT id, month, year, reading_day 
FROM user_energy_data 
LIMIT 5;
```

### 3. **Desplegar Código**
```bash
# Desplegar la aplicación con los cambios
npm run build
npm run deploy
```

## 🔍 Compatibilidad

### ✅ **Retrocompatibilidad**
- Los registros existentes tendrán `reading_day = 1` por defecto
- La aplicación funciona sin problemas con datos antiguos
- El campo es opcional en las interfaces TypeScript

### ✅ **Migración Segura**
- No se pierden datos existentes
- La migración es reversible
- Validaciones previenen datos inválidos

## 🎨 Beneficios para el Usuario

1. **📊 Métricas Más Precisas**
   - Cálculo exacto de días transcurridos
   - Mejor estimación de consumo diario

2. **📅 Seguimiento Detallado**
   - Registro del día exacto de medición
   - Historial más completo

3. **🔧 Flexibilidad**
   - Adaptable a diferentes ciclos de facturación
   - Personalizable según necesidades del usuario

## 🛠️ Rollback (Si es necesario)

```sql
-- Para revertir la migración (CUIDADO: Esto eliminará los datos del campo)
ALTER TABLE user_energy_data DROP COLUMN IF EXISTS reading_day;
```

## 📝 Notas Técnicas

- **Rendimiento**: El nuevo campo no afecta significativamente el rendimiento
- **Almacenamiento**: Incremento mínimo en el tamaño de la base de datos
- **Índices**: No se requieren índices adicionales para este campo
- **Validación**: Se valida tanto en frontend como en base de datos

---

**Fecha de Migración**: Enero 2025  
**Versión**: 1.1.0  
**Estado**: ✅ Completada