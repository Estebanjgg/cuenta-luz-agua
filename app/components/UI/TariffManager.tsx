'use client';

import React, { useState } from 'react';
import { Tariff } from '../../types';
import { useTariffs } from '../../hooks/useTariffs';
import { useLanguage } from '../../contexts/LanguageContext';
import TariffModal from '../Forms/TariffModal';
import PublicTariffsModal from './PublicTariffsModal';
import ConfirmationModal from './ConfirmationModal';

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
  const [isConfirmSelectionOpen, setIsConfirmSelectionOpen] = useState(false);
  const [isConfirmCreationOpen, setIsConfirmCreationOpen] = useState(false);
  const [pendingTariff, setPendingTariff] = useState<Tariff | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTariffForConfirmation, setSelectedTariffForConfirmation] = useState<Tariff | null>(null);


  const handleCreateTariff = async (tariffData: any) => {
    const newTariff = await createTariff(tariffData);
    if (newTariff) {
      setIsCreateModalOpen(false);
      setPendingTariff(newTariff);
      setIsConfirmCreationOpen(true);
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
      setPendingTariff(copiedTariff);
      setIsConfirmCreationOpen(true);
    }
  };

  const handleTariffClick = (tariff: Tariff) => {
    setSelectedTariffForConfirmation(tariff);
  };

  const handleConfirmSelection = () => {
    if (selectedTariffForConfirmation) {
      setPendingTariff(selectedTariffForConfirmation);
      setIsConfirmSelectionOpen(true);
    }
  };

  const confirmTariffSelection = async () => {
    if (!pendingTariff) return;
    
    setIsProcessing(true);
    try {
      onTariffSelect?.(pendingTariff);
      setIsConfirmSelectionOpen(false);
      setPendingTariff(null);
      setSelectedTariffForConfirmation(null);
    } catch (error) {
      console.error('Error selecting tariff:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmTariffCreation = async () => {
    if (!pendingTariff) return;
    
    setIsProcessing(true);
    try {
      onTariffSelect?.(pendingTariff);
      setIsConfirmCreationOpen(false);
      setPendingTariff(null);
    } catch (error) {
      console.error('Error using created tariff:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const skipTariffCreation = () => {
    setIsConfirmCreationOpen(false);
    setPendingTariff(null);
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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('tariffManager.title')}</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <button
            onClick={() => setIsPublicModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
          >
            {t('tariffManager.publicTariffs')}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            {t('tariffManager.noTariffsTitle')}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
            {t('tariffManager.noTariffsDescription')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
            <button
              onClick={() => setIsPublicModalOpen(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              {t('tariffManager.viewPublicTariffs')}
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              {t('tariffManager.createNewTariff')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {userTariffs.map((tariff) => {
            const isSelected = selectedTariffId === tariff.id;
            const isDeleting = deletingTariffId === tariff.id;
            
            return (
              <div
                key={tariff.id}
                onClick={() => showSelectButton && handleTariffClick(tariff)}
                className={`border rounded-lg p-3 sm:p-4 transition-all ${
                  showSelectButton ? 'cursor-pointer' : ''
                } ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : selectedTariffForConfirmation?.id === tariff.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-2 mb-2 space-y-1 xs:space-y-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                        {tariff.city}, {tariff.state}
                      </h3>
                      {tariff.is_public && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full w-fit">
                          {t('tariffManager.public')}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 text-sm sm:text-base truncate">{tariff.company_name}</p>
                    
                    {/* Tarifa Base */}
                    <div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex flex-col xs:flex-row xs:items-center">
                        <span className="text-blue-700 font-medium whitespace-nowrap">⚡ {t('tariffManager.baseTariff')}:</span>
                        <span className="ml-0 xs:ml-2 font-bold text-blue-800 text-sm sm:text-base">{formatKwhPrice(tariff.base_price_per_kwh)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm">
                      <div className="flex flex-col xs:flex-row xs:items-center">
                        <span className="text-gray-500 whitespace-nowrap">🟢 {t('tariffManager.green')}:</span>
                        <span className="ml-0 xs:ml-1 font-medium truncate">{formatKwhPrice(tariff.price_per_kwh_green)}</span>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:items-center">
                        <span className="text-gray-500 whitespace-nowrap">🟡 {t('tariffManager.yellow')}:</span>
                        <span className="ml-0 xs:ml-1 font-medium truncate">{formatKwhPrice(tariff.price_per_kwh_yellow)}</span>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:items-center">
                        <span className="text-gray-500 whitespace-nowrap">🔴 {t('tariffManager.red1')}:</span>
                        <span className="ml-0 xs:ml-1 font-medium truncate">{formatKwhPrice(tariff.price_per_kwh_red_1)}</span>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:items-center">
                        <span className="text-gray-500 whitespace-nowrap">🔴 {t('tariffManager.red2')}:</span>
                        <span className="ml-0 xs:ml-1 font-medium truncate">{formatKwhPrice(tariff.price_per_kwh_red_2)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm mt-2">
                      <div className="flex flex-col xs:flex-row xs:items-center">
                        <span className="text-gray-500 whitespace-nowrap">{t('tariffManager.additionalFees')}:</span>
                        <span className="ml-0 xs:ml-1 font-medium truncate">{formatCurrency(tariff.additional_fees)}</span>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:items-center">
                        <span className="text-gray-500 whitespace-nowrap">{t('tariffManager.publicLighting')}:</span>
                        <span className="ml-0 xs:ml-1 font-medium truncate">{formatCurrency(tariff.public_lighting_fee)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row lg:flex-col lg:space-y-2 lg:ml-4 space-y-2 lg:space-x-0 sm:flex-row sm:space-y-0 sm:space-x-2 lg:w-auto w-full">
                    {showSelectButton && selectedTariffForConfirmation?.id === tariff.id && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleConfirmSelection();
                        }}
                        className="px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 w-full lg:w-auto flex-1 sm:flex-none lg:flex-none"
                      >
                        {t('tariffManager.confirmSelection')}
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingTariff(tariff);
                      }}
                      className="px-3 py-2 text-xs sm:text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 w-full lg:w-auto flex-1 sm:flex-none lg:flex-none"
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
                      className="px-3 py-2 text-xs sm:text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 w-full lg:w-auto flex-1 sm:flex-none lg:flex-none"
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

      {/* Modal de confirmación para selección de tarifa */}
      <ConfirmationModal
        isOpen={isConfirmSelectionOpen}
        onClose={() => {
          setIsConfirmSelectionOpen(false);
          setPendingTariff(null);
          setSelectedTariffForConfirmation(null);
        }}
        onConfirm={confirmTariffSelection}
        title={t('confirmationModal.tariffSelected')}
        message={pendingTariff ? 
          t('confirmationModal.tariffSelectedMessage')
            .replace('{city}', pendingTariff.city)
            .replace('{state}', pendingTariff.state)
            .replace('{company}', pendingTariff.company_name)
          : ''
        }
        confirmText={t('confirmationModal.confirm')}
        cancelText={t('confirmationModal.cancel')}
        type="info"
        isLoading={isProcessing}
      />

      {/* Modal de confirmación para tarifa creada */}
      <ConfirmationModal
        isOpen={isConfirmCreationOpen}
        onClose={skipTariffCreation}
        onConfirm={confirmTariffCreation}
        title={t('confirmationModal.tariffCreated')}
        message={pendingTariff ? 
          t('confirmationModal.tariffCreatedMessage')
            .replace('{city}', pendingTariff.city)
            .replace('{state}', pendingTariff.state)
            .replace('{company}', pendingTariff.company_name)
          : ''
        }
        confirmText={t('confirmationModal.useNow')}
        cancelText={t('confirmationModal.later')}
        type="success"
        isLoading={isProcessing}
      />

      {/* Modal de confirmación de eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              {t('tariffManager.confirmDeleteTitle')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {t('tariffManager.confirmDeleteMessage')}
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={cancelDelete}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 order-2 sm:order-1"
              >
                {t('tariffManager.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-md hover:bg-red-700 order-1 sm:order-2"
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