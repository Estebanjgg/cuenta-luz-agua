# 🔌 Sistema Avanzado de Tarifas Eléctricas

## 📋 Descripción General

El nuevo sistema de tarifas permite a los usuarios crear, gestionar y aplicar tarifas eléctricas personalizadas para diferentes ciudades, estados y compañías eléctricas. Esto es especialmente útil para usuarios que viven en diferentes regiones con tarifas variables.

## 🚀 Características Principales

### 1. **Gestión de Tarifas Personalizadas**
- Crear tarifas específicas por ciudad, estado y compañía eléctrica
- Configurar precios diferenciados según las banderas tarifarias (Verde, Amarilla, Roja 1, Roja 2)
- Incluir tasas adicionales y costos de alumbrado público
- Marcar tarifas como públicas para compartir con otros usuarios

### 2. **Tarifas Públicas**
- Acceso a tarifas creadas por otros usuarios
- Búsqueda por ciudad, estado o compañía
- Copia de tarifas públicas a tu perfil personal
- Sistema colaborativo de tarifas actualizadas

### 3. **Asignación Mensual**
- Asignar diferentes tarifas a diferentes meses
- Flexibilidad para cambios estacionales o actualizaciones de precios
- Historial de tarifas utilizadas por mes

## 🛠️ Cómo Usar el Sistema

### **Paso 1: Acceder a la Gestión de Tarifas**
1. En la página principal, busca la sección "Gestión de Tarifas"
2. Verás tres opciones principales:
   - **Seleccionar Tarifa para este Mes**: Asigna una tarifa al mes actual
   - **Gestionar Mis Tarifas**: Administra tus tarifas personales
   - **Reiniciar Mes**: Limpia los datos del mes actual

### **Paso 2: Crear una Nueva Tarifa**
1. Haz clic en "Gestionar Mis Tarifas"
2. En el modal que se abre, haz clic en "Nueva Tarifa"
3. Completa el formulario con:
   - **Ciudad**: Nombre de tu ciudad
   - **Estado**: Estado o provincia
   - **Compañía**: Nombre de la empresa eléctrica
   - **Precios por kWh**: Para cada bandera tarifaria
   - **Tasas Adicionales**: Costos fijos mensuales
   - **Alumbrado Público**: Tasa de alumbrado público
   - **Tarifa Pública**: Marca si quieres compartirla

### **Paso 3: Asignar Tarifa a un Mes**
1. Haz clic en "Seleccionar Tarifa para este Mes"
2. Elige entre:
   - **Mis Tarifas**: Tarifas que has creado
   - **Tarifas Públicas**: Tarifas compartidas por otros usuarios
   - **Crear Nueva**: Crear una tarifa desde cero
3. Selecciona la tarifa deseada y confirma

### **Paso 4: Usar Tarifas Públicas**
1. En el selector de tarifas, haz clic en "Tarifas Públicas"
2. Busca por ciudad, estado o compañía
3. Revisa los detalles de la tarifa
4. Haz clic en "Copiar a Mis Tarifas" para guardarla en tu perfil
5. Opcionalmente, asígnala directamente al mes actual

## 📊 Banderas Tarifarias

El sistema maneja cuatro tipos de banderas tarifarias:

- **🟢 Verde**: Condiciones favorables del sistema eléctrico (tarifa base)
- **🟡 Amarilla**: Condiciones menos favorables (incremento moderado)
- **🔴 Roja Nivel 1**: Condiciones costosas (incremento significativo)
- **🔴 Roja Nivel 2**: Condiciones muy costosas (incremento máximo)

## 💾 Base de Datos

### **Tablas Principales**

#### `tariffs`
- Almacena todas las tarifas (personales y públicas)
- Incluye precios por bandera tarifaria
- Información de ubicación y compañía

#### `user_monthly_tariffs`
- Vincula usuarios con tarifas específicas por mes
- Permite historial de tarifas utilizadas
- Facilita cambios mensuales de tarifas

### **Inicialización**
El sistema incluye una tarifa por defecto:
- **Ubicación**: Bragança Paulista, SP
- **Compañía**: Energisa
- **Tipo**: Pública
- **Precios**: Basados en tarifas reales de la región

## 🔧 Funciones de Cálculo

El sistema incluye nuevas funciones de cálculo:

- `calculateCostWithNewTariff()`: Calcula costos usando el nuevo sistema
- `calculateConsumptionStatsWithNewTariff()`: Estadísticas con tarifas avanzadas
- `compareTariffFlags()`: Compara costos entre banderas
- `calculateFlagImpact()`: Calcula impacto de cambios de bandera
- `convertLegacyTariff()`: Convierte tarifas del sistema anterior

## 🎯 Beneficios

1. **Precisión**: Cálculos más exactos según tu ubicación real
2. **Flexibilidad**: Diferentes tarifas para diferentes meses
3. **Colaboración**: Compartir y usar tarifas de otros usuarios
4. **Actualización**: Fácil actualización cuando cambien las tarifas
5. **Comparación**: Analizar impacto de diferentes banderas tarifarias

## 🚨 Notas Importantes

- Las tarifas públicas son de solo lectura hasta que las copies a tu perfil
- Puedes tener múltiples tarifas para la misma ubicación
- El sistema previene duplicados exactos
- Los cálculos se actualizan automáticamente al cambiar de tarifa
- Las tarifas se pueden editar en cualquier momento

## 🔄 Migración desde el Sistema Anterior

El sistema mantiene compatibilidad con el formato anterior y incluye funciones de conversión automática para una transición suave.