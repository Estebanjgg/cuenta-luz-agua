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

// Tipos para tarifas guardadas
export interface SavedTariff {
  id: string;
  name: string;
  company_name: string;
  company_code?: string;
  city?: string;
  state: string;
  price_per_kwh: number;
  public_lighting_fee?: number;
  additional_fees?: number;
  source_type: 'manual' | 'aneel' | 'invoice';
  is_predefined: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

// Tipo extendido de TariffConfig con información de origen
export interface ExtendedTariffConfig extends TariffConfig {
  source?: {
    type: 'automatic' | 'manual' | 'saved';
    company_name?: string;
    company_code?: string;
    city?: string;
    state?: string;
    saved_tariff_id?: string;
  };
}

// Interfaz para la tabla saved_tariffs de la base de datos
export interface SavedTariffDB {
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

// Interfaz para la tabla user_tariff_config de la base de datos
export interface UserTariffConfigDB {
  id: string;
  user_id?: string;
  price_per_kwh: number;
  additional_fees?: number;
  public_lighting_fee?: number;
  created_at?: string;
  updated_at?: string;
}