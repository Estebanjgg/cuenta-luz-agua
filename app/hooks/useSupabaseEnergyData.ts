'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { MonthData, TariffConfig, Reading, ConsumptionStats, ValidationResult, TariffFlagType } from '../types'
import { validateReading, calculateConsumptionStats } from '../utils/calculations'

const DEFAULT_TARIFF: TariffConfig = {
  pricePerKwh: 0.795,
  additionalFees: 41.12
}

const DEFAULT_MONTH_DATA: MonthData = {
  month: 'enero',
  year: 2025,
  initialReading: 0,
  readings: [],
  totalConsumption: 0,
  estimatedCost: DEFAULT_TARIFF.additionalFees || 0,
  tariffFlag: 'GREEN'
}

export const useSupabaseEnergyData = () => {
  const { user } = useAuth()
  const [monthsData, setMonthsData] = useState<Record<string, MonthData>>({})
  const [currentMonthKey, setCurrentMonthKey] = useState<string>('enero-2025')
  const [tariff, setTariff] = useState<TariffConfig>(DEFAULT_TARIFF)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  // Función para generar clave del mes
  const getMonthKey = (month: string, year: number): string => {
    return `${month}-${year}`
  }

  // Obtener datos del mes actual
  const currentMonth = monthsData[currentMonthKey] || DEFAULT_MONTH_DATA

  // Cargar datos del usuario desde Supabase
  useEffect(() => {
    if (user) {
      loadUserData()
      loadUserTariff()
    } else {
      setMonthsData({})
      setTariff(DEFAULT_TARIFF)
      setIsLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_energy_data')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error loading user data:', error)
        return
      }

      const userMonthsData: Record<string, MonthData> = {}
      data?.forEach((record) => {
        const monthKey = getMonthKey(record.month, record.year)
        userMonthsData[monthKey] = {
          month: record.month,
          year: record.year,
          initialReading: record.initial_reading,
          readings: record.readings || [],
          totalConsumption: record.total_consumption,
          estimatedCost: record.estimated_cost,
          tariffFlag: record.tariff_flag || 'GREEN'
        }
      })

      setMonthsData(userMonthsData)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      setIsLoading(false)
    }
  }

  const loadUserTariff = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_tariff_config')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user tariff:', error)
        return
      }

      if (data) {
        setTariff({
          pricePerKwh: data.price_per_kwh,
          additionalFees: data.additional_fees,
          publicLightingFee: data.public_lighting_fee
        })
      }
    } catch (error) {
      console.error('Error loading user tariff:', error)
    }
  }

  const saveMonthData = async (monthData: MonthData) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_energy_data')
        .upsert({
          user_id: user.id,
          month: monthData.month,
          year: monthData.year,
          initial_reading: monthData.initialReading,
          readings: monthData.readings,
          total_consumption: monthData.totalConsumption,
          estimated_cost: monthData.estimatedCost,
          tariff_flag: monthData.tariffFlag || 'GREEN',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,month,year'
        })

      if (error) {
        console.error('Error saving month data:', error)
      }
    } catch (error) {
      console.error('Error saving month data:', error)
    }
  }

  const saveTariffConfig = async (newTariff: TariffConfig) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_tariff_config')
        .upsert({
          user_id: user.id,
          price_per_kwh: newTariff.pricePerKwh,
          additional_fees: newTariff.additionalFees || 0,
          public_lighting_fee: newTariff.publicLightingFee,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving tariff config:', error)
      }
    } catch (error) {
      console.error('Error saving tariff config:', error)
    }
  }

  // Agregar nueva lectura
  const addReading = async (date: string, value: number): Promise<ValidationResult> => {
    const validation = validateReading(value, currentMonth.initialReading, currentMonth.readings)
    
    if (!validation.isValid) {
      return validation
    }

    const newReading: Reading = {
      id: Date.now().toString(),
      date,
      value,
      consumption: value - currentMonth.initialReading
    }

    const updatedReadings = [...currentMonth.readings, newReading]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const stats = calculateConsumptionStats(
      updatedReadings,
      currentMonth.initialReading,
      tariff,
      currentMonth.tariffFlag
    )

    const updatedMonthData = {
      ...currentMonth,
      readings: updatedReadings,
      totalConsumption: stats.totalConsumption,
      estimatedCost: stats.estimatedCost
    }

    setMonthsData({
      ...monthsData,
      [currentMonthKey]: updatedMonthData
    })

    // Guardar en Supabase
    await saveMonthData(updatedMonthData)

    return { isValid: true }
  }

  // Eliminar lectura
  const deleteReading = async (id: string): Promise<void> => {
    const updatedReadings = currentMonth.readings.filter(r => r.id !== id)
    
    const stats = calculateConsumptionStats(
      updatedReadings,
      currentMonth.initialReading,
      tariff,
      currentMonth.tariffFlag
    )

    const updatedMonthData = {
      ...currentMonth,
      readings: updatedReadings,
      totalConsumption: stats.totalConsumption,
      estimatedCost: stats.estimatedCost
    }

    setMonthsData({
      ...monthsData,
      [currentMonthKey]: updatedMonthData
    })

    // Guardar en Supabase
    await saveMonthData(updatedMonthData)
  }

  // Verificar si un mes ya tiene datos guardados
  const hasMonthData = (month: string, year: number): boolean => {
    const monthKey = getMonthKey(month, year)
    return !!monthsData[monthKey]
  }

  // Cambiar mes (solo para meses existentes)
  const switchToMonth = (month: string, year: number): void => {
    const newMonthKey = getMonthKey(month, year)
    setCurrentMonthKey(newMonthKey)
  }

  // Cambiar mes (crear nuevo si no existe)
  const changeMonth = async (month: string, year: number, initialReading: number): Promise<void> => {
    const newMonthKey = getMonthKey(month, year)
    
    // Si el mes no existe, crearlo
    if (!monthsData[newMonthKey]) {
      const newMonthData: MonthData = {
        month,
        year,
        initialReading,
        readings: [],
        totalConsumption: 0,
        estimatedCost: tariff.publicLightingFee || tariff.additionalFees || 0,
        tariffFlag: 'GREEN'
      }
      
      setMonthsData({
        ...monthsData,
        [newMonthKey]: newMonthData
      })

      // Guardar en Supabase
      await saveMonthData(newMonthData)
    }
    
    // Cambiar al mes seleccionado
    setCurrentMonthKey(newMonthKey)
  }

  // Reiniciar mes actual
  const resetMonth = async (): Promise<void> => {
    const resetMonthData = {
      ...currentMonth,
      readings: [],
      totalConsumption: 0,
      estimatedCost: tariff.publicLightingFee || tariff.additionalFees || 0,
      tariffFlag: currentMonth.tariffFlag || 'GREEN'
    }
    
    setMonthsData({
      ...monthsData,
      [currentMonthKey]: resetMonthData
    })

    // Guardar en Supabase
    await saveMonthData(resetMonthData)
  }

  // Actualizar configuración de tarifa
  const updateTariff = async (newTariff: TariffConfig): Promise<void> => {
    setTariff(newTariff)
    await saveTariffConfig(newTariff)
  }

  // Cambiar bandera tarifaria del mes actual
  const changeTariffFlag = async (flagType: TariffFlagType): Promise<void> => {
    const updatedMonthData = {
      ...currentMonth,
      tariffFlag: flagType
    }

    // Recalcular costos con la nueva bandera
    const stats = calculateConsumptionStats(
      currentMonth.readings,
      currentMonth.initialReading,
      tariff,
      flagType
    )

    updatedMonthData.estimatedCost = stats.estimatedCost
    updatedMonthData.totalConsumption = stats.totalConsumption

    setMonthsData({
      ...monthsData,
      [currentMonthKey]: updatedMonthData
    })

    // Guardar en Supabase
    await saveMonthData(updatedMonthData)
  }

  // Obtener lectura actual
  const getCurrentReading = (): number => {
    if (currentMonth.readings.length === 0) {
      return currentMonth.initialReading
    }
    return Math.max(...currentMonth.readings.map(r => r.value))
  }

  // Obtener estadísticas de consumo
  const getConsumptionStats = (): ConsumptionStats => {
    return calculateConsumptionStats(
      currentMonth.readings,
      currentMonth.initialReading,
      tariff,
      currentMonth.tariffFlag
    )
  }

  return {
    // Estado
    currentMonth,
    tariff,
    isLoading,
    
    // Acciones
    addReading,
    deleteReading,
    changeMonth,
    switchToMonth,
    hasMonthData,
    resetMonth,
    updateTariff,
    changeTariffFlag,
    
    // Utilidades
    getCurrentReading,
    getConsumptionStats
  }
}