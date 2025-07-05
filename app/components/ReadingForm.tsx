'use client';

import { useState, useEffect } from 'react';
import { ValidationResult } from '../types';
import { formatDate } from '../utils/calculations';

interface ReadingFormProps {
  onAddReading: (date: string, value: number) => ValidationResult;
  currentReading: number;
}

export default function ReadingForm({ onAddReading, currentReading }: ReadingFormProps) {
  const [date, setDate] = useState('');
  const [reading, setReading] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Establecer fecha actual solo en el cliente para evitar errores de hidratación
  useEffect(() => {
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

    const result = onAddReading(date, readingValue);
    
    if (result.isValid) {
      setReading('');
      setDate(new Date().toISOString().split('T')[0]);
    } else {
      setError(result.message || 'Error al agregar la lectura');
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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        ⚡ Agregar Nueva Lectura
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de la lectura:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lectura del medidor (kWh):
            </label>
            <input
              type="number"
              value={reading}
              onChange={(e) => handleReadingChange(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={`Debe ser mayor a ${currentReading.toLocaleString()}`}
              step="0.1"
              required
            />
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-sm">
            💡 <strong>Tip:</strong> La lectura actual del medidor es {currentReading.toLocaleString()} kWh
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !reading || !date}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isSubmitting || !reading || !date
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Agregando...' : 'Agregar Lectura'}
        </button>
      </form>
    </div>
  );
}