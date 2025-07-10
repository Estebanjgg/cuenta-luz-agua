'use client';

import { useState, useEffect } from 'react';
import { Reading } from '../../types';
import { formatNumber, formatDate } from '../../utils/calculations';
import { useLanguage } from '../../contexts/LanguageContext';

interface ReadingsListProps {
  readings: Reading[];
  initialReading: number;
  onDeleteReading: (id: string) => Promise<void> | void;
}

export default function ReadingsList({ readings, initialReading, onDeleteReading }: ReadingsListProps) {
  const { t } = useLanguage();
  const [monthStartTime, setMonthStartTime] = useState(0);

  // Establecer el tiempo de inicio del mes solo en el cliente
  useEffect(() => {
    const now = new Date();
    setMonthStartTime(new Date(now.getFullYear(), now.getMonth(), 1).getTime());
  }, []);

  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          📋 {t('readingsHistory')}
        </h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('noReadingsRegistered')}</h3>
          <p className="text-gray-500">{t('readingsWillAppear')}</p>
        </div>
      </div>
    );
  }

  // Ordenar lecturas por fecha (más reciente primero)
  const sortedReadings = [...readings].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getConsumptionSincePrevious = (currentReading: Reading, index: number): number => {
    if (index === sortedReadings.length - 1) {
      // Es la primera lectura (más antigua)
      return currentReading.value - initialReading;
    }
    
    const previousReading = sortedReadings[index + 1];
    return currentReading.value - previousReading.value;
  };

  const getConsumptionColor = (consumption: number): string => {
    if (consumption <= 5) return 'text-green-600 bg-green-50';
    if (consumption <= 10) return 'text-yellow-600 bg-yellow-50';
    if (consumption <= 20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          📋 {t('readingsHistory')}
        </h2>
        <div className="text-sm text-gray-600">
          {readings.length} {readings.length === 1 ? t('readingsRegistered') : t('readingsRegisteredPlural')}
        </div>
      </div>

      <div className="space-y-3">
        {sortedReadings.map((reading, index) => {
          const consumptionSincePrevious = getConsumptionSincePrevious(reading, index);
          const totalConsumption = reading.value - initialReading;
          const consumptionColorClass = getConsumptionColor(consumptionSincePrevious);
          
          return (
            <div key={reading.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatDate(reading.date)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('readingNumber')}{readings.length - index}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <p className="font-bold text-lg text-gray-800">
                          {formatNumber(reading.value)} kWh
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('meterReadingLabel')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div className={`px-3 py-2 rounded-lg ${consumptionColorClass}`}>
                      <p className="text-xs font-medium opacity-75">{t('consumptionSincePrevious')}</p>
                      <p className="font-bold">{formatNumber(consumptionSincePrevious)} kWh</p>
                    </div>
                    
                    <div className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600">
                      <p className="text-xs font-medium opacity-75">{t('totalMonthConsumption')}</p>
                      <p className="font-bold">{formatNumber(totalConsumption)} kWh</p>
                    </div>
                    
                    <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-600">
                      <p className="text-xs font-medium opacity-75">{t('daysSinceStart')}</p>
                      <p className="font-bold">
                        {monthStartTime > 0 ? Math.ceil((new Date(reading.date).getTime() - monthStartTime) / (1000 * 60 * 60 * 24)) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={async () => {
                    try {
                      await onDeleteReading(reading.id);
                    } catch (error) {
                      console.error('Error al eliminar lectura:', error);
                    }
                  }}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('deleteReading')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen al final */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-600 font-medium">{t('firstReading')}</p>
            <p className="text-lg font-bold text-blue-800">
              {formatNumber(Math.min(...readings.map(r => r.value)))} kWh
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-600 font-medium">{t('lastReading')}</p>
            <p className="text-lg font-bold text-green-800">
              {formatNumber(Math.max(...readings.map(r => r.value)))} kWh
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm text-purple-600 font-medium">{t('totalConsumption')}</p>
            <p className="text-lg font-bold text-purple-800">
              {formatNumber(Math.max(...readings.map(r => r.value)) - initialReading)} kWh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}