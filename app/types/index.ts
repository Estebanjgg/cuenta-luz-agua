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
}

export interface TariffConfig {
  // Componentes detallados del costo
  baseConsumption?: number;
  redBandAddition?: number;
  transmission?: number;
  sectorCharges?: number;
  taxes?: number;
  
  // Tarifa efectiva (para compatibilidad)
  pricePerKwh: number;
  
  // Tarifas fijas
  publicLightingFee?: number;
  additionalFees?: number; // Para compatibilidad con versiones anteriores
  
  // Método de cálculo avanzado
  calculateCost?: (kwh: number) => number;
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