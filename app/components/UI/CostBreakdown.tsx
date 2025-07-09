'use client';

import { TariffConfig, TariffFlagType, Tariff } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import { TARIFF_FLAGS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

interface CostBreakdownProps {
  consumption: number;
  tariff: TariffConfig;
  flagType?: TariffFlagType;
  selectedTariff?: Tariff | null; // Información de la tarifa específica seleccionada para el mes
}

export default function CostBreakdown({ consumption, tariff, flagType = 'GREEN', selectedTariff }: CostBreakdownProps) {
  const { t } = useLanguage();
  if (consumption === 0) {
    return null;
  }

  // Obtener la tarifa base correcta
  const baseTariff = selectedTariff?.base_price_per_kwh || tariff.baseConsumption || tariff.pricePerKwh;
  
  // Calcular cada componente del costo
  const baseCost = consumption * baseTariff;
  const flagSurcharge = consumption * TARIFF_FLAGS[flagType].surcharge;
  const publicLightingCost = selectedTariff?.public_lighting_fee || selectedTariff?.additional_fees || tariff.publicLightingFee || tariff.additionalFees || 0;
  
  // Calcular el costo total sin aplicar impuestos automáticamente
  const totalCost = baseCost + flagSurcharge + publicLightingCost;

  const costItems = [
    {
      label: t('baseConsumption'),
      description: `${formatNumber(consumption)} kWh × ${formatCurrency(baseTariff)}`,
      value: baseCost,
      percentage: (baseCost / totalCost) * 100,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: `${t('tariffFlag')} ${t(`tariffManager.${flagType.toLowerCase().replace('_level_', '')}`)}`,
      description: flagType === 'GREEN' 
        ? `${formatCurrency(0)}/kWh (sin recargo)`
        : `${formatNumber(consumption)} kWh × ${formatCurrency(TARIFF_FLAGS[flagType].surcharge)}`,
      value: flagSurcharge,
      percentage: flagSurcharge > 0 ? (flagSurcharge / totalCost) * 100 : 0,
      color: flagType === 'GREEN' ? 'bg-emerald-50 text-emerald-700' : 
             flagType === 'YELLOW' ? 'bg-amber-50 text-amber-700' : 
             'bg-red-50 text-red-700',
      showZero: flagType === 'GREEN'
    },
    {
      label: t('publicLightingContribution'),
      description: t('monthlyFixedTariff'),
      value: publicLightingCost,
      percentage: (publicLightingCost / totalCost) * 100,
      color: 'bg-green-50 text-green-700'
    }
  ].filter(item => item.value > 0 || item.showZero);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-3">
          💰 {t('costBreakdown')}
          {selectedTariff && (
            <span className="ml-3 text-lg font-medium text-blue-600">
              - {selectedTariff.company_name}
            </span>
          )}
        </h2>
        {selectedTariff && (
          <p className="text-base text-gray-600">
            {t('appliedTariff')}: <span className="font-semibold text-gray-800">{selectedTariff.company_name}</span>
            {selectedTariff.city && selectedTariff.state && (
              <span className="text-gray-500"> • {selectedTariff.city}, {selectedTariff.state}</span>
            )}
          </p>
        )}
      </div>

      {/* Información de la tarifa seleccionada */}
      {selectedTariff && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900 flex items-center text-lg">
                ⚡ {t('activeTariff')}
              </h3>
              <p className="text-blue-700 mt-2">
                <span className="font-semibold">{selectedTariff.company_name}</span>
                {selectedTariff.city && selectedTariff.state && (
                  <span className="text-blue-600"> • {selectedTariff.city}, {selectedTariff.state}</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 uppercase tracking-wide font-semibold mb-1">Tarifa Base</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(baseTariff)}/kWh
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {costItems.map((item, index) => (
          <div key={index} className={`p-5 rounded-xl ${item.color} border border-opacity-20 shadow-sm hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-base">{item.label}</h3>
                <p className="text-sm opacity-80 mt-1">{item.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">{formatCurrency(item.value)}</p>
                <p className="text-sm opacity-75 font-medium">{formatNumber(item.percentage, 1)}%</p>
              </div>
            </div>
            
            {/* Barra de progreso mejorada */}
            <div className="w-full bg-white bg-opacity-60 rounded-full h-3 mt-3">
              <div 
                className="bg-current h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(item.percentage, 100)}%`, opacity: 0.8 }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h3 className="font-bold text-xl text-gray-900">{t('totalToPay')}</h3>
            <p className="text-base text-gray-600 mt-1">{formatNumber(consumption)} kWh {t('consumed')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-3xl text-gray-900">{formatCurrency(totalCost)}</p>
            <p className="text-base text-gray-600 font-medium mt-1">
              {formatCurrency(totalCost / consumption)} por kWh
            </p>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800 leading-relaxed">
          💡 <strong>{t('note')}:</strong> {t('costBreakdownNote')}{' '}
          {selectedTariff ? (
            <span className="font-semibold">
              {selectedTariff.company_name}
              {selectedTariff.city && selectedTariff.state && (
                <span> ({selectedTariff.city}, {selectedTariff.state})</span>
              )}
            </span>
          ) : (
            t('selectedDistributionCompany')
          )}{' '}
          {t('costVariationNote')}
        </p>
      </div>
    </div>
  );
}