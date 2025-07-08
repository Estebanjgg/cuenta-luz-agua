'use client';

import { useState } from 'react';
import { MONTH_KEYS, APP_CONFIG } from '../../constants';
import { ValidationResult } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface MonthSelectorProps {
  currentMonth: string;
  currentYear: number;
  onMonthChange: (month: string, year: number, initialReading: number) => void;
  onSwitchToMonth: (month: string, year: number) => void;
  hasMonthData: (month: string, year: number) => boolean;
}

export default function MonthSelector({ currentMonth, currentYear, onMonthChange, onSwitchToMonth, hasMonthData }: MonthSelectorProps) {
  const { t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [initialReading, setInitialReading] = useState(APP_CONFIG.defaultInitialReading);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>('');
  
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

  const handleSubmit = () => {
    const validation = validateInitialReading(initialReading);
    
    if (!validation.isValid) {
      setError(validation.message || t('monthSelector.validationGeneral'));
      return;
    }
    
    setError('');
    onMonthChange(selectedMonth, selectedYear, initialReading);
    setIsOpen(false);
  };

  const handleInitialReadingChange = (value: string) => {
    const numValue = parseFloat(value);
    setInitialReading(numValue);
    
    if (error) {
      setError('');
    }
  };

  const handleMonthChange = (month: string, year: number) => {
    // Si ya existen datos para este mes, cambiar directamente sin mostrar modal
    if (hasMonthData(month, year)) {
      onSwitchToMonth(month, year);
      return;
    }
    
    // Si no existen datos, mostrar modal para ingresar lectura inicial
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        📅 {t('monthSelector.title')}
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        {t('monthSelector.description')}
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MONTH_KEYS.map((month) => (
          <button
            key={month}
            onClick={() => handleMonthChange(month, currentYear)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              month === currentMonth
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(`months.${month}`).charAt(0).toUpperCase() + t(`months.${month}`).slice(1)}
          </button>
        ))}
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            📆 {t('monthSelector.yearLabel')}
          </label>
          <select
            value={currentYear}
            onChange={(e) => handleMonthChange(currentMonth, Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year} {year === currentYearNow ? t('monthSelector.currentLabel') : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-500">
          {t('monthSelector.currentPeriod')} <span className="font-semibold text-blue-600">{t(`months.${currentMonth}`)} {currentYear}</span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-full mt-0.5">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">{t('monthSelector.howItWorks')}</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('monthSelector.monthWithData')}</li>
              <li>• {t('monthSelector.newMonth')}</li>
              <li>• {t('monthSelector.yearChange')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t('monthSelector.newPeriodTitle')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(`months.${selectedMonth}`)} {selectedYear}
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>📋 {t('periodNavigator.important')}:</strong> {t('monthSelector.importantNote')}
              </p>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-6m0 0V7m0 6h6m-6 0H6" />
                    </svg>
                    {t('monthSelector.monthLabel')}
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {MONTH_KEYS.map(month => (
                      <option key={month} value={month}>
                        {t(`months.${month}`).charAt(0).toUpperCase() + t(`months.${month}`).slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-6m0 0V7m0 6h6m-6 0H6" />
                    </svg>
                    {t('monthSelector.yearLabel')}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value) || APP_CONFIG.defaultYear)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year} {year === currentYearNow ? t('monthSelector.currentLabel') : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
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
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError('');
                }}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('monthSelector.cancel')}
              </button>
              <button
                onClick={handleSubmit}
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
                {t('monthSelector.startPeriod')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}