import { TariffFlagType } from '../types';

// Claves de almacenamiento local
export const STORAGE_KEY = 'electricity-consumption-data';

// Banderas Tarifarias Brasileñas (Sistema ANEEL 2025)
export const TARIFF_FLAGS = {
  GREEN: {
    name: 'Verde',
    description: 'Condiciones favorables de generación',
    surcharge: 0.0, // Sin recargo
    color: '#10b981'
  },
  YELLOW: {
    name: 'Amarilla',
    description: 'Condiciones menos favorables',
    surcharge: 0.01885, // R$ 0,01885 por kWh
    color: '#f59e0b'
  },
  RED_LEVEL_1: {
    name: 'Roja Nivel 1',
    description: 'Condiciones más costosas',
    surcharge: 0.04463, // R$ 0,04463 por kWh
    color: '#ef4444'
  },
  RED_LEVEL_2: {
    name: 'Roja Nivel 2',
    description: 'Condiciones muy costosas',
    surcharge: 0.07877, // R$ 0,07877 por kWh
    color: '#dc2626'
  }
};

// Tarifas base São Paulo (Enel SP) - Julio 2025
export const SAO_PAULO_TARIFF = {
  // Componentes ANEEL oficiales
  TUSD: 0.43244, // Tarifa de Uso do Sistema de Distribuição
  TE: 0.29274,   // Tarifa de Energia
  
  // Impuestos São Paulo
  ICMS_RATE: 0.18, // 18% ICMS São Paulo
  PIS_COFINS_RATE: 0.0925, // PIS (1,65%) + COFINS (7,6%)
  
  // Tarifa base (TUSD + TE)
  baseRate: 0.72518,
  
  // Contribución iluminación pública (variable por municipio)
  publicLightingFee: 41.12
};

// Configuración de tarifas por defecto (compatible con versiones anteriores)
export const DEFAULT_TARIFF = {
  // Componentes del costo por kWh
  baseConsumption: SAO_PAULO_TARIFF.baseRate,
  transmission: 0.0687,
  sectorCharges: 0.1255,
  taxes: 0.2547,
  
  // Tarifa efectiva total por kWh (sin bandera)
  pricePerKwh: SAO_PAULO_TARIFF.baseRate,
  
  // Tarifas fijas
  publicLightingFee: SAO_PAULO_TARIFF.publicLightingFee,
  
  // Método de cálculo con banderas tarifarias
  calculateCost: (kwh: number, flagType: TariffFlagType = 'GREEN') => {
    const baseCost = kwh * SAO_PAULO_TARIFF.baseRate;
    const flagSurcharge = kwh * TARIFF_FLAGS[flagType].surcharge;
    const subtotal = baseCost + flagSurcharge;
    
    // Aplicar impuestos "por dentro" (método brasileño)
    const taxRate = SAO_PAULO_TARIFF.ICMS_RATE + SAO_PAULO_TARIFF.PIS_COFINS_RATE;
    const finalCost = subtotal / (1 - taxRate);
    
    return finalCost + SAO_PAULO_TARIFF.publicLightingFee;
  }
};

// Meses del año - claves para traducción
export const MONTH_KEYS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

// Función para obtener meses traducidos
export const getTranslatedMonths = (t: (key: string) => string) => {
  return MONTH_KEYS.map(month => t(`months.${month}`));
};

// Mantener MONTHS para compatibilidad con versiones anteriores
export const MONTHS = MONTH_KEYS;

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

// Función para obtener el mes actual de forma segura (evita problemas de hidratación)
export const getCurrentMonth = () => {
  if (typeof window !== 'undefined') {
    return MONTH_KEYS[new Date().getMonth()];
  }
  // Fallback para SSR - usar mes actual del servidor
  return MONTH_KEYS[new Date().getMonth()];
};

// Función para obtener el año actual de forma segura
export const getCurrentYear = () => {
  if (typeof window !== 'undefined') {
    return new Date().getFullYear();
  }
  // Fallback para SSR
  return new Date().getFullYear();
};

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'Control de Consumo Eléctrico',
  version: '1.0.0',
  defaultYear: getCurrentYear(),
  defaultMonth: getCurrentMonth(),
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