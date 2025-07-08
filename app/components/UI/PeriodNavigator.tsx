'use client';

import { useState, useEffect } from 'react';
import { MONTHS, APP_CONFIG } from '../../constants';
import { ValidationResult, Tariff } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import TariffManager from './TariffManager';

interface PeriodNavigatorProps {
  currentMonth: string;
  currentYear: number;
  onMonthChange: (month: string, year: number, initialReading: number) => void;
  onSwitchToMonth: (month: string, year: number) => void;
  hasMonthData: (month: string, year: number) => boolean;
  selectedMonthTariff?: Tariff | null;
  onTariffSelect?: (tariff: Tariff) => void;
}

export default function PeriodNavigator({ 
  currentMonth, 
  currentYear, 
  onMonthChange, 
  onSwitchToMonth, 
  hasMonthData,
  selectedMonthTariff,
  onTariffSelect
}: PeriodNavigatorProps) {
  const { t } = useLanguage();
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [showNewPeriodModal, setShowNewPeriodModal] = useState(false);
  const [showTariffManager, setShowTariffManager] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [initialReading, setInitialReading] = useState(APP_CONFIG.defaultInitialReading);
  const [error, setError] = useState<string>('');
  const [currentYearNow, setCurrentYearNow] = useState(2025);
  
  useEffect(() => {
    setCurrentYearNow(new Date().getFullYear());
  }, []);
  
  // Generar años dinámicamente (año actual - 1 hasta año actual + 2)
  const availableYears = Array.from({ length: 4 }, (_, i) => currentYearNow - 1 + i);

  const validateInitialReading = (value: number): ValidationResult => {
    if (isNaN(value) || value <= 0) {
      return {
        isValid: false,
        message: t('periodNavigator.validationErrors.invalidNumber')
      };
    }
    if (value > 999999) {
      return {
        isValid: false,
        message: t('periodNavigator.validationErrors.tooHigh')
      };
    }
    return { isValid: true };
  };

  const handlePeriodChange = (month: string, year: number) => {
    // Si ya existen datos para este mes, cambiar directamente
    if (hasMonthData(month, year)) {
      onSwitchToMonth(month, year);
      setIsMonthDropdownOpen(false);
      setIsYearDropdownOpen(false);
      return;
    }
    
    // Si no existen datos, mostrar modal para ingresar lectura inicial
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowNewPeriodModal(true);
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
  };

  const handleSubmitNewPeriod = () => {
    const validation = validateInitialReading(initialReading);
    
    if (!validation.isValid) {
      setError(validation.message || t('periodNavigator.validationErrors.validationError'));
      return;
    }
    
    setError('');
    onMonthChange(selectedMonth, selectedYear, initialReading);
    setShowNewPeriodModal(false);
  };

  const handleInitialReadingChange = (value: string) => {
    const numValue = parseFloat(value);
    setInitialReading(numValue);
    
    if (error) {
      setError('');
    }
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMonthDropdownOpen(false);
      setIsYearDropdownOpen(false);
    };

    if (isMonthDropdownOpen || isYearDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMonthDropdownOpen, isYearDropdownOpen]);

  return (
    <>
      {/* Navegador de Período Compacto */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          {/* Selector de Período */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-semibold text-gray-800">{t('periodNavigator.period')}</h2>
            </div>
            
            {/* Selector de Mes */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMonthDropdownOpen(!isMonthDropdownOpen);
                  setIsYearDropdownOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                <span>{currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}</span>
                <svg className={`w-4 h-4 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isMonthDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                  {MONTHS.map((month) => (
                    <button
                      key={month}
                      onClick={() => handlePeriodChange(month, currentYear)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                        month === currentMonth ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      } ${hasMonthData(month, currentYear) ? 'border-l-4 border-l-green-400' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{month.charAt(0).toUpperCase() + month.slice(1)}</span>
                        {hasMonthData(month, currentYear) && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selector de Año */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsYearDropdownOpen(!isYearDropdownOpen);
                  setIsMonthDropdownOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md"
              >
                <span>{currentYear}</span>
                <svg className={`w-4 h-4 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isYearDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => handlePeriodChange(currentMonth, year)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                        year === currentYear ? 'bg-gray-50 text-gray-800 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{year}</span>
                        {year === currentYearNow && (
                          <span className="text-xs text-blue-600">{t('periodNavigator.current')}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Gestión de Tarifas */}
          <div className="flex items-center space-x-4">
            {/* Información de Tarifa Actual */}
            <div className="text-right">
              {selectedMonthTariff ? (
                <div>
                  <p className="text-sm font-medium text-green-600">{t('periodNavigator.tariffAssigned')}</p>
                  <p className="text-xs text-gray-600">{selectedMonthTariff.company_name}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-orange-600">{t('periodNavigator.noTariff')}</p>
                  <p className="text-xs text-gray-600">{t('periodNavigator.assignTariff')}</p>
                </div>
              )}
            </div>
            
            {/* Botón de Gestión de Tarifas */}
            <button
              onClick={() => setShowTariffManager(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
              </svg>
              <span>{t('periodNavigator.manageTariffs')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal para Nuevo Período */}
      {showNewPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t('periodNavigator.newPeriodTitle')}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedMonth} {selectedYear}
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>{t('periodNavigator.importantNote')}</strong> {t('periodNavigator.importantMessage')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t('periodNavigator.initialReadingLabel')}
                </label>
                <input
                  type="number"
                  value={initialReading && initialReading !== 65788 ? initialReading : ''}
                  onChange={(e) => handleInitialReadingChange(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 transition-all duration-200 ${
                    error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  placeholder={t('periodNavigator.placeholder')}
                  step="1"
                />
                {error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={() => {
                  setShowNewPeriodModal(false);
                  setError('');
                }}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('periodNavigator.cancel')}
              </button>
              <button
                onClick={handleSubmitNewPeriod}
                disabled={!!error || !initialReading || initialReading === 0}
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center ${
                  error || !initialReading || initialReading === 0
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('periodNavigator.startPeriod')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Tarifas */}
      {showTariffManager && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTariffManager(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{t('periodNavigator.tariffManagementTitle')} - {currentMonth} {currentYear}</h2>
                  {selectedMonthTariff && (
                    <p className="text-sm text-green-600 mt-1">
                      {t('periodNavigator.currentTariff')} {selectedMonthTariff.city}, {selectedMonthTariff.state} - {selectedMonthTariff.company_name}
                    </p>
                  )}
                  {!selectedMonthTariff && (
                    <p className="text-sm text-orange-600 mt-1">
                      {t('periodNavigator.noTariffAssigned')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowTariffManager(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TariffManager 
                showSelectButton={true}
                selectedTariffId={selectedMonthTariff?.id}
                onTariffSelect={(tariff) => {
                  if (onTariffSelect) {
                    onTariffSelect(tariff);
                  }
                }}
              />
              
              {/* Botón de confirmación para cerrar el modal */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTariffManager(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {t('periodNavigator.cancel')}
                </button>
                <button
                  onClick={() => setShowTariffManager(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t('periodNavigator.confirmSelection')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}