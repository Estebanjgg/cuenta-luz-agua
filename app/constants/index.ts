// Claves de almacenamiento local
export const STORAGE_KEY = 'electricity-consumption-data';

// Configuración de tarifas por defecto (basada en factura real JUL/2025 - Energisa)
// Desglose detallado de la factura brasileña:
export const DEFAULT_TARIFF = {
  // Componentes del costo por kWh
  baseConsumption: 0.795530, // Tarifa base de consumo
  redBandAddition: 0.057, // Adicional banda roja (33.50/588)
  transmission: 0.0687, // Servicio de transmisión (40.40/588)
  sectorCharges: 0.1255, // Encargos sectoriales (73.78/588)
  taxes: 0.2547, // Impuestos directos y encargos (149.74/588)
  
  // Tarifa efectiva total por kWh
  pricePerKwh: 0.8524, // Total sin contribución iluminación: 501.27/588
  
  // Tarifas fijas
  publicLightingFee: 41.12, // Contribución iluminación pública
  
  // Método de cálculo mejorado
  calculateCost: (kwh: number) => {
    const baseCost = kwh * 0.795530; // Consumo base
    const redBandCost = kwh * 0.057; // Banda roja
    const transmissionCost = kwh * 0.0687; // Transmisión
    const sectorChargesCost = kwh * 0.1255; // Encargos sectoriales
    const taxesCost = kwh * 0.2547; // Impuestos
    const publicLighting = 41.12; // Fijo
    
    return baseCost + redBandCost + transmissionCost + sectorChargesCost + taxesCost + publicLighting;
  }
};

// Meses del año
export const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

// Configuración de gráficos
export const CHART_CONFIG = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    background: '#f8fafc'
  },
  dimensions: {
    width: 800,
    height: 400,
    margin: {
      top: 20,
      right: 30,
      bottom: 40,
      left: 60
    }
  }
};

// Límites de validación
export const VALIDATION_LIMITS = {
  minReading: 0,
  maxReading: 999999,
  maxDailyConsumption: 1000 // kWh por día
};

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'Control de Consumo Eléctrico',
  version: '1.0.0',
  defaultYear: new Date().getFullYear(),
  defaultMonth: 'julio',
  defaultInitialReading: 65788
};

// Mensajes de la aplicación
export const MESSAGES = {
  success: {
    readingAdded: 'Lectura agregada exitosamente',
    readingDeleted: 'Lectura eliminada exitosamente',
    monthChanged: 'Mes cambiado exitosamente',
    dataReset: 'Datos reiniciados exitosamente'
  },
  error: {
    invalidReading: 'Lectura inválida',
    readingTooLow: 'La lectura debe ser mayor a la anterior',
    readingTooHigh: 'La lectura parece demasiado alta',
    loadingError: 'Error al cargar los datos',
    savingError: 'Error al guardar los datos'
  },
  info: {
    noReadings: 'No hay lecturas registradas',
    firstReading: 'Esta es tu primera lectura del mes',
    dataLoaded: 'Datos cargados correctamente'
  }
};