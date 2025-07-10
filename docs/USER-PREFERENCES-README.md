# 🔧 Sistema de Preferencias de Usuario

## 📋 Descripción

Este sistema permite persistir las preferencias del usuario en la base de datos, específicamente el mes seleccionado, para que se mantenga entre sesiones y dispositivos diferentes.

## 🗄️ Estructura de Base de Datos

### Nueva Tabla: `user_preferences`

```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_month_key VARCHAR(20), -- formato: 'mes-año' ej: 'julio-2025'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_preferences UNIQUE(user_id)
);
```

## 🚀 Migración

### Paso 1: Ejecutar Scripts SQL

1. **Crear la tabla de preferencias:**
   ```bash
   # Ejecutar en Supabase SQL Editor
   sql/create-user-preferences-table.sql
   ```

2. **Opcional - Migración alternativa (si prefieres modificar tabla existente):**
   ```bash
   # Ejecutar en Supabase SQL Editor
   sql/add-selected-month-migration.sql
   ```

### Paso 2: Verificar Políticas RLS

Asegúrate de que las políticas de Row Level Security estén activas:

```sql
-- Verificar que RLS esté habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_preferences';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'user_preferences';
```

## 🔧 Implementación en el Código

### Hook Actualizado: `useSupabaseEnergyData`

#### Nuevas Funciones

1. **`loadUserPreferences()`**: Carga las preferencias del usuario desde la base de datos
2. **`saveUserPreferences(selectedMonthKey)`**: Guarda el mes seleccionado en la base de datos

#### Nuevo Estado

- **`userPreferencesLoaded`**: Indica si las preferencias del usuario han sido cargadas

#### Flujo de Funcionamiento

1. **Carga inicial**: Al autenticarse, se cargan las preferencias del usuario
2. **Cambio de mes**: Al seleccionar un mes, se guarda automáticamente en la base de datos
3. **Persistencia**: El mes seleccionado se mantiene entre sesiones y dispositivos

## 📱 Beneficios

### ✅ Antes vs Después

| Característica | Antes (localStorage) | Después (Base de Datos) |
|---|---|---|
| **Persistencia local** | ✅ | ✅ |
| **Sincronización entre dispositivos** | ❌ | ✅ |
| **Funciona sin JavaScript** | ❌ | ✅ |
| **Backup automático** | ❌ | ✅ |
| **Acceso desde cualquier navegador** | ❌ | ✅ |

### 🎯 Casos de Uso Resueltos

1. **Usuario en múltiples dispositivos**: El mes seleccionado se sincroniza automáticamente
2. **Cambio de navegador**: Las preferencias se mantienen
3. **Limpieza de caché**: No se pierden las configuraciones
4. **Trabajo en equipo**: Cada usuario mantiene sus propias preferencias

## 🔍 Debugging

### Verificar Preferencias en Base de Datos

```sql
-- Ver preferencias de un usuario específico
SELECT * FROM user_preferences WHERE user_id = 'USER_UUID';

-- Ver todas las preferencias (solo para admin)
SELECT 
  up.user_id,
  up.selected_month_key,
  up.created_at,
  up.updated_at
FROM user_preferences up;
```

### Logs de Consola

El sistema registra automáticamente:
- Carga de preferencias
- Errores de guardado
- Cambios de mes

## 🛡️ Seguridad

### Row Level Security (RLS)

- ✅ **Habilitado**: Cada usuario solo puede ver sus propias preferencias
- ✅ **Políticas**: CRUD completo con verificación de `auth.uid()`
- ✅ **Cascade Delete**: Las preferencias se eliminan automáticamente al borrar el usuario

### Validaciones

- **Formato de clave**: `mes-año` (ej: `julio-2025`)
- **Usuario autenticado**: Solo usuarios logueados pueden guardar preferencias
- **Constraint único**: Un registro por usuario

## 🔄 Migración de Datos Existentes

Si tienes usuarios que ya usaban localStorage, puedes migrar sus datos:

```javascript
// Función de migración (ejecutar una vez)
const migrateFromLocalStorage = async () => {
  const savedMonthKey = localStorage.getItem('selectedMonthKey');
  if (savedMonthKey && user) {
    await saveUserPreferences(savedMonthKey);
    localStorage.removeItem('selectedMonthKey'); // Limpiar localStorage
  }
};
```

## 📈 Monitoreo

### Métricas Útiles

```sql
-- Usuarios con preferencias guardadas
SELECT COUNT(*) as users_with_preferences 
FROM user_preferences;

-- Meses más seleccionados
SELECT 
  selected_month_key, 
  COUNT(*) as count 
FROM user_preferences 
WHERE selected_month_key IS NOT NULL 
GROUP BY selected_month_key 
ORDER BY count DESC;

-- Actividad reciente
SELECT 
  selected_month_key,
  updated_at
FROM user_preferences 
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;
```

## 🎉 Resultado Final

Con esta implementación:

1. **El mes seleccionado se mantiene entre sesiones**
2. **Funciona en cualquier dispositivo del usuario**
3. **Se sincroniza automáticamente**
4. **Es seguro y escalable**
5. **No depende del navegador local**

¡El problema de "siempre volver a julio" está completamente resuelto! 🚀