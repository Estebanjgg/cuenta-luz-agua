'use client';

import { useState, useEffect } from 'react';
import { ValidationResult } from '../../types';
import { formatNumber } from '../../utils/calculations';
import { useLanguage } from '../../contexts/LanguageContext';

interface ReadingFormProps {
  onAddReading: (date: string, value: number) => Promise<ValidationResult> | ValidationResult;
  currentReading: number;
}

export default function ReadingForm({ onAddReading, currentReading }: ReadingFormProps) {
  const { t } = useLanguage();
  const [date, setDate] = useState('');
  const [reading, setReading] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Establecer fecha actual solo en el cliente para evitar errores de hidratación
  useEffect(() => {
    setIsClient(true);
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const readingValue = parseFloat(reading);
    
    if (isNaN(readingValue)) {
      setError('Por favor ingresa un valor numérico válido');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await onAddReading(date, readingValue);
      
      if (result.isValid) {
        setReading('');
        setDate(new Date().toISOString().split('T')[0]);
      } else {
        setError(result.message || 'Error al agregar la lectura');
      }
    } catch (error) {
      setError('Error al agregar la lectura');
    }
    
    setIsSubmitting(false);
  };

  const handleReadingChange = (value: string) => {
    setReading(value);
    if (error) {
      setError('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-30 -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200 to-transparent rounded-full opacity-30 translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg mr-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {t('addNewReading')}
            </h2>
            <p className="text-gray-600 text-sm">
              {t('registerElectricConsumption')}
            </p>
          </div>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-6m0 0V7m0 6h6m-6 0H6" />
                </svg>
                {t('readingDate')}:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('meterReading')}:
              </label>
              <input
                type="number"
                value={reading}
                onChange={(e) => handleReadingChange(e.target.value)}
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                  error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder={`${t('mustBeGreaterThan')} ${currentReading.toLocaleString()}`}
                step="0.1"
                required
              />
            </div>
          </div>
        
        {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-800 font-semibold text-sm mb-1">{t('importantInfo')}</p>
                <p className="text-blue-700 text-sm">
                  {t('currentMeterReading')} <span className="font-bold">{currentReading.toLocaleString()} kWh</span>
                </p>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !reading || !date}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${
              isSubmitting || !reading || !date
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-200 hover:shadow-xl'
            }`}
          >
            <div className="flex items-center justify-center">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('addingReading')}...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('addReading')}
                </>
              )}
            </div>
          </button>
      </form>
      </div>
    </div>
  );
}