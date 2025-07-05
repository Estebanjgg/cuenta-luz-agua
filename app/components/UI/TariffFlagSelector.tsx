'use client';

import React from 'react';
import { TARIFF_FLAGS } from '../../constants';
import { TariffFlagType } from '../../types';

interface TariffFlagSelectorProps {
  selectedFlag: TariffFlagType;
  onFlagChange: (flag: TariffFlagType) => void;
  className?: string;
}

export default function TariffFlagSelector({ 
  selectedFlag, 
  onFlagChange, 
  className = '' 
}: TariffFlagSelectorProps) {
  const flagOptions = Object.entries(TARIFF_FLAGS) as [TariffFlagType, typeof TARIFF_FLAGS[TariffFlagType]][];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bandera Tarifaria Actual
      </h3>
      
      <div className="space-y-3">
        {flagOptions.map(([flagKey, flagData]) => {
          const isSelected = selectedFlag === flagKey;
          const surchargeText = flagData.surcharge === 0 
            ? 'Sin recargo' 
            : `+R$ ${flagData.surcharge.toFixed(5)}/kWh`;
          
          return (
            <div
              key={flagKey}
              className={`
                relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                }
              `}
              onClick={() => onFlagChange(flagKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Indicador de color */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: flagData.color }}
                  />
                  
                  {/* Información de la bandera */}
                  <div>
                    <h4 className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-800'
                    }`}>
                      Bandera {flagData.name}
                    </h4>
                    <p className={`text-sm ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {flagData.description}
                    </p>
                  </div>
                </div>
                
                {/* Costo adicional */}
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    {surchargeText}
                  </span>
                </div>
              </div>
              
              {/* Radio button indicator */}
              <div className={`
                absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300 bg-white'
                }
              `}>
                {isSelected && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Información adicional */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Información:</strong> Las banderas tarifarias son definidas mensualmente 
          por ANEEL según las condiciones de generación de energía en Brasil. 
          Los recargos se aplican sobre cada kWh consumido.
        </p>
      </div>
    </div>
  );
}