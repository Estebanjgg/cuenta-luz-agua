// Tipos de banderas tarifarias brasileñas
export type TariffFlagType = 'GREEN' | 'YELLOW' | 'RED_LEVEL_1' | 'RED_LEVEL_2';

export interface TariffFlag {
  name: string;
  description: string;
  surcharge: number; // Recargo en R$ por kWh
  color: string;
}

// Nuevos tipos para el sistema de tarifas avanzado
export interface Tariff {
  id: string;
  user_id?: string; // null para tarifas públicas del sistema
  city: string;
  state: string;
  company_name: string;
  price_per_kwh_green: number;
  price_per_kwh_yellow: number;
  price_per_kwh_red_1: number;
  price_per_kwh_red_2: number;
  additional_fees: number;
  public_lighting_fee: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMonthlyTariff {
  id: string;
  user_id: string;
  energy_data_id: string;
  tariff_id: string;
  created_at: string;
  tariff?: Tariff; // Relación con la tarifa
}

export interface TariffFormData {
  city: string;
  state: string;
  company_name: string;
  price_per_kwh_green: number;
  price_per_kwh_yellow: number;
  price_per_kwh_red_1: number;
  price_per_kwh_red_2: number;
  additional_fees: number;
  public_lighting_fee: number;
  is_public?: boolean;
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
  readingDay?: number; // Día del mes en que se realizó la medición inicial
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