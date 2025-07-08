'use client';

import React, { useState } from 'react';
import { Tariff } from '../../types';
import { useTariffs } from '../../hooks/useTariffs';
import { useLanguage } from '../../contexts/LanguageContext';
import TariffModal from '../Forms/TariffModal';
import PublicTariffsModal from './PublicTariffsModal';

interface TariffManagerProps {
  onTariffSelect?: (tariff: Tariff) => void;
  selectedTariffId?: string;
  showSelectButton?: boolean;
}

export default function TariffManager({ 
  onTariffSelect, 
  selectedTariffId, 
  showSelectButton = false 
}: TariffManagerProps) {
  const {
    userTariffs,
    publicTariffs,
    isLoading,
    error,
    createTariff,
    updateTariff,
    deleteTariff,
    copyPublicTariff,
    refreshTariffs
  } = useTariffs();
  const { t } = useLanguage();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [deletingTariffId, setDeletingTariffId] = useState<string | null>(null);

  const handleCreateTariff = async (tariffData: any) => {
    const newTariff = await createTariff(tariffData);
    if (newTariff) {
      setIsCreateModalOpen(false);
      return true;
    }
    return false;
  };

  const handleUpdateTariff = async (tariffData: any) => {
    if (!editingTariff) return false;
    
    const success = await updateTariff(editingTariff.id, tariffData);
    if (success) {
      setEditingTariff(null);
      return true;
    }
    return false;
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteTariff = async (tariffId: string) => {
    setConfirmDeleteId(tariffId);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      setDeletingTariffId(confirmDeleteId);
      const success = await deleteTariff(confirmDeleteId);
      setDeletingTariffId(null);
      setConfirmDeleteId(null);
      
      if (!success) {
        alert(t('tariffManager.deleteError'));
      }
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleCopyPublicTariff = async (publicTariffId: string) => {
    const copiedTariff = await copyPublicTariff(publicTariffId);
    if (copiedTariff) {
      setIsPublicModalOpen(false);
      alert(t('tariffManager.copySuccess'));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatKwhPrice = (value: number) => {
    return `R$ ${value.toFixed(4)}/kWh`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('tariffManager.title')}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsPublicModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {t('tariffManager.publicTariffs')}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('tariffManager.newTariff')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {userTariffs.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('tariffManager.noTariffsTitle')}</h3>
          <p className="text-gray-500 mb-4">
            {t('tariffManager.noTariffsDescription')}
          </p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setIsPublicModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {t('tariffManager.viewPublicTariffs')}
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('tariffManager.createNewTariff')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {userTariffs.map((tariff) => {
            const isSelected = selectedTariffId === tariff.id;
            const isDeleting = deletingTariffId === tariff.id;
            
            return (
              <div
                key={tariff.id}
                className={`border rounded-lg p-4 transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {tariff.city}, {tariff.state}
                      </h3>
                      {tariff.is_public && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {t('tariffManager.public')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{tariff.company_name}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">🟢 {t('tariffManager.green')}:</span>
                        <span className="ml-1 font-medium">{formatKwhPrice(tariff.price_per_kwh_green)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">🟡 {t('tariffManager.yellow')}:</span>
                        <span className="ml-1 font-medium">{formatKwhPrice(tariff.price_per_kwh_yellow)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">🔴 {t('tariffManager.red1')}:</span>
                        <span className="ml-1 font-medium">{formatKwhPrice(tariff.price_per_kwh_red_1)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">🔴 {t('tariffManager.red2')}:</span>
                        <span className="ml-1 font-medium">{formatKwhPrice(tariff.price_per_kwh_red_2)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div>
                        <span className="text-gray-500">{t('tariffManager.additionalFees')}:</span>
                        <span className="ml-1 font-medium">{formatCurrency(tariff.additional_fees)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('tariffManager.publicLighting')}:</span>
                        <span className="ml-1 font-medium">{formatCurrency(tariff.public_lighting_fee)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {showSelectButton && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onTariffSelect?.(tariff);
                        }}
                        className={`px-3 py-1 text-sm rounded-md ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                          {isSelected ? t('tariffManager.selected') : t('tariffManager.select')}
                        </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingTariff(tariff);
                      }}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                    >
                      {t('tariffManager.edit')}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteTariff(tariff.id);
                      }}
                      disabled={isDeleting}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                    >
                      {isDeleting ? t('tariffManager.deleting') : t('tariffManager.delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para crear tarifa */}
      <TariffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTariff}
        title={t('tariffManager.newTariff')}
      />

      {/* Modal para editar tarifa */}
      <TariffModal
        isOpen={!!editingTariff}
        onClose={() => setEditingTariff(null)}
        onSave={handleUpdateTariff}
        tariff={editingTariff}
        title={t('tariffManager.editTariff')}
      />

      {/* Modal para tarifas públicas */}
      <PublicTariffsModal
        isOpen={isPublicModalOpen}
        onClose={() => setIsPublicModalOpen(false)}
        onCopyTariff={handleCopyPublicTariff}
        publicTariffs={publicTariffs}
      />

      {/* Modal de confirmación de eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('tariffManager.confirmDeleteTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('tariffManager.confirmDeleteMessage')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('tariffManager.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('tariffManager.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}