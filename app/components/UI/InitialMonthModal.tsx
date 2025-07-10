'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MONTH_KEYS, APP_CONFIG } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { ValidationResult } from '../../types';

interface InitialMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMonthSelect: (month: string, year: number, initialReading?: number, readingDay?: number) => void;
  hasMonthData: (month: string, year: number) => boolean;
  onSwitchToMonth: (month: string, year: number) => void;
}

export default function InitialMonthModal({ 
  isOpen, 
  onClose, 
  onMonthSelect, 
  hasMonthData, 
  onSwitchToMonth 
}: InitialMonthModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [initialReading, setInitialReading] = useState(APP_CONFIG.defaultInitialReading);
  const [readingDay, setReadingDay] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [showNewMonthForm, setShowNewMonthForm] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  
  // Generar años dinámicamente (año actual - 1 hasta año actual + 2)
  const currentYearNow = new Date().getFullYear();
  const availableYears = Array.from({ length: 4 }, (_, i) => currentYearNow - 1 + i);

  const validateInitialReading = (value: number): ValidationResult => {
    if (isNaN(value) || value <= 0) {
      return {
        isValid: false,
        message: t('monthSelector.validationError')
      };
    }
    if (value > 999999) {
      return {
        isValid: false,
        message: t('monthSelector.validationTooHigh')
      };
    }
    return { isValid: true };
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
    
    // Si el mes ya tiene datos, cargar directamente
    if (hasMonthData(month, selectedYear)) {
      onSwitchToMonth(month, selectedYear);
      onClose();
      return;
    }
    
    // Si no tiene datos, mostrar formulario para crear nuevo período
    setShowNewMonthForm(true);
  };

  const handleCreateNewPeriod = () => {
    const validation = validateInitialReading(initialReading);
    
    if (!validation.isValid) {
      setError(validation.message || t('monthSelector.validationGeneral'));
      return;
    }
    
    setError('');
    onMonthSelect(selectedMonth, selectedYear, initialReading, readingDay);
    onClose();
    setShowNewMonthForm(false);
  };

  const handleInitialReadingChange = (value: string) => {
    const numValue = parseFloat(value);
    setInitialReading(numValue);
    
    if (error) {
      setError('');
    }
  };



  const handleClose = () => {
    setShowConfirmExit(true);
  };

  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    onClose();
    router.push('/');
  };

  const handleCancelExit = () => {
    setShowConfirmExit(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-6m0 0V7m0 6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('initialMonthModal.welcomeTitle')}</h2>
                <p className="text-blue-100 text-sm">{t('initialMonthModal.welcomeSubtitle')}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {!showNewMonthForm ? (
            <>
              {/* Selector de Año */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📅 {t('initialMonthModal.selectYear')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-4 py-3 rounded-lg transition-colors font-medium border-2 ${
                        year === selectedYear
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {year}
                      {year === currentYearNow && (
                        <span className="block text-xs opacity-75">{t('initialMonthModal.current')}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Mes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📊 {t('initialMonthModal.selectMonth')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MONTH_KEYS.map((month) => {
                    const hasData = hasMonthData(month, selectedYear);
                    return (
                      <button
                        key={month}
                        onClick={() => handleMonthClick(month)}
                        className={`px-4 py-3 rounded-lg transition-all font-medium border-2 relative ${
                          hasData
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {t(`months.${month}`).charAt(0).toUpperCase() + t(`months.${month}`).slice(1)}
                          </span>
                          {hasData && (
                            <div className="bg-green-500 w-2 h-2 rounded-full"></div>
                          )}
                        </div>
                        {hasData && (
                          <span className="text-xs text-green-600 block mt-1">{t('initialMonthModal.withData')}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leyenda */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">💡 {t('initialMonthModal.infoTitle')}:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="bg-green-500 w-3 h-3 rounded-full mr-2"></div>
                    <span>{t('initialMonthModal.monthsWithData')}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-gray-300 w-3 h-3 rounded-full mr-2"></div>
                    <span>{t('initialMonthModal.monthsWithoutData')}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Formulario para nuevo período */
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Crear nuevo período
                </h3>
                <p className="text-gray-600">
                  {t(`months.${selectedMonth}`).charAt(0).toUpperCase() + t(`months.${selectedMonth}`).slice(1)} {selectedYear}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>{t('initialMonthModal.importantNote')}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('monthSelector.initialReadingLabel')}
                  </label>
                  <input
                    type="number"
                    value={initialReading && initialReading !== 65788 ? initialReading : ''}
                    onChange={(e) => handleInitialReadingChange(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 transition-all duration-200 ${
                      error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder={t('monthSelector.placeholder')}
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

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-6m0 0V7m0 6h6m-6 0H6" />
                    </svg>
                    {t('initialMonthModal.measurementDay')}
                  </label>
                  <select
                    value={readingDay}
                    onChange={(e) => setReadingDay(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {t('initialMonthModal.dayLabel')} {day}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 {t('initialMonthModal.measurementDayHelp')}
                  </p>
                </div>
              </div>

              <div className="flex justify-between space-x-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowNewMonthForm(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('initialMonthModal.back')}
                </button>
                <button
                  onClick={handleCreateNewPeriod}
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
                  {t('initialMonthModal.createPeriod')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de salida */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('confirmExit')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('confirmExitMessage')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelExit}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}