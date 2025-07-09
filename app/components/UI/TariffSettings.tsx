'use client';

import { useState, useEffect } from 'react';
import { SAO_PAULO_TARIFF } from '../../constants';

interface TariffSettingsProps {
  currentTariff: number;
  onTariffChange: (newTariff: number) => void;
}

const PRESET_TARIFFS = [
  { name: 'São Paulo (Enel)', rate: 0.72518, description: 'Tarifa padrão São Paulo' },
  { name: 'Rio de Janeiro (Light)', rate: 0.68234, description: 'Tarifa estimada RJ' },
  { name: 'Minas Gerais (Cemig)', rate: 0.71456, description: 'Tarifa estimada MG' },
  { name: 'Bahia (Coelba)', rate: 0.69876, description: 'Tarifa estimada BA' },
  { name: 'Paraná (Copel)', rate: 0.67123, description: 'Tarifa estimada PR' },
  { name: 'Rio Grande do Sul (RGE)', rate: 0.73245, description: 'Tarifa estimada RS' }
];

export default function TariffSettings({ currentTariff, onTariffChange }: TariffSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customTariff, setCustomTariff] = useState(currentTariff.toString());
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  useEffect(() => {
    setCustomTariff(currentTariff.toString());
  }, [currentTariff]);

  const handlePresetSelect = (rate: number, name: string) => {
    setCustomTariff(rate.toString());
    setSelectedPreset(name);
    onTariffChange(rate);
  };

  const handleCustomTariffChange = (value: string) => {
    setCustomTariff(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onTariffChange(numValue);
      setSelectedPreset(''); // Clear preset selection when using custom
    }
  };

  const resetToDefault = () => {
    const defaultRate = SAO_PAULO_TARIFF.baseRate;
    setCustomTariff(defaultRate.toString());
    setSelectedPreset('São Paulo (Enel)');
    onTariffChange(defaultRate);
  };

  return (
    <div className="relative">
      {/* Botão para abrir configurações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="Configurar tarifa personalizada"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>R$ {currentTariff.toFixed(5)}/kWh</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel de configuración */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">⚡ Configurar Tarifa</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tarifa personalizada */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarifa Personalizada (R$/kWh)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.00001"
                  value={customTariff}
                  onChange={(e) => handleCustomTariffChange(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.72518"
                />
                <span className="text-gray-500">/kWh</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Digite a tarifa da sua distribuidora de energia
              </p>
            </div>

            {/* Tarifas pré-definidas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou escolha uma tarifa pré-definida:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {PRESET_TARIFFS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset.rate, preset.name)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPreset === preset.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{preset.name}</p>
                        <p className="text-xs text-gray-500">{preset.description}</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        R$ {preset.rate.toFixed(5)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <button
                onClick={resetToDefault}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Restaurar padrão
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Aplicar
              </button>
            </div>

            {/* Informação adicional */}
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>💡 Dica:</strong> Você pode encontrar sua tarifa na conta de luz, 
                geralmente expressa como "Tarifa de Energia" ou "TE" + "TUSD".
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}