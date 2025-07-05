// Tipos de banderas tarifarias brasileñas
export type TariffFlagType = 'GREEN' | 'YELLOW' | 'RED_LEVEL_1' | 'RED_LEVEL_2';

export interface TariffFlag {
  name: string;
  description: string;
  surcharge: number; // Recargo en R$ por kWh
  color: string;
}

// Tipos principales de la aplicación
export interface Reading {
  id: string;
  date: string;
  value: number;
  consumption?: number;
}

export interface MonthData {
  month: string;
  year: number;
  initialReading: number;
  readings: Reading[];
  totalConsumption: number;
  estimatedCost: number;
  tariffFlag?: TariffFlagType; // Bandera tarifaria del mes
}

export interface TariffConfig {
  // Componentes detallados del costo
  baseConsumption?: number;
  transmission?: number;
  sectorCharges?: number;
  taxes?: number;
  
  // Tarifa efectiva (para compatibilidad)
  pricePerKwh: number;
  
  // Tarifas fijas
  publicLightingFee?: number;
  additionalFees?: number; // Para compatibilidad con versiones anteriores
  
  // Método de cálculo avanzado con banderas
  calculateCost?: (kwh: number, flagType?: TariffFlagType) => number;
}

// Configuración de tarifas por estado
export interface StateTariff {
  TUSD: number; // Tarifa de Uso do Sistema de Distribuição
  TE: number;   // Tarifa de Energia
  ICMS_RATE: number; // Tasa ICMS del estado
  PIS_COFINS_RATE: number; // Tasas federales
  baseRate: number; // TUSD + TE
  publicLightingFee: number;
}

export interface ConsumptionStats {
  totalConsumption: number;
  averageDailyConsumption: number;
  monthlyProjection: number;
  estimatedCost: number;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}