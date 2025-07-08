'use client';

import React, { useState, useEffect } from 'react';
import { Tariff } from '../../types';
import { useTariffs } from '../../hooks/useTariffs';
import { useLanguage } from '../../contexts/LanguageContext';
import TariffModal from '../Forms/TariffModal';
import PublicTariffsModal from './PublicTariffsModal';

interface TariffSelectorProps {
  selectedTariffId?: string;
  onTariffSelect: (tariff: Tariff) => void;
  month?: string; // Para asociar la tarifa al mes específico
  year?: number;
  className?: string;
}

export default function TariffSelector({
  selectedTariffId,
  onTariffSelect,
  month,
  year,
  className = ''
}: TariffSelectorProps) {
  const {
    userTariffs,
    publicTariffs,
    isLoading,
    error,
    createTariff,
    copyPublicTariff,
    assignTariffToMonth,
    getMonthTariff
  } = useTariffs();
  const { t } = useLanguage();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);

  // Cargar tarifa del mes si existe month y year
  useEffect(() => {
    if (month && year && !selectedTariffId) {
      loadMonthTariff();
    }
  }, [month, year]);

  // Actualizar tarifa seleccionada cuando cambie el ID
  useEffect(() => {
    if (selectedTariffId) {
      const tariff = userTariffs.find(t => t.id === selectedTariffId);
      if (tariff) {
        setSelectedTariff(tariff);
      }
    } else {
      setSelectedTariff(null);
    }
  }, [selectedTariffId, userTariffs]);

  const loadMonthTariff = async () => {
    if (!month || !year) return;
    
    const monthTariff = await getMonthTariff(month, year);
    if (monthTariff) {
      setSelectedTariff(monthTariff);
      onTariffSelect(monthTariff);
    }
  };

  const handleTariffSelect = async (tariff: Tariff) => {
    setSelectedTariff(tariff);
    onTariffSelect(tariff);
    
    // Si hay month y year, asociar la tarifa al mes
    if (month && year) {
      await assignTariffToMonth(month, year, tariff.id);
    }
  };

  const handleCreateTariff = async (tariffData: any) => {
    const newTariff = await createTariff(tariffData);
    if (newTariff) {
      setIsCreateModalOpen(false);
      handleTariffSelect(newTariff);
      return true;
    }
    return false;
  };

  const handleCopyPublicTariff = async (publicTariffId: string) => {
    const copiedTariff = await copyPublicTariff(publicTariffId);
    if (copiedTariff) {
      setIsPublicModalOpen(false);
      handleTariffSelect(copiedTariff);
    }
  };

  const formatKwhPrice = (value: number) => {
    return `R$ ${value.toFixed(4)}/kWh`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('tariffSelector.title')}</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Tarifa seleccionada */}
      {selectedTariff && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-blue-800">
                {selectedTariff.city}, {selectedTariff.state}
              </h4>
              <p className="text-blue-600 text-sm">{selectedTariff.company_name}</p>
              <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                <span>🟢 {formatKwhPrice(selectedTariff.price_per_kwh_green)}</span>
                <span>🟡 {formatKwhPrice(selectedTariff.price_per_kwh_yellow)}</span>
                <span>🔴 {formatKwhPrice(selectedTariff.price_per_kwh_red_1)}</span>
                <span>🔴 {formatKwhPrice(selectedTariff.price_per_kwh_red_2)}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedTariff(null);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {t('tariffSelector.change')}
            </button>
          </div>
        </div>
      )}

      {/* Selector de tarifa */}
      {!selectedTariff && (
        <div className="space-y-3">
          {/* Tarifas del usuario */}
          {userTariffs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tariffSelector.myTariffs')}
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const tariff = userTariffs.find(t => t.id === e.target.value);
                    if (tariff) handleTariffSelect(tariff);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
              >
                <option value="">{t('tariffSelector.selectExisting')}</option>
                {userTariffs.map((tariff) => (
                  <option key={tariff.id} value={tariff.id}>
                    {tariff.city}, {tariff.state} - {tariff.company_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCreateModalOpen(true);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('tariffSelector.createNew')}
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPublicModalOpen(true);
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {t('tariffSelector.viewPublic')}
            </button>
          </div>

          {/* Información */}
          <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
            {t('tariffSelector.tip')}
          </div>
        </div>
      )}

      {/* Modal para crear tarifa */}
      <TariffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTariff}
        title={t('tariffSelector.newTariff')}
      />

      {/* Modal para tarifas públicas */}
      <PublicTariffsModal
        isOpen={isPublicModalOpen}
        onClose={() => setIsPublicModalOpen(false)}
        onCopyTariff={handleCopyPublicTariff}
        publicTariffs={publicTariffs}
      />
    </div>
  );
}