import { Reading, TariffConfig, ConsumptionStats, ValidationResult, TariffFlagType, Tariff } from '../types';

/**
 * Calcula las estadísticas de consumo basadas en las lecturas
 */
export const calculateConsumptionStats = (
  readings: Reading[],
  initialReading: number,
  tariff: TariffConfig,
  flagType: TariffFlagType = 'GREEN'
): ConsumptionStats => {
  if (readings.length === 0) {
    return {
      totalConsumption: 0,
      averageDailyConsumption: 0,
      monthlyProjection: 0,
      estimatedCost: tariff.publicLightingFee || tariff.additionalFees || 0
    };
  }

  const latestReading = Math.max(...readings.map(r => r.value));
  const totalConsumption = latestReading - initialReading;
  const averageDailyConsumption = totalConsumption / Math.max(readings.length, 1);
  
  // Proyección mensual más precisa basada en días transcurridos
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  
  // Si estamos muy al inicio del mes (primeros 3 días), usar promedio diario más conservador
  let monthlyProjection;
  if (currentDay <= 3) {
    monthlyProjection = Math.round(averageDailyConsumption * daysInMonth);
  } else {
    monthlyProjection = Math.round((totalConsumption / currentDay) * daysInMonth);
  }
  
  // Usar el método de cálculo detallado si está disponible
  let estimatedCost: number;
  try {
    if (tariff.calculateCost && typeof tariff.calculateCost === 'function') {
      estimatedCost = tariff.calculateCost(totalConsumption, flagType);
    } else {
      // Cálculo básico de respaldo
      const baseCost = totalConsumption * tariff.pricePerKwh;
      const additionalCosts = (tariff.publicLightingFee || 0) + (tariff.additionalFees || 0);
      estimatedCost = baseCost + additionalCosts;
    }
  } catch (error) {
    console.error('Error calculating cost:', error);
    // Cálculo de respaldo en caso de error
    const baseCost = totalConsumption * tariff.pricePerKwh;
    const additionalCosts = (tariff.publicLightingFee || 0) + (tariff.additionalFees || 0);
    estimatedCost = baseCost + additionalCosts;
  }

  return {
    totalConsumption,
    averageDailyConsumption,
    monthlyProjection,
    estimatedCost
  };
};

/**
 * Valida una nueva lectura
 */
export const validateReading = (
  value: number,
  initialReading: number,
  existingReadings: Reading[]
): ValidationResult => {
  if (isNaN(value) || value <= 0) {
    return {
      isValid: false,
      message: 'La lectura debe ser un número válido mayor a 0'
    };
  }

  if (value <= initialReading) {
    return {
      isValid: false,
      message: `La lectura debe ser mayor a la lectura inicial (${initialReading.toLocaleString()} kWh)`
    };
  }

  const maxExistingReading = existingReadings.length > 0 
    ? Math.max(...existingReadings.map(r => r.value))
    : initialReading;

  if (value <= maxExistingReading && existingReadings.length > 0) {
    return {
      isValid: false,
      message: `La lectura debe ser mayor a la última registrada (${maxExistingReading.toLocaleString()} kWh)`
    };
  }

  return { isValid: true };
};

/**
 * Formatea números para mostrar en la UI
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formatea valores monetarios
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${formatNumber(value, 2)}`;
};

/**
 * Formatea fechas para mostrar en la UI
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Calcula el consumo entre dos lecturas
 */
export const calculateConsumptionBetween = (
  startReading: number,
  endReading: number
): number => {
  return Math.max(0, endReading - startReading);
};

/**
 * Obtiene el rango de fechas de las lecturas
 */
export const getReadingDateRange = (readings: Reading[]): { start: string; end: string } | null => {
  if (readings.length === 0) return null;
  
  const dates = readings.map(r => new Date(r.date)).sort((a, b) => a.getTime() - b.getTime());
  
  return {
    start: formatDate(dates[0].toISOString().split('T')[0]),
    end: formatDate(dates[dates.length - 1].toISOString().split('T')[0])
  };
};

/**
 * Calcula el costo usando el nuevo sistema de tarifas
 */
export const calculateCostWithNewTariff = (
  consumption: number,
  tariff: Tariff,
  flagType: TariffFlagType = 'GREEN'
): number => {
  let pricePerKwh: number;
  
  // Seleccionar el precio según la bandera tarifaria
  switch (flagType) {
    case 'GREEN':
      pricePerKwh = tariff.price_per_kwh_green;
      break;
    case 'YELLOW':
      pricePerKwh = tariff.price_per_kwh_yellow;
      break;
    case 'RED_LEVEL_1':
      pricePerKwh = tariff.price_per_kwh_red_1;
      break;
    case 'RED_LEVEL_2':
      pricePerKwh = tariff.price_per_kwh_red_2;
      break;
    default:
      pricePerKwh = tariff.price_per_kwh_green;
  }
  
  // Calcular costo total
  const energyCost = consumption * pricePerKwh;
  const totalCost = energyCost + tariff.additional_fees + tariff.public_lighting_fee;
  
  return totalCost;
};

/**
 * Calcula estadísticas de consumo usando el nuevo sistema de tarifas
 */
export const calculateConsumptionStatsWithNewTariff = (
  readings: Reading[],
  initialReading: number,
  tariff: Tariff,
  flagType: TariffFlagType = 'GREEN'
): ConsumptionStats => {
  if (readings.length === 0) {
    return {
      totalConsumption: 0,
      averageDailyConsumption: 0,
      monthlyProjection: 0,
      estimatedCost: tariff.additional_fees + tariff.public_lighting_fee
    };
  }

  const latestReading = Math.max(...readings.map(r => r.value));
  const totalConsumption = latestReading - initialReading;
  const averageDailyConsumption = totalConsumption / Math.max(readings.length, 1);
  
  // Proyección mensual más precisa basada en días transcurridos
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  
  // Si estamos muy al inicio del mes (primeros 3 días), usar promedio diario más conservador
  let monthlyProjection;
  if (currentDay <= 3) {
    monthlyProjection = Math.round(averageDailyConsumption * daysInMonth);
  } else {
    monthlyProjection = Math.round((totalConsumption / currentDay) * daysInMonth);
  }
  
  // Calcular costo usando el nuevo sistema
  const estimatedCost = calculateCostWithNewTariff(totalConsumption, tariff, flagType);

  return {
    totalConsumption,
    averageDailyConsumption,
    monthlyProjection,
    estimatedCost
  };
};

/**
 * Compara costos entre diferentes banderas tarifarias
 */
export const compareTariffFlags = (
  consumption: number,
  tariff: Tariff
): Record<TariffFlagType, number> => {
  return {
    GREEN: calculateCostWithNewTariff(consumption, tariff, 'GREEN'),
    YELLOW: calculateCostWithNewTariff(consumption, tariff, 'YELLOW'),
    RED_LEVEL_1: calculateCostWithNewTariff(consumption, tariff, 'RED_LEVEL_1'),
    RED_LEVEL_2: calculateCostWithNewTariff(consumption, tariff, 'RED_LEVEL_2')
  };
};

/**
 * Calcula el ahorro/costo adicional al cambiar de bandera
 */
export const calculateFlagImpact = (
  consumption: number,
  tariff: Tariff,
  fromFlag: TariffFlagType,
  toFlag: TariffFlagType
): { difference: number; percentage: number } => {
  const fromCost = calculateCostWithNewTariff(consumption, tariff, fromFlag);
  const toCost = calculateCostWithNewTariff(consumption, tariff, toFlag);
  
  const difference = toCost - fromCost;
  const percentage = fromCost > 0 ? (difference / fromCost) * 100 : 0;
  
  return { difference, percentage };
};

/**
 * Convierte una tarifa antigua (TariffConfig) al nuevo formato
 */
export const convertLegacyTariff = (
  legacyTariff: TariffConfig,
  city: string = 'Bragança Paulista',
  state: string = 'SP',
  companyName: string = 'Energisa'
): Omit<Tariff, 'id' | 'user_id' | 'created_at' | 'updated_at'> => {
  return {
    name: `Tarifa ${companyName} - ${city}`,
    description: `Tarifa convertida automáticamente para ${city}, ${state}`,
    city,
    state,
    company_name: companyName,
    base_price_per_kwh: legacyTariff.pricePerKwh, 
    price_per_kwh_green: legacyTariff.pricePerKwh,
    price_per_kwh_yellow: legacyTariff.pricePerKwh * 1.025, // Estimación +2.5%
    price_per_kwh_red_1: legacyTariff.pricePerKwh * 1.05,   // Estimación +5%
    price_per_kwh_red_2: legacyTariff.pricePerKwh * 1.075,  // Estimación +7.5%
    additional_fees: legacyTariff.additionalFees || 0,
    public_lighting_fee: legacyTariff.publicLightingFee || 0,
    is_public: false
  };
};
