import { Reading, TariffConfig, ConsumptionStats, ValidationResult } from '../types';

/**
 * Calcula las estadísticas de consumo basadas en las lecturas
 */
export const calculateConsumptionStats = (
  readings: Reading[],
  initialReading: number,
  tariff: TariffConfig
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
  const estimatedCost = tariff.calculateCost 
    ? tariff.calculateCost(totalConsumption)
    : (totalConsumption * tariff.pricePerKwh) + (tariff.publicLightingFee || tariff.additionalFees || 0);

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