'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SavedTariff } from '../types';
import { useAuth } from '../contexts/AuthContext';

/**
 * @deprecated Use useTariffManager instead for better integration with user_tariff_config
 * This hook is maintained for backward compatibility
 */

export function useSavedTariffs() {
  const [savedTariffs, setSavedTariffs] = useState<SavedTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Cargar tarifas guardadas (predefinidas + del usuario)
  const loadSavedTariffs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('saved_tariffs')
        .select('*')
        .order('is_predefined', { ascending: false })
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setSavedTariffs(data || []);
    } catch (err) {
      console.error('Error loading saved tariffs:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Guardar nueva tarifa
  const saveTariff = async (tariff: Omit<SavedTariff, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Error de autenticación: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const dataToInsert = {
        ...tariff,
        user_id: user.id,
        is_predefined: false
      };
      
      const { data, error } = await supabase
        .from('saved_tariffs')
        .insert(dataToInsert)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error de base de datos: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No se recibieron datos de la inserción');
      }
      
      // Actualizar el estado local
      setSavedTariffs(prev => [...prev, data]);
      
      return data;
      
    } catch (error) {
      console.error('Error al guardar tarifa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      throw error;
    }
  };

  // Actualizar tarifa existente
  const updateTariff = async (id: string, updates: Partial<SavedTariff>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('saved_tariffs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Actualizar lista local
      setSavedTariffs(prev => 
        prev.map(tariff => tariff.id === id ? data : tariff)
      );
      return data;
    } catch (err) {
      console.error('Error updating tariff:', err);
      throw err;
    }
  };

  // Eliminar tarifa
  const deleteTariff = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('saved_tariffs')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Actualizar lista local
      setSavedTariffs(prev => prev.filter(tariff => tariff.id !== id));
    } catch (err) {
      console.error('Error deleting tariff:', err);
      throw err;
    }
  };

  // Guardar tarifa basada en factura como predefinida de Bragança Paulista
  const saveInvoiceBasedTariff = async (tariffConfig: {
    pricePerKwh: number;
    publicLightingFee?: number;
    additionalFees?: number;
  }) => {
    try {
      const tariffName = `Tarifa basada en factura - ${new Date().toLocaleDateString('es-BR')}`;
      
      const newTariff = {
        name: tariffName,
        company_name: 'CPFL Paulista',
        company_code: 'CPFL',
        city: 'Bragança Paulista',
        state: 'SP',
        price_per_kwh: tariffConfig.pricePerKwh,
        public_lighting_fee: tariffConfig.publicLightingFee || 0,
        additional_fees: tariffConfig.additionalFees || 0,
        source_type: 'invoice' as const,
        is_predefined: false
      };

      return await saveTariff(newTariff);
    } catch (err) {
      console.error('Error saving invoice-based tariff:', err);
      throw err;
    }
  };

  // Obtener tarifas por estado/ciudad
  const getTariffsByLocation = (state?: string, city?: string) => {
    return savedTariffs.filter(tariff => {
      if (state && tariff.state !== state) return false;
      if (city && tariff.city !== city) return false;
      return true;
    });
  };

  // Obtener tarifas predefinidas
  const getPredefinedTariffs = () => {
    return savedTariffs.filter(tariff => tariff.is_predefined);
  };

  // Obtener tarifas del usuario
  const getUserTariffs = () => {
    return savedTariffs.filter(tariff => !tariff.is_predefined);
  };

  useEffect(() => {
    loadSavedTariffs();
  }, []);

  return {
    savedTariffs,
    loading,
    error,
    loadSavedTariffs,
    saveTariff,
    updateTariff,
    deleteTariff,
    saveInvoiceBasedTariff,
    getTariffsByLocation,
    getPredefinedTariffs,
    getUserTariffs
  };
}