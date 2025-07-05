# 🇧🇷 Bandeiras Tarifárias - Guía de Implementación

## 📋 Resumen

Este documento describe la implementación completa del sistema de **Bandeiras Tarifárias** (Banderas Tarifarias) brasileñas en la aplicación de control de consumo eléctrico.

## 🗄️ Migraciones de Base de Datos

### Para Nuevas Instalaciones

Si estás configurando la base de datos por primera vez, simplemente ejecuta:

```sql
-- El archivo supabase-migrations.sql ya incluye la columna tariff_flag
```

### Para Bases de Datos Existentes

Si ya tienes datos en tu base de datos de Supabase, ejecuta la siguiente migración:

```sql
-- Ejecutar en el SQL Editor de Supabase
-- Contenido del archivo: supabase-migration-tariff-flag.sql

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

### Pasos para Aplicar la Migración

1. **Accede a tu proyecto de Supabase**
2. **Ve a SQL Editor**
3. **Copia y pega el contenido del archivo `supabase-migration-tariff-flag.sql`**
4. **Ejecuta la migración**
5. **Verifica que la columna se haya agregado correctamente**

```sql
-- Verificar la estructura de la tabla
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_energy_data';
```

## 🏴 Sistema de Banderas Tarifarias

### Tipos de Banderas

| Bandera | Código | Recargo (R$/kWh) | Descripción |
|---------|--------|------------------|-------------|
| 🟢 Verde | `GREEN` | R$ 0,00000 | Condiciones favorables de generación |
| 🟡 Amarilla | `YELLOW` | R$ 0,01885 | Condiciones menos favorables |
| 🔴 Roja Nivel 1 | `RED_LEVEL_1` | R$ 0,03971 | Condiciones más costosas |
| 🔴 Roja Nivel 2 | `RED_LEVEL_2` | R$ 0,09492 | Condiciones muy costosas |

### Valores Oficiales ANEEL

Los valores implementados están basados en las tarifas oficiales de ANEEL (Agência Nacional de Energia Elétrica) y se actualizan periódicamente.

## 🔧 Componentes Implementados

### 1. Tipos y Interfaces (`app/types/index.ts`)

```typescript
export type TariffFlagType = 'GREEN' | 'YELLOW' | 'RED_LEVEL_1' | 'RED_LEVEL_2'

export interface TariffFlag {
  type: TariffFlagType
  name: string
  surcharge: number // R$ por kWh
  description: string
  color: string
}

export interface MonthData {
  // ... otros campos
  tariffFlag?: TariffFlagType
}
```

### 2. Constantes (`app/constants/index.ts`)

- `TARIFF_FLAGS`: Definición de todas las banderas con sus valores
- `SAO_PAULO_TARIFF`: Configuración específica para São Paulo
- `DEFAULT_TARIFF`: Tarifa por defecto actualizada

### 3. Selector de Banderas (`app/components/UI/TariffFlagSelector.tsx`)

- Interfaz visual para seleccionar la bandera actual
- Indicadores de color según el tipo de bandera
- Información detallada de cada bandera

### 4. Cálculos Actualizados (`app/utils/calculations.ts`)

- Función `calculateConsumptionStats` actualizada
- Incorporación automática de recargos por bandera
- Cálculo usando el método "por dentro" brasileño

### 5. Hooks Mejorados

- `useEnergyData.ts`: Para datos locales
- `useSupabaseEnergyData.ts`: Para datos en Supabase
- Función `changeTariffFlag` para cambiar la bandera
- Recálculo automático de costos

### 6. Desglose de Costos (`app/components/UI/CostBreakdown.tsx`)

- Visualización detallada del recargo por bandera
- Colores dinámicos según el tipo
- Porcentaje del costo total

## 🚀 Uso de la Funcionalidad

### En la Interfaz de Usuario

1. **Selector de Bandera**: Aparece en la página principal
2. **Cambio Automático**: Los costos se recalculan instantáneamente
3. **Persistencia**: La bandera seleccionada se guarda automáticamente
4. **Desglose**: Visualización detallada en el componente de costos

### Programáticamente

```typescript
// Cambiar la bandera tarifaria
const { changeTariffFlag } = useSupabaseEnergyData()

// Cambiar a bandera roja nivel 2
await changeTariffFlag('RED_LEVEL_2')
```

## 🔒 Validaciones y Seguridad

### Base de Datos

- **Constraint CHECK**: Solo permite valores válidos de banderas
- **Valor por defecto**: 'GREEN' para nuevos registros
- **Row Level Security**: Mantiene las políticas existentes

### Frontend

- **Validación de tipos**: TypeScript garantiza tipos correctos
- **Valores por defecto**: Fallback a 'GREEN' en caso de error
- **Recálculo automático**: Previene inconsistencias

## 📊 Impacto en los Cálculos

### Fórmula de Cálculo

```
Costo Total = (Consumo × Tarifa Base) + (Consumo × Recargo Bandera) + Impuestos + Tasas
```

### Ejemplo Práctico

```
Consumo: 300 kWh
Bandera: Roja Nivel 2 (R$ 0,09492/kWh)
Recargo: 300 × 0,09492 = R$ 28,48
```

## 🔄 Migración de Datos Existentes

### Comportamiento

- **Registros existentes**: Se asigna automáticamente bandera 'GREEN'
- **Nuevos registros**: Bandera 'GREEN' por defecto
- **Compatibilidad**: Funciona con datos anteriores sin problemas

### Verificación Post-Migración

```sql
-- Verificar que todos los registros tienen bandera asignada
SELECT tariff_flag, COUNT(*) 
FROM user_energy_data 
GROUP BY tariff_flag;

-- Resultado esperado:
-- GREEN | [número de registros]
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de constraint**: Verificar que solo se usen valores válidos
2. **Datos NULL**: Ejecutar UPDATE para asignar 'GREEN'
3. **Cálculos incorrectos**: Verificar que se pase el flagType

### Logs de Debug

```typescript
// En el navegador, verificar:
console.log('Current tariff flag:', currentMonth.tariffFlag)
console.log('Flag surcharge:', TARIFF_FLAGS[flagType].surcharge)
```

## 📈 Próximas Mejoras

- [ ] Actualización automática de valores ANEEL
- [ ] Histórico de cambios de banderas
- [ ] Notificaciones de cambio de bandera
- [ ] Predicción de costos por bandera
- [ ] Integración con API oficial de ANEEL

## 📞 Soporte

Para problemas o dudas sobre la implementación:

1. Verificar que la migración se ejecutó correctamente
2. Revisar los logs del navegador para errores
3. Confirmar que los valores de las banderas están actualizados

---

**Nota**: Esta implementación sigue las especificaciones oficiales de ANEEL y está diseñada para ser fácilmente actualizable cuando cambien las tarifas.