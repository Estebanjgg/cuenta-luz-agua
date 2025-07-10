'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Tariff, TariffFormData } from '../types';

export const useTariffs = () => {
  const { user } = useAuth();
  const [userTariffs, setUserTariffs] = useState<Tariff[]>([]);
  const [publicTariffs, setPublicTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  // Cargar tarifas del usuario y públicas
  useEffect(() => {
    if (user) {
      loadTariffs();
    } else {
      setUserTariffs([]);
      setPublicTariffs([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadTariffs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Cargar tarifas del usuario
      const { data: userTariffsData, error: userError } = await supabase
        .from('tariffs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) {
        console.error('Error loading user tariffs:', userError);
        setError('Error al cargar las tarifas del usuario');
      } else {
        setUserTariffs(userTariffsData || []);
      }

      // Cargar tarifas públicas
      const { data: publicTariffsData, error: publicError } = await supabase
        .from('tariffs')
        .select('*')
        .eq('is_public', true)
        .order('city', { ascending: true });

      if (publicError) {
        console.error('Error loading public tariffs:', publicError);
        setError('Error al cargar las tarifas públicas');
      } else {
        setPublicTariffs(publicTariffsData || []);
      }
    } catch (err) {
      console.error('Error loading tariffs:', err);
      setError('Error al cargar las tarifas');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nueva tarifa
  const createTariff = async (tariffData: TariffFormData): Promise<Tariff | null> => {
    if (!user) {
      setError('Usuario no autenticado');
      return null;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('tariffs')
        .insert({
          ...tariffData,
          user_id: user.id,
          is_public: tariffData.is_public || false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating tariff:', error);
        if (error.code === '23505') {
          setError('Ya existe una tarifa con estos datos');
        } else {
          setError('Error al crear la tarifa');
        }
        return null;
      }

      // Actualizar la lista local
      setUserTariffs(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating tariff:', err);
      setError('Error al crear la tarifa');
      return null;
    }
  };

  // Actualizar tarifa existente
  const updateTariff = async (tariffId: string, tariffData: Partial<TariffFormData>): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('tariffs')
        .update({
          ...tariffData,
          updated_at: new Date().toISOString()
        })
        .eq('id', tariffId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tariff:', error);
        setError('Error al actualizar la tarifa');
        return false;
      }

      // Actualizar la lista local
      setUserTariffs(prev => 
        prev.map(tariff => tariff.id === tariffId ? data : tariff)
      );
      return true;
    } catch (err) {
      console.error('Error updating tariff:', err);
      setError('Error al actualizar la tarifa');
      return false;
    }
  };

  // Eliminar tarifa
  const deleteTariff = async (tariffId: string): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('tariffs')
        .delete()
        .eq('id', tariffId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting tariff:', error);
        setError('Error al eliminar la tarifa');
        return false;
      }

      // Actualizar la lista local
      setUserTariffs(prev => prev.filter(tariff => tariff.id !== tariffId));
      return true;
    } catch (err) {
      console.error('Error deleting tariff:', err);
      setError('Error al eliminar la tarifa');
      return false;
    }
  };

  // Obtener o crear el registro de user_energy_data y devolver su UUID
  const getOrCreateEnergyDataId = async (month: string, year: number): Promise<string | null> => {
    if (!user) return null;

    try {
      // Primero intentar obtener el registro existente
      const { data: existingData, error: _ } = await supabase
        .from('user_energy_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .single();

      if (existingData) {
        return existingData.id;
      }

      // Si no existe, crear uno nuevo
      const { data: newData, error: insertError } = await supabase
        .from('user_energy_data')
        .insert({
          user_id: user.id,
          month,
          year,
          initial_reading: 0,
          readings: [],
          total_consumption: 0,
          estimated_cost: 0
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating energy data:', insertError);
        return null;
      }

      return newData?.id || null;
    } catch (err) {
      console.error('Error getting/creating energy data:', err);
      return null;
    }
  };

  // Asignar tarifa a un mes específico
  const assignTariffToMonth = async (month: string, year: number, tariffId: string): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    try {
      setError(null);
      
      // Obtener o crear el energy_data_id real
      const energyDataId = await getOrCreateEnergyDataId(month, year);
      if (!energyDataId) {
        setError('Error al obtener los datos de energía del mes');
        return false;
      }

      const { error } = await supabase
        .from('user_monthly_tariffs')
        .upsert({
          user_id: user.id,
          energy_data_id: energyDataId,
          tariff_id: tariffId
        }, {
          onConflict: 'user_id,energy_data_id'
        });

      if (error) {
        console.error('Error assigning tariff to month:', error);
        setError('Error al asignar la tarifa al mes');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error assigning tariff to month:', err);
      setError('Error al asignar la tarifa al mes');
      return false;
    }
  };

  // Obtener tarifa asignada a un mes específico
  const getMonthTariff = async (month: string, year: number): Promise<Tariff | null> => {
    if (!user) return null;

    try {
      // Primero obtener el energy_data_id real
      const { data: energyData, error: energyError } = await supabase
        .from('user_energy_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle(); // Usar maybeSingle() en lugar de single() para evitar errores

      if (energyError) {
        // Solo loggear errores reales, no "no rows found"
        if (energyError.code !== 'PGRST116') {
          console.error('Error getting energy data:', energyError);
        }
        return null;
      }

      if (!energyData) {
        // Si no existe el registro de energy_data, no hay tarifa asignada
        return null;
      }

      const { data, error } = await supabase
        .from('user_monthly_tariffs')
        .select(`
          *,
          tariff:tariffs(*)
        `)
        .eq('user_id', user.id)
        .eq('energy_data_id', energyData.id)
        .maybeSingle(); // Usar maybeSingle() para evitar errores 406

      if (error) {
        // Solo loggear errores reales
        if (error.code !== 'PGRST116') {
          console.error('Error getting month tariff:', error);
        }
        return null;
      }

      // Validar que data existe y tiene la estructura esperada
      if (!data || !data.tariff) {
        return null;
      }

      return data.tariff as Tariff;
    } catch (err) {
      console.error('Error getting month tariff:', err);
      return null;
    }
  };

  // Copiar tarifa pública a tarifas del usuario
  const copyPublicTariff = async (publicTariffId: string): Promise<Tariff | null> => {
    if (!user) {
      setError('Usuario no autenticado');
      return null;
    }

    try {
      setError(null);
      
      // Obtener la tarifa pública
      const publicTariff = publicTariffs.find(t => t.id === publicTariffId);
      if (!publicTariff) {
        setError('Tarifa pública no encontrada');
        return null;
      }

      // Crear una copia para el usuario
      const { data, error } = await supabase
        .from('tariffs')
        .insert({
          user_id: user.id,
          city: publicTariff.city,
          state: publicTariff.state,
          company_name: publicTariff.company_name,
          base_price_per_kwh: publicTariff.base_price_per_kwh,
          price_per_kwh_green: publicTariff.price_per_kwh_green,
          price_per_kwh_yellow: publicTariff.price_per_kwh_yellow,
          price_per_kwh_red_1: publicTariff.price_per_kwh_red_1,
          price_per_kwh_red_2: publicTariff.price_per_kwh_red_2,
          additional_fees: publicTariff.additional_fees,
          public_lighting_fee: publicTariff.public_lighting_fee,
          is_public: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error copying public tariff:', error);
        if (error.code === '23505') {
          setError('Ya tienes una copia de esta tarifa');
        } else {
          setError('Error al copiar la tarifa');
        }
        return null;
      }

      // Actualizar la lista local
      setUserTariffs(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error copying public tariff:', err);
      setError('Error al copiar la tarifa');
      return null;
    }
  };

  // Buscar tarifas públicas por ciudad/estado
  const searchPublicTariffs = async (searchTerm: string): Promise<Tariff[]> => {
    try {
      const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .eq('is_public', true)
        .or(`city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
        .order('city', { ascending: true });

      if (error) {
        console.error('Error searching public tariffs:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error searching public tariffs:', err);
      return [];
    }
  };

  return {
    userTariffs,
    publicTariffs,
    isLoading,
    error,
    createTariff,
    updateTariff,
    deleteTariff,
    assignTariffToMonth,
    getMonthTariff,
    getOrCreateEnergyDataId,
    copyPublicTariff,
    searchPublicTariffs,
    refreshTariffs: loadTariffs
  };
};