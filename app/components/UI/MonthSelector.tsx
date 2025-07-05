'use client';

import { useState } from 'react';
import { MONTHS, APP_CONFIG } from '../../constants';
import { ValidationResult } from '../../types';

interface MonthSelectorProps {
  currentMonth: string;
  currentYear: number;
  onMonthChange: (month: string, year: number, initialReading: number) => void;
  onSwitchToMonth: (month: string, year: number) => void;
  hasMonthData: (month: string, year: number) => boolean;
}

export default function MonthSelector({ currentMonth, currentYear, onMonthChange, onSwitchToMonth, hasMonthData }: MonthSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [initialReading, setInitialReading] = useState(APP_CONFIG.defaultInitialReading);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const validateInitialReading = (value: number): ValidationResult => {
    if (isNaN(value) || value <= 0) {
      return {
        isValid: false,
        message: 'La lectura inicial debe ser un número válido mayor a 0'
      };
    }
    if (value > 999999) {
      return {
        isValid: false,
        message: 'La lectura inicial parece demasiado alta'
      };
    }
    return { isValid: true };
  };

  const handleSubmit = () => {
    const validation = validateInitialReading(initialReading);
    
    if (!validation.isValid) {
      setError(validation.message || 'Error de validación');
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
        📅 Seleccionar Mes
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MONTHS.map((month) => (
          <button
            key={month}
            onClick={() => handleMonthChange(month, currentYear)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              month === currentMonth
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {month.charAt(0).toUpperCase() + month.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="mt-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Año:
        </label>
        <select
          value={currentYear}
          onChange={(e) => handleMonthChange(currentMonth, Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Al cambiar de mes, se te pedirá ingresar la lectura inicial del medidor para ese período.
        </p>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Cambiar a {selectedMonth} {selectedYear}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes:
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {MONTHS.map(month => (
                    <option key={month} value={month}>
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año:
                </label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value) || APP_CONFIG.defaultYear)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="2020"
                  max="2030"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lectura inicial del medidor:
                </label>
                <input
                  type="number"
                  value={initialReading && initialReading !== 65788 ? initialReading : ''}
                  onChange={(e) => handleInitialReadingChange(e.target.value)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 65788"
                  step="1"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError('');
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!!error || !initialReading || initialReading === 0}
                className={`px-4 py-2 rounded-md transition-colors ${
                  error || !initialReading || initialReading === 0
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Cambiar Mes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}