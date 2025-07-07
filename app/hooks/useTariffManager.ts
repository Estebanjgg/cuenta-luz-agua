'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '../contexts/AuthContext';
import { SavedTariff, TariffConfig, ExtendedTariffConfig } from '../types';

/**
 * Hook unificado para gestionar tarifas guardadas y configuración del usuario
 * Maneja la sincronización entre saved_tariffs y user_tariff_config
 */
export function useTariffManager() {
  const { user, session } = useAuth();
  const [savedTariffs, setSavedTariffs] = useState<SavedTariff[]>([]);
  const [userTariffConfig, setUserTariffConfig] = useState<TariffConfig | null>(null);
  const [currentTariffSource, setCurrentTariffSource] = useState<ExtendedTariffConfig['source'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Cargar todas las tarifas guardadas (predefinidas + del usuario)
  const loadSavedTariffs = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('saved_tariffs')
        .select('*')
        .order('is_predefined', { ascending: false })
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setSavedTariffs(data || []);
    } catch (err) {
      console.error('Error loading saved tariffs:', err);
      setError(err instanceof Error ? err.message : 'Error cargando tarifas');
    }
  };

  // Cargar configuración actual del usuario
  const loadUserTariffConfig = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('user_tariff_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const config: TariffConfig = {
          pricePerKwh: Number(data.price_per_kwh),
          additionalFees: Number(data.additional_fees || 0),
          publicLightingFee: Number(data.public_lighting_fee || 0)
        };
        setUserTariffConfig(config);
      } else {
        // Configuración por defecto si no existe
        const defaultConfig: TariffConfig = {
          pricePerKwh: 0.795,
          additionalFees: 41.12,
          publicLightingFee: 0
        };
        setUserTariffConfig(defaultConfig);
      }
    } catch (err) {
      console.error('Error loading user tariff config:', err);
      setError(err instanceof Error ? err.message : 'Error cargando configuración');
    }
  };

  // Guardar nueva tarifa en saved_tariffs
  const saveTariff = async (tariff: Omit<SavedTariff, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user || !session) {
      throw new Error('Usuario no autenticado');
    }

    try {
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

      if (error) throw error;
      if (!data) throw new Error('No se recibieron datos de la inserción');

      // Actualizar estado local
      setSavedTariffs(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error saving tariff:', error);
      throw error;
    }
  };

  // Aplicar tarifa guardada como configuración del usuario
  const applyTariffToUser = async (tariff: SavedTariff) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const configData = {
        user_id: user.id,
        price_per_kwh: tariff.price_per_kwh,
        additional_fees: tariff.additional_fees || 0,
        public_lighting_fee: tariff.public_lighting_fee || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_tariff_config')
        .upsert(configData, { onConflict: 'user_id' });

      if (error) throw error;

      // Actualizar estado local
      const newConfig: TariffConfig = {
        pricePerKwh: tariff.price_per_kwh,
        additionalFees: tariff.additional_fees || 0,
        publicLightingFee: tariff.public_lighting_fee || 0
      };
      setUserTariffConfig(newConfig);

      // Actualizar información de origen
      setCurrentTariffSource({
        type: 'saved',
        company_name: tariff.company_name,
        company_code: tariff.company_code,
        city: tariff.city,
        state: tariff.state,
        saved_tariff_id: tariff.id
      });

      return newConfig;
    } catch (error) {
      console.error('Error applying tariff to user:', error);
      throw error;
    }
  };

  // Actualizar configuración manual del usuario
  const updateUserTariffConfig = async (config: TariffConfig, source?: ExtendedTariffConfig['source']) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const configData = {
        user_id: user.id,
        price_per_kwh: config.pricePerKwh,
        additional_fees: config.additionalFees || 0,
        public_lighting_fee: config.publicLightingFee || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_tariff_config')
        .upsert(configData, { onConflict: 'user_id' });

      if (error) throw error;

      setUserTariffConfig(config);
      setCurrentTariffSource(source || null);
      return config;
    } catch (error) {
      console.error('Error updating user tariff config:', error);
      throw error;
    }
  };

  // Eliminar tarifa guardada
  const deleteTariff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_tariffs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedTariffs(prev => prev.filter(tariff => tariff.id !== id));
    } catch (error) {
      console.error('Error deleting tariff:', error);
      throw error;
    }
  };

  // Obtener configuración extendida actual
  const getCurrentExtendedConfig = (): ExtendedTariffConfig | null => {
    if (!userTariffConfig) return null;

    return {
      ...userTariffConfig,
      source: currentTariffSource
    };
  };

  // Filtros y utilidades
  const getTariffsByLocation = (state?: string, city?: string) => {
    return savedTariffs.filter(tariff => {
      if (state && tariff.state !== state) return false;
      if (city && tariff.city !== city) return false;
      return true;
    });
  };

  const getPredefinedTariffs = () => {
    return savedTariffs.filter(tariff => tariff.is_predefined);
  };

  const getUserTariffs = () => {
    return savedTariffs.filter(tariff => !tariff.is_predefined && tariff.user_id === user?.id);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          loadSavedTariffs(),
          loadUserTariffConfig()
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err instanceof Error ? err.message : 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    // Estados
    savedTariffs,
    userTariffConfig,
    currentTariffSource,
    loading,
    error,
    
    // Acciones principales
    saveTariff,
    applyTariffToUser,
    updateUserTariffConfig,
    deleteTariff,
    
    // Utilidades
    getCurrentExtendedConfig,
    getTariffsByLocation,
    getPredefinedTariffs,
    getUserTariffs,
    
    // Recargar datos
    loadSavedTariffs,
    loadUserTariffConfig
  };
}