# Sistema de Tarifas Reestructurado

## Descripción General

El sistema de tarifas ha sido completamente reestructurado para separar claramente las tarifas guardadas de la configuración actual del usuario, siguiendo las mejores prácticas de base de datos y mejorando la experiencia del usuario.

## Estructura de la Base de Datos

### Tabla `saved_tariffs`
Almacena todas las tarifas guardadas, tanto predefinidas como creadas por usuarios.

```sql
CREATE TABLE public.saved_tariffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  company_name varchar(255) NOT NULL,
  company_code varchar(50),
  city varchar(255),
  state varchar(2) NOT NULL,
  price_per_kwh numeric(10,6) NOT NULL,
  public_lighting_fee numeric(10,2) DEFAULT 0,
  additional_fees numeric(10,2) DEFAULT 0,
  source_type varchar(50) DEFAULT 'manual',
  is_predefined boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Tabla `user_tariff_config`
Almacena la configuración actual de tarifa de cada usuario.

```sql
CREATE TABLE public.user_tariff_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  price_per_kwh numeric(10,4) NOT NULL DEFAULT 0.795,
  additional_fees numeric(10,2) DEFAULT 41.12,
  public_lighting_fee numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Arquitectura del Sistema

### Hook Principal: `useTariffManager`

El nuevo hook `useTariffManager` unifica toda la gestión de tarifas:

```typescript
const {
  // Estados
  savedTariffs,           // Todas las tarifas guardadas
  userTariffConfig,       // Configuración actual del usuario
  currentTariffSource,    // Información del origen de la tarifa actual
  loading,
  error,
  
  // Acciones principales
  saveTariff,            // Guardar nueva tarifa en saved_tariffs
  applyTariffToUser,     // Aplicar tarifa guardada al usuario
  updateUserTariffConfig, // Actualizar configuración manual del usuario
  deleteTariff,          // Eliminar tarifa guardada
  
  // Utilidades
  getCurrentExtendedConfig,
  getTariffsByLocation,
  getPredefinedTariffs,
  getUserTariffs
} = useTariffManager();
```

### Flujo de Trabajo

#### 1. Configuración Automática (ANEEL)
```typescript
// El usuario selecciona una distribuidora
// Se actualiza directamente user_tariff_config
await updateUserTariffConfig(tariffConfig, {
  type: 'automatic',
  company_name: distribuidora.nome,
  company_code: distribuidora.sigla,
  state: selectedEstado
});
```

#### 2. Configuración Manual
```typescript
// Paso 1: Guardar en saved_tariffs
const savedTariff = await saveTariff({
  name: 'Mi Tarifa Personalizada',
  company_name: 'Compañía Custom',
  state: 'SP',
  price_per_kwh: 0.85,
  // ... otros campos
});

// Paso 2: Aplicar al usuario
await applyTariffToUser(savedTariff);
```

#### 3. Tarifa Guardada
```typescript
// Aplicar tarifa existente al usuario
await applyTariffToUser(selectedSavedTariff);
```

## Tipos de Datos

### Interfaces Principales

```typescript
// Configuración básica de tarifa
interface TariffConfig {
  pricePerKwh: number;
  additionalFees: number;
  publicLightingFee: number;
}

// Configuración extendida con información de origen
interface ExtendedTariffConfig extends TariffConfig {
  source?: {
    type: 'automatic' | 'manual' | 'saved';
    company_name?: string;
    company_code?: string;
    city?: string;
    state?: string;
    saved_tariff_id?: string;
  };
}

// Tarifa guardada (estructura de BD)
interface SavedTariffDB {
  id: string;
  name: string;
  company_name: string;
  company_code?: string;
  city?: string;
  state: string;
  price_per_kwh: number;
  public_lighting_fee?: number;
  additional_fees?: number;
  source_type?: string;
  is_predefined?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}
```

## Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:

### `saved_tariffs`
- Los usuarios pueden ver tarifas predefinidas y sus propias tarifas
- Solo pueden modificar sus propias tarifas (no predefinidas)

### `user_tariff_config`
- Los usuarios solo pueden acceder a su propia configuración
- Cada usuario tiene una única configuración (constraint UNIQUE)

## Migración

Para aplicar la nueva estructura:

1. Ejecutar la migración SQL:
```bash
supabase db push
```

2. La migración incluye:
   - Creación de índices optimizados
   - Configuración de políticas RLS
   - Inserción de tarifas predefinidas de ejemplo
   - Funciones de utilidad para limpieza de datos

## Ventajas del Nuevo Sistema

### 1. Separación Clara de Responsabilidades
- `saved_tariffs`: Biblioteca de tarifas (predefinidas + usuario)
- `user_tariff_config`: Configuración activa del usuario

### 2. Mejor Experiencia de Usuario
- Historial completo de tarifas guardadas
- Aplicación inmediata de configuraciones
- Información clara del origen de la tarifa actual

### 3. Escalabilidad
- Soporte para tarifas predefinidas del sistema
- Fácil adición de nuevas fuentes de datos (ANEEL, facturas, etc.)
- Optimización de consultas con índices apropiados

### 4. Mantenibilidad
- Código más limpio y organizado
- Hook unificado para toda la gestión de tarifas
- Tipos TypeScript bien definidos

## Uso en Componentes

### Componente TariffConfig
```typescript
const TariffConfig = ({ onSave, currentConfig }) => {
  const {
    savedTariffs,
    userTariffConfig,
    saveTariff,
    applyTariffToUser,
    updateUserTariffConfig
  } = useTariffManager();

  // Lógica del componente...
};
```

### Otros Componentes
```typescript
// Para mostrar la configuración actual
const { userTariffConfig, getCurrentExtendedConfig } = useTariffManager();
const currentConfig = getCurrentExtendedConfig();

// Para mostrar tarifas disponibles
const { getPredefinedTariffs, getUserTariffs } = useTariffManager();
const predefinedTariffs = getPredefinedTariffs();
const userTariffs = getUserTariffs();
```

## Consideraciones de Rendimiento

1. **Índices Optimizados**: Creados para consultas frecuentes
2. **Carga Lazy**: Los datos se cargan solo cuando es necesario
3. **Cache Local**: El hook mantiene estado local para evitar consultas repetidas
4. **Consultas Eficientes**: Uso de `select` específicos y filtros en BD

## Próximos Pasos

1. **Integración con APIs Externas**: Automatizar la carga de tarifas predefinidas
2. **Notificaciones**: Alertar sobre cambios en tarifas
3. **Análisis**: Estadísticas de uso de tarifas
4. **Exportación**: Permitir exportar configuraciones

## Troubleshooting

### Error "Auth session missing!"
- Verificar que el usuario esté autenticado antes de guardar tarifas
- El hook `useTariffManager` incluye verificaciones automáticas

### Tarifas no aparecen
- Verificar políticas RLS en Supabase
- Confirmar que el usuario tenga los permisos correctos

### Configuración no se guarda
- Verificar que `user_tariff_config` tenga constraint UNIQUE en `user_id`
- Usar `upsert` para insertar/actualizar automáticamente