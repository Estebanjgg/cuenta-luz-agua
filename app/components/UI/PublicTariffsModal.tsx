'use client';

import React, { useState } from 'react';
import { Tariff } from '../../types';
import { useTariffs } from '../../hooks/useTariffs';
import { useLanguage, Language } from '@/app/contexts/LanguageContext';

interface PublicTariffsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyTariff: (tariffId: string) => Promise<void>;
  publicTariffs: Tariff[];
}

export default function PublicTariffsModal({
  isOpen,
  onClose,
  onCopyTariff,
  publicTariffs
}: PublicTariffsModalProps) {
  const { searchPublicTariffs } = useTariffs();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Tariff[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copyingTariffId, setCopyingTariffId] = useState<string | null>(null);

  const infoItems = {
    es: [
      '• Las tarifas públicas son creadas por otros usuarios de la comunidad',
      '• Al copiar una tarifa, se creará una copia personal que podrás editar',
      '• Verifica siempre que los datos sean correctos antes de usar una tarifa',
      '• Puedes hacer tus propias tarifas públicas para ayudar a otros usuarios'
    ],
    'pt-BR': [
      '• As tarifas públicas são criadas por outros usuários da comunidade',
      '• Ao copiar uma tarifa, será criada uma cópia pessoal que você poderá editar',
      '• Sempre verifique se os dados estão corretos antes de usar uma tarifa',
      '• Você pode tornar suas próprias tarifas públicas para ajudar outros usuários'
    ]
  }[language as Language];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPublicTariffs(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tariffs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyTariff = async (tariffId: string) => {
    setCopyingTariffId(tariffId);
    try {
      await onCopyTariff(tariffId);
    } catch (error) {
      console.error('Error copying tariff:', error);
    } finally {
      setCopyingTariffId(null);
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

  const displayTariffs = searchTerm.trim() ? searchResults : publicTariffs;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('publicTariffsModal.title')}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('publicTariffsModal.searchPlaceholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSearching ? t('publicTariffsModal.searching') : t('publicTariffsModal.search')}
              </button>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  {t('publicTariffsModal.clear')}
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                {t('publicTariffsModal.resultsFound').replace('{count}', searchResults.length.toString()).replace('{term}', searchTerm)}
              </p>
            )}
          </div>

          {/* Lista de tarifas */}
          <div className="max-h-96 overflow-y-auto">
            {displayTariffs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? t('publicTariffsModal.noTariffsFound') : t('publicTariffsModal.noPublicTariffs')}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? t('publicTariffsModal.tryOtherTerms')
                    : t('publicTariffsModal.beFirstToCreate')
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayTariffs.map((tariff) => {
                  const isCopying = copyingTariffId === tariff.id;
                  
                  return (
                    <div
                      key={tariff.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {tariff.city}, {tariff.state}
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {t('publicTariffsModal.public')}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{tariff.company_name}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                            <div>
                              <span className="text-gray-500">🟢 {t('publicTariffsModal.green')}:</span>
                              <span className="ml-1 font-medium">{formatKwhPrice(tariff.price_per_kwh_green)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">🟡 {t('publicTariffsModal.yellow')}:</span>
                              <span className="ml-1 font-medium">{formatKwhPrice(tariff.price_per_kwh_yellow)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">🔴 {t('publicTariffsModal.red1')}:</span>
                              <span className="ml-1 font-medium">{formatKwhPrice(tariff.price_per_kwh_red_1)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">🔴 {t('publicTariffsModal.red2')}:</span>
                              <span className="ml-1 font-medium">{formatKwhPrice(tariff.price_per_kwh_red_2)}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">{t('publicTariffsModal.additionalFees')}:</span>
                              <span className="ml-1 font-medium">{formatCurrency(tariff.additional_fees)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('publicTariffsModal.publicLighting')}:</span>
                              <span className="ml-1 font-medium">{formatCurrency(tariff.public_lighting_fee)}</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-2">
                            {t('publicTariffsModal.created')}: {new Date(tariff.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={() => handleCopyTariff(tariff.id)}
                            disabled={isCopying}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {isCopying ? t('publicTariffsModal.copying') : t('publicTariffsModal.copyTariff')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">{t('publicTariffsModal.infoTitle')}</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {infoItems.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Botón cerrar */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t('publicTariffsModal.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}