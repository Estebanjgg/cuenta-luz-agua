'use client';

import { TariffConfig } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/calculations';

interface CostBreakdownProps {
  consumption: number;
  tariff: TariffConfig;
}

export default function CostBreakdown({ consumption, tariff }: CostBreakdownProps) {
  if (consumption === 0) {
    return null;
  }

  // Calcular cada componente del costo
  const baseCost = consumption * tariff.pricePerKwh;
  const redBandCost = consumption * (tariff.redBandAddition || 0);
  const transmissionCost = consumption * (tariff.transmission || 0);
  const sectorChargesCost = consumption * (tariff.sectorCharges || 0);
  const taxesCost = consumption * (tariff.taxes || 0);
  const publicLightingCost = tariff.publicLightingFee || tariff.additionalFees || 0;
  
  const totalCost = tariff.calculateCost 
    ? tariff.calculateCost(consumption)
    : baseCost + redBandCost + transmissionCost + sectorChargesCost + taxesCost + publicLightingCost;

  const costItems = [
    {
      label: 'Consumo Base',
      description: `${formatNumber(consumption)} kWh × ${formatCurrency(tariff.baseConsumption || 0)}`,
      value: baseCost,
      percentage: (baseCost / totalCost) * 100,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Adicional Banda Roja',
      description: `${formatNumber(consumption)} kWh × ${formatCurrency(tariff.redBandAddition || 0)}`,
      value: redBandCost,
      percentage: (redBandCost / totalCost) * 100,
      color: 'bg-red-50 text-red-700'
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
    }
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          💰 Desglose de Costos
        </h2>
        <div className="text-sm text-gray-600">
          Basado en factura Energisa
        </div>
      </div>

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
          💡 <strong>Nota:</strong> Este desglose está basado en la estructura tarifaria de Energisa Sul-Sudeste 
          y puede variar según la región, tipo de conexión y período de facturación.
        </p>
      </div>
    </div>
  );
}