# ⚡ Control de Consumo Eléctrico

Aplicación web moderna para monitorear y controlar el consumo de energía eléctrica de forma diaria, desarrollada con Next.js, TypeScript y Tailwind CSS.

## 🚀 Características

- **Seguimiento diario**: Registra lecturas del medidor cuando quieras
- **Cálculos automáticos**: Calcula consumo acumulado y costos estimados
- **Gráficos visuales**: Visualiza la evolución de tu consumo
- **Proyecciones**: Obtén estimaciones de consumo mensual
- **Múltiples meses**: Cambia entre diferentes períodos
- **Almacenamiento local**: Tus datos se guardan en el navegador
- **Interfaz moderna**: Diseño responsivo y fácil de usar

## 📊 Funcionalidades

### 1. Resumen del Mes
- Lectura inicial del medidor
- Consumo total acumulado
- Costo estimado basado en tarifas reales

### 2. Registro de Lecturas
- Agrega lecturas con fecha personalizada
- Validación automática (debe ser mayor a la lectura anterior)
- Cálculo instantáneo del consumo

### 3. Análisis Visual
- Gráfico de evolución de lecturas
- Consumo promedio diario
- Proyección mensual basada en el consumo actual

### 4. Gestión de Períodos
- Selector de mes y año
- Configuración de lectura inicial por período
- Reinicio de datos por mes

## 🛠️ Instalación y Uso

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn

### Instalación

1. Clona o descarga el proyecto
2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📋 Cómo Usar la Aplicación

### Primer Uso
1. **Configura el mes actual**: La aplicación viene preconfigurada con julio 2025 y la lectura inicial de tu factura (65,788 kWh)
2. **Cambia el mes si es necesario**: Usa el selector de mes para configurar el período actual
3. **Ingresa la lectura inicial**: Al cambiar de mes, se te pedirá la lectura inicial del medidor

### Registro Diario
1. **Selecciona la fecha**: Elige el día de la lectura
2. **Ingresa la lectura**: Escribe el valor actual del medidor (debe ser mayor a la lectura anterior)
3. **Haz clic en "Agregar Lectura"**: El sistema calculará automáticamente el consumo

### Interpretación de Datos
- **Consumo Total**: kWh consumidos desde el inicio del mes
- **Costo Estimado**: Basado en la tarifa de R$ 0.795 por kWh + R$ 41.12 de tasas adicionales
- **Consumo Promedio Diario**: Promedio de consumo por día registrado
- **Proyección Mensual**: Estimación del consumo total del mes

## 💰 Cálculo de Costos

La aplicación utiliza las tarifas reales de tu factura:
- **Tarifa por kWh**: R$ 0.795 (promedio de las facturas analizadas)
- **Tasas adicionales**: R$ 41.12 (contribución de iluminación pública y otros)
- **Fórmula**: `(Consumo × Tarifa) + Tasas Adicionales`

## 📱 Características Técnicas

- **Framework**: Next.js 15.3.5 con Turbopack
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Almacenamiento**: LocalStorage del navegador
- **Gráficos**: Canvas HTML5 nativo
- **Responsivo**: Funciona en móviles y escritorio

## 🔧 Personalización

### Cambiar Tarifas
Edita las constantes en `app/page.tsx`:
```typescript
const TARIFF_PER_KWH = 0.795; // Tu tarifa por kWh
const ADDITIONAL_FEES = 41.12; // Tasas adicionales
```

### Agregar Nuevos Meses
Los meses están definidos en `app/components/MonthSelector.tsx`

## 📊 Datos de Ejemplo

Basado en tus facturas reales:
- **Junio 2025**: 349 kWh → R$ 314.43
- **Julio 2025**: 588 kWh → R$ 542.39

## 🚀 Próximas Mejoras

- [ ] Exportar datos a Excel/CSV
- [ ] Comparación entre meses
- [ ] Alertas de consumo alto
- [ ] Múltiples medidores
- [ ] Backup en la nube
- [ ] Notificaciones de lectura

## 🤝 Contribuciones

Este proyecto fue desarrollado específicamente para el control de consumo eléctrico residencial. Si tienes sugerencias o mejoras, ¡son bienvenidas!

## 📄 Licencia

Proyecto de uso personal para control de consumo eléctrico.

---

**¡Controla tu consumo, controla tus gastos! ⚡💰**
