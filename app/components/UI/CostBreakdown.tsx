'use client';

import { TariffConfig, TariffFlagType, Tariff } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import { TARIFF_FLAGS } from '../../constants';

interface CostBreakdownProps {
  consumption: number;
  tariff: TariffConfig;
  flagType?: TariffFlagType;
  selectedTariff?: Tariff | null; // Información de la tarifa específica seleccionada para el mes
}

export default function CostBreakdown({ consumption, tariff, flagType = 'GREEN', selectedTariff }: CostBreakdownProps) {
  if (consumption === 0) {
    return null;
  }

  // Calcular cada componente del costo
  const baseCost = consumption * (tariff.baseConsumption || tariff.pricePerKwh);
  const transmissionCost = consumption * (tariff.transmission || 0);
  const sectorChargesCost = consumption * (tariff.sectorCharges || 0);
  const taxesCost = consumption * (tariff.taxes || 0);
  const publicLightingCost = tariff.publicLightingFee || tariff.additionalFees || 0;
  
  const flagSurcharge = consumption * TARIFF_FLAGS[flagType].surcharge;
  
  const totalCost = tariff.calculateCost 
    ? tariff.calculateCost(consumption, flagType)
    : baseCost + transmissionCost + sectorChargesCost + taxesCost + publicLightingCost + flagSurcharge;

  const costItems = [
    {
      label: 'Consumo Base',
      description: `${formatNumber(consumption)} kWh × ${formatCurrency(tariff.baseConsumption || tariff.pricePerKwh)}`,
      value: baseCost,
      percentage: (baseCost / totalCost) * 100,
      color: 'bg-blue-50 text-blue-700'
    },

    {
      label: 'Servicio de Transmisión',
      description: `${formatNumber(consumption)} kWh × ${formatCurrency(tariff.transmission || 0)}`,
      value: transmissionCost,
      percentage: (transmissionCost / totalCost) * 100,
      color: 'bg-yellow-50 text-yellow-700'
    },
    {
      label: 'Encargos Sectoriales',
      description: `${formatNumber(consumption)} kWh × ${formatCurrency(tariff.sectorCharges || 0)}`,
      value: sectorChargesCost,
      percentage: (sectorChargesCost / totalCost) * 100,
      color: 'bg-purple-50 text-purple-700'
    },
    {
      label: 'Impuestos y Encargos',
      description: `${formatNumber(consumption)} kWh × ${formatCurrency(tariff.taxes || 0)}`,
      value: taxesCost,
      percentage: (taxesCost / totalCost) * 100,
      color: 'bg-orange-50 text-orange-700'
    },
    {
      label: 'Contribución Iluminación Pública',
      description: 'Tarifa fija mensual',
      value: publicLightingCost,
      percentage: (publicLightingCost / totalCost) * 100,
      color: 'bg-green-50 text-green-700'
    },
    {
      label: `Bandera Tarifaria (${TARIFF_FLAGS[flagType].name})`,
      description: `${formatNumber(consumption)} kWh × ${formatCurrency(TARIFF_FLAGS[flagType].surcharge)}`,
      value: flagSurcharge,
      percentage: (flagSurcharge / totalCost) * 100,
      color: flagType === 'GREEN' ? 'bg-emerald-50 text-emerald-700' : 
             flagType === 'YELLOW' ? 'bg-amber-50 text-amber-700' : 
             'bg-red-50 text-red-700'
    }
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-2">
          💰 Desglose de Costos
          {selectedTariff && (
            <span className="ml-2 text-base font-medium text-blue-600">
              - {selectedTariff.company_name}
            </span>
          )}
        </h2>
        {selectedTariff && (
          <p className="text-sm text-gray-600">
            Tarifa aplicada: <span className="font-medium text-gray-800">{selectedTariff.company_name}</span>
            {selectedTariff.city && selectedTariff.state && (
              <span> • {selectedTariff.city}, {selectedTariff.state}</span>
            )}
          </p>
        )}
      </div>

      {/* Información de la tarifa seleccionada */}
      {selectedTariff && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 flex items-center">
                ⚡ Tarifa Activa
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                <span className="font-medium">{selectedTariff.company_name}</span>
                {selectedTariff.city && selectedTariff.state && (
                  <span className="text-blue-600"> • {selectedTariff.city}, {selectedTariff.state}</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Bandera {TARIFF_FLAGS[flagType].name}</p>
              <p className="text-lg font-bold text-blue-800">
                {formatCurrency(
                  flagType === 'GREEN' ? selectedTariff.price_per_kwh_green :
                  flagType === 'YELLOW' ? selectedTariff.price_per_kwh_yellow :
                  flagType === 'RED_LEVEL_1' ? selectedTariff.price_per_kwh_red_1 :
                  selectedTariff.price_per_kwh_red_2
                )}/kWh
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {costItems.map((item, index) => (
          <div key={index} className={`p-4 rounded-lg ${item.color}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{item.label}</h3>
                <p className="text-xs opacity-75">{item.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(item.value)}</p>
                <p className="text-xs opacity-75">{formatNumber(item.percentage, 1)}%</p>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-2">
              <div 
                className="bg-current h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(item.percentage, 100)}%`, opacity: 0.7 }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Total a Pagar</h3>
            <p className="text-sm text-gray-600">{formatNumber(consumption)} kWh consumidos</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl text-gray-800">{formatCurrency(totalCost)}</p>
            <p className="text-sm text-gray-600">
              {formatCurrency(totalCost / consumption)} por kWh
            </p>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Nota:</strong> Este desglose está basado en la estructura tarifaria de{' '}
          {selectedTariff ? (
            <span className="font-medium">
              {selectedTariff.company_name}
              {selectedTariff.city && selectedTariff.state && (
                <span> ({selectedTariff.city}, {selectedTariff.state})</span>
              )}
            </span>
          ) : (
            'la empresa distribuidora seleccionada'
          )}{' '}
          y puede variar según la región, tipo de conexión y período de facturación.
        </p>
      </div>
    </div>
  );
}