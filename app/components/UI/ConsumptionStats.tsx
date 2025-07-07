'use client';

import { useState, useEffect } from 'react';
import { Reading, ConsumptionStats as StatsType } from '../../types';
import { formatNumber, formatCurrency, getReadingDateRange } from '../../utils/calculations';

interface ConsumptionStatsProps {
  stats: StatsType;
  readings: Reading[];
  currentMonth: string;
  currentYear: number;
}

export default function ConsumptionStats({ stats, readings, currentMonth, currentYear }: ConsumptionStatsProps) {
  const [currentDay, setCurrentDay] = useState(1);
  const [daysInMonth, setDaysInMonth] = useState(30);
  const [isClient, setIsClient] = useState(false);
  
  const dateRange = getReadingDateRange(readings);
  const progressPercentage = (currentDay / daysInMonth) * 100;

  // Establecer valores de fecha solo en el cliente
  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    setCurrentDay(now.getDate());
    setDaysInMonth(new Date(currentYear, now.getMonth() + 1, 0).getDate());
  }, [currentYear]);

  const statCards = [
    {
      title: 'Consumo Total',
      value: `${formatNumber(stats.totalConsumption)} kWh`,
      icon: '⚡',
      color: 'bg-blue-500',
      description: 'Consumo acumulado del mes'
    },
    {
      title: 'Promedio Diario',
      value: `${formatNumber(stats.averageDailyConsumption, 1)} kWh`,
      icon: '📊',
      color: 'bg-green-500',
      description: 'Consumo promedio por día'
    },
    {
      title: 'Proyección Mensual',
      value: `${formatNumber(stats.monthlyProjection)} kWh`,
      icon: '📈',
      color: 'bg-yellow-500',
      description: 'Estimación para todo el mes'
    },
    {
      title: 'Costo Estimado',
      value: formatCurrency(stats.estimatedCost),
      icon: '💰',
      color: 'bg-purple-500',
      description: 'Costo total estimado'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          📊 Estadísticas de {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
        </h2>
        {dateRange && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Período:</span> {dateRange.start} - {dateRange.end}
          </div>
        )}
      </div>

      {/* Progreso del mes */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del mes</span>
          <span className="text-sm text-gray-600">
            Día {currentDay} de {daysInMonth} ({Math.round(progressPercentage)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      {readings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Resumen de Lecturas</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• Total de lecturas registradas: <span className="font-medium">{readings.length}</span></p>
              <p>• Última lectura: <span className="font-medium">{formatNumber(Math.max(...readings.map(r => r.value)))} kWh</span></p>
              <p>• Frecuencia promedio: <span className="font-medium">{Math.round(currentDay / readings.length)} días</span></p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">🎯 Proyecciones</h4>
            <div className="space-y-1 text-sm text-green-700">
              <p>• Consumo restante estimado: <span className="font-medium">{formatNumber(Math.max(0, stats.monthlyProjection - stats.totalConsumption))} kWh</span></p>
              <p>• Días restantes del mes: <span className="font-medium">{daysInMonth - currentDay}</span></p>
              <p>• Consumo diario sugerido: <span className="font-medium">{formatNumber((stats.monthlyProjection - stats.totalConsumption) / Math.max(1, daysInMonth - currentDay), 1)} kWh</span></p>
            </div>
          </div>
        </div>
      )}

      {readings.length === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay lecturas registradas</h3>
          <p className="text-gray-500">Agrega tu primera lectura para ver las estadísticas de consumo</p>
        </div>
      )}
    </div>
  );
}