'use client';

import { useState, useEffect } from 'react';
import { MonthData, Reading, TariffConfig, ConsumptionStats, ValidationResult, TariffFlagType } from '../types';
import { calculateConsumptionStats, validateReading } from '../utils/calculations';
import { STORAGE_KEY, DEFAULT_TARIFF, APP_CONFIG } from '../constants';

const DEFAULT_MONTH_DATA: MonthData = {
  month: APP_CONFIG.defaultMonth,
  year: APP_CONFIG.defaultYear,
  initialReading: 65788,
  readings: [],
  totalConsumption: 0,
  estimatedCost: DEFAULT_TARIFF.publicLightingFee || 0,
  tariffFlag: 'GREEN' // Bandera verde por defecto
};

// Tipo para almacenar datos de múltiples meses
type MonthsData = Record<string, MonthData>;

export const useEnergyData = () => {
  const [monthsData, setMonthsData] = useState<MonthsData>({});
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(`${APP_CONFIG.defaultMonth}-${APP_CONFIG.defaultYear}`);
  const [tariff, setTariff] = useState<TariffConfig>(DEFAULT_TARIFF);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Función para generar clave del mes
  const getMonthKey = (month: string, year: number): string => {
    return `${month}-${year}`;
  };

  // Obtener datos del mes actual
  const currentMonth = monthsData[currentMonthKey] || DEFAULT_MONTH_DATA;

  // Verificar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar datos del localStorage solo en el cliente
  useEffect(() => {
    if (isClient) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Si es el formato antiguo (un solo mes), convertir al nuevo formato
          if (parsedData.month && parsedData.year) {
            const monthKey = getMonthKey(parsedData.month, parsedData.year);
            setMonthsData({ [monthKey]: parsedData });
            setCurrentMonthKey(monthKey);
          } else {
            // Formato nuevo (múltiples meses)
            setMonthsData(parsedData.monthsData || {});
            setCurrentMonthKey(parsedData.currentMonthKey || `${APP_CONFIG.defaultMonth}-${APP_CONFIG.defaultYear}`);
          }
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
      setIsLoading(false);
    }
  }, [isClient]);

  // Guardar datos en localStorage cuando cambien (solo en el cliente)
  useEffect(() => {
    if (isClient && !isLoading) {
      const dataToSave = {
        monthsData,
        currentMonthKey
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [monthsData, currentMonthKey, isLoading, isClient]);

  // Agregar nueva lectura
  const addReading = (date: string, value: number): ValidationResult => {
    const validation = validateReading(value, currentMonth.initialReading, currentMonth.readings);
    
    if (!validation.isValid) {
      return validation;
    }

    const newReading: Reading = {
      id: Date.now().toString(),
      date,
      value,
      consumption: value - currentMonth.initialReading
    };

    const updatedReadings = [...currentMonth.readings, newReading]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const stats = calculateConsumptionStats(
      updatedReadings,
      currentMonth.initialReading,
      tariff,
      currentMonth.tariffFlag
    );

    const updatedMonthData = {
      ...currentMonth,
      readings: updatedReadings,
      totalConsumption: stats.totalConsumption,
      estimatedCost: stats.estimatedCost
    };

    setMonthsData({
      ...monthsData,
      [currentMonthKey]: updatedMonthData
    });

    return { isValid: true };
  };

  // Eliminar lectura
  const deleteReading = (id: string): void => {
    const updatedReadings = currentMonth.readings.filter(r => r.id !== id);
    
    const stats = calculateConsumptionStats(
      updatedReadings,
      currentMonth.initialReading,
      tariff,
      currentMonth.tariffFlag
    );

    const updatedMonthData = {
      ...currentMonth,
      readings: updatedReadings,
      totalConsumption: stats.totalConsumption,
      estimatedCost: stats.estimatedCost
    };

    setMonthsData({
      ...monthsData,
      [currentMonthKey]: updatedMonthData
    });
  };

  // Verificar si un mes ya tiene datos guardados
  const hasMonthData = (month: string, year: number): boolean => {
    const monthKey = getMonthKey(month, year);
    return !!monthsData[monthKey];
  };

  // Cambiar mes (solo para meses existentes)
  const switchToMonth = (month: string, year: number): void => {
    const newMonthKey = getMonthKey(month, year);
    setCurrentMonthKey(newMonthKey);
  };

  // Cambiar mes (crear nuevo si no existe)
  const changeMonth = (month: string, year: number, initialReading: number, readingDay?: number): void => {
    const newMonthKey = getMonthKey(month, year);
    
    // Si el mes no existe, crearlo
    if (!monthsData[newMonthKey]) {
      const newMonthData: MonthData = {
        month,
        year,
        initialReading,
        readingDay: readingDay || 1,
        readings: [],
        totalConsumption: 0,
        estimatedCost: tariff.publicLightingFee || 0,
        tariffFlag: 'GREEN' // Bandera verde por defecto
      };
      
      setMonthsData({
        ...monthsData,
        [newMonthKey]: newMonthData
      });
    }
    
    // Cambiar al mes seleccionado
    setCurrentMonthKey(newMonthKey);
  };

  // Cambiar bandera tarifaria del mes actual
  const changeTariffFlag = (flagType: TariffFlagType): void => {
    const updatedMonthData = {
      ...currentMonth,
      tariffFlag: flagType
    };

    // Recalcular costos con la nueva bandera
    const stats = calculateConsumptionStats(
      currentMonth.readings,
      currentMonth.initialReading,
      tariff,
      flagType
    );

    updatedMonthData.estimatedCost = stats.estimatedCost;
    updatedMonthData.totalConsumption = stats.totalConsumption;

    setMonthsData({
      ...monthsData,
      [currentMonthKey]: updatedMonthData
    });
  };

  // Reiniciar mes actual
  const resetMonth = (): void => {
    const resetMonthData = {
      ...currentMonth,
      readings: [],
      totalConsumption: 0,
      estimatedCost: tariff.publicLightingFee || 0,
      tariffFlag: currentMonth.tariffFlag || 'GREEN' // Mantener la bandera actual
    };
    
    setMonthsData({
      ...monthsData,
      [currentMonthKey]: resetMonthData
    });
  };

  // Obtener lectura actual
  const getCurrentReading = (): number => {
    if (currentMonth.readings.length === 0) {
      return currentMonth.initialReading;
    }
    return Math.max(...currentMonth.readings.map(r => r.value));
  };

  // Obtener estadísticas de consumo
  const getConsumptionStats = (): ConsumptionStats => {
    return calculateConsumptionStats(
      currentMonth.readings,
      currentMonth.initialReading,
      tariff,
      currentMonth.tariffFlag
    );
  };

  return {
    currentMonth,
    tariff,
    tariffConfig: tariff,
    isLoading,
    addReading,
    deleteReading,
    changeMonth,
    switchToMonth,
    hasMonthData,
    resetMonth,
    getCurrentReading,
    getConsumptionStats,
    setTariff,
    changeTariffFlag
  };
};