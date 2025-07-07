'use client';

import React, { useState } from 'react';
import { TARIFF_FLAGS } from '../../constants';
import { TariffFlagType } from '../../types';

interface TariffFlagSelectorProps {
  selectedFlag: TariffFlagType;
  onFlagChange: (flag: TariffFlagType) => void;
  className?: string;
}

// Información detallada sobre las banderas tarifarias
const getFlagExplanation = (flagType: TariffFlagType): { explanation: string; tips: string[] } => {
  switch (flagType) {
    case 'GREEN':
      return {
        explanation: "Condiciones favorables de generación. Los embalses de las hidroeléctricas están en niveles adecuados y no es necesario activar termoeléctricas más caras.",
        tips: [
          "Aprovecha para usar electrodomésticos de alto consumo",
          "Es un buen momento para cargar dispositivos electrónicos",
          "Puedes usar el aire acondicionado sin preocupaciones adicionales"
        ]
      };
    case 'YELLOW':
      return {
        explanation: "Condiciones menos favorables. Los niveles de los embalses están bajando y algunas termoeléctricas comienzan a operar, aumentando el costo de generación.",
        tips: [
          "Evita usar varios electrodomésticos al mismo tiempo",
          "Prefiere usar la lavadora y lavavajillas en horarios fuera de pico (evita 18h-21h)",
          "Ajusta el aire acondicionado a 23°C o más",
          "Apaga luces innecesarias y usa iluminación LED"
        ]
      };
    case 'RED_LEVEL_1':
      return {
        explanation: "Condiciones más costosas. Los embalses están en niveles bajos y más termoeléctricas están operando, aumentando significativamente los costos.",
        tips: [
          "Reduce el tiempo de ducha y usa la opción 'verano' del calentador",
          "Evita usar electrodomésticos en horario de pico (18h-21h)",
          "Desconecta aparatos en standby de la tomada",
          "Usa ventiladores en lugar de aire acondicionado cuando sea posible",
          "Planifica el uso de lavadora y secadora para días con menor consumo"
        ]
      };
    case 'RED_LEVEL_2':
      return {
        explanation: "Condiciones muy costosas. Los embalses están en niveles críticos y casi todo el parque de termoeléctricas está activado, resultando en los mayores costos de generación.",
        tips: [
          "Reduce drásticamente el uso de electrodomésticos de alto consumo",
          "Toma duchas más cortas y en modo 'verano'",
          "Evita completamente el horario de pico (18h-21h)",
          "Desconecta todos los aparatos que no sean esenciales",
          "Usa iluminación natural siempre que sea posible",
          "Considera postponer actividades que requieran mucha energía",
          "Ajusta la temperatura del refrigerador a niveles menos fríos"
        ]
      };
    default:
      return { explanation: "", tips: [] };
  }
};

export default function TariffFlagSelector({ 
  selectedFlag, 
  onFlagChange, 
  className = '' 
}: TariffFlagSelectorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<TariffFlagType>(selectedFlag);
  
  const flagOptions = Object.entries(TARIFF_FLAGS) as [TariffFlagType, typeof TARIFF_FLAGS[TariffFlagType]][];
  const currentFlagInfo = getFlagExplanation(selectedFlag);
  const detailFlagInfo = getFlagExplanation(selectedForDetails);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bandera Tarifaria Actual
      </h3>
      
      {/* Selector dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar bandera tarifaria:
        </label>
        <div className="relative">
          <select
            value={selectedFlag}
            onChange={(e) => onFlagChange(e.target.value as TariffFlagType)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
          >
            {flagOptions.map(([flagKey, flagData]) => {
              const surchargeText = flagData.surcharge === 0 
                ? 'Sin recargo' 
                : `+R$ ${flagData.surcharge.toFixed(5)}/kWh`;
              
              return (
                <option key={flagKey} value={flagKey}>
                  Bandera {flagData.name} - {surchargeText}
                </option>
              );
            })}
          </select>
          
          {/* Icono de dropdown */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Información visual de la bandera seleccionada */}
       <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
         <div className="flex items-center space-x-3">
           <div 
             className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
             style={{ backgroundColor: TARIFF_FLAGS[selectedFlag].color }}
           />
           <div className="flex-1">
             <h4 className="font-medium text-gray-800">
               Bandera {TARIFF_FLAGS[selectedFlag].name}
             </h4>
             <p className="text-sm text-gray-600">
               {TARIFF_FLAGS[selectedFlag].description}
             </p>
           </div>
           <div className="flex items-center space-x-3">
             {/* Botón de información */}
             <button
               onClick={() => {
                 setSelectedForDetails(selectedFlag);
                 setShowDetails(!showDetails);
               }}
               className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
               title="Ver consejos y detalles"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </button>
             
             {/* Costo adicional */}
             <div className="text-right">
               <span className="text-sm font-medium text-gray-700">
                 {TARIFF_FLAGS[selectedFlag].surcharge === 0 
                   ? 'Sin recargo' 
                   : `+R$ ${TARIFF_FLAGS[selectedFlag].surcharge.toFixed(5)}/kWh`
                 }
               </span>
             </div>
           </div>
         </div>
       </div>
      
      {/* Panel de detalles expandible */}
      {showDetails && (
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: TARIFF_FLAGS[selectedForDetails].color }}
              />
              Bandera {TARIFF_FLAGS[selectedForDetails].name} - ¿Qué significa?
            </h4>
            <p className="text-blue-800 text-sm mb-3">
              {detailFlagInfo.explanation}
            </p>
            
            <h5 className="font-medium text-blue-900 mb-2">💡 Consejos para ahorrar:</h5>
            <ul className="space-y-1">
              {detailFlagInfo.tips.map((tip, index) => (
                <li key={index} className="text-blue-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Información actual de la bandera seleccionada */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start space-x-2">
          <div 
            className="w-4 h-4 rounded-full mt-0.5 border-2 border-white shadow-sm"
            style={{ backgroundColor: TARIFF_FLAGS[selectedFlag].color }}
          />
          <div className="flex-1">
            <p className="text-yellow-800 text-sm font-medium mb-1">
              Bandera {TARIFF_FLAGS[selectedFlag].name} activa
            </p>
            <p className="text-yellow-700 text-sm mb-2">
              {currentFlagInfo.explanation}
            </p>
            {currentFlagInfo.tips.length > 0 && (
              <div>
                <p className="text-yellow-800 text-sm font-medium mb-1">Recomendaciones:</p>
                <div className="text-yellow-700 text-sm">
                  <p className="mb-1">{currentFlagInfo.tips[0]}</p>
                  {currentFlagInfo.tips.length > 1 && (
                    <>
                      {!showDetails ? (
                        <button
                          onClick={() => {
                            setSelectedForDetails(selectedFlag);
                            setShowDetails(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800 underline cursor-pointer font-medium"
                        >
                          (y {currentFlagInfo.tips.length - 1} más...)
                        </button>
                      ) : (
                        <div className="space-y-1">
                          {currentFlagInfo.tips.slice(1).map((tip, index) => (
                            <p key={index + 1} className="flex items-start">
                              <span className="text-yellow-600 mr-2 mt-0.5">•</span>
                              {tip}
                            </p>
                          ))}
                          <button
                            onClick={() => setShowDetails(false)}
                            className="text-yellow-600 hover:text-yellow-800 underline cursor-pointer font-medium mt-2"
                          >
                            (mostrar menos)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Información general del sistema */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-700 text-sm">
          <strong>ℹ️ Sistema de Banderas Tarifarias:</strong> Implementado por ANEEL en 2015, 
          este sistema señaliza mensualmente el costo real de generación de energía. 
          Cuando hay sequía, se activan termoeléctricas más caras, y este costo se transfiere 
          inmediatamente a los consumidores a través de las banderas.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a 
            href="https://www.gov.br/aneel/pt-br/assuntos/tarifas/bandeiras-tarifarias/faq-bandeiras-tarifarias" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs underline"
          >
            📖 Más información en ANEEL
          </a>
          <a 
            href="https://www.portalsolar.com.br/bandeira-de-energia-como-funciona" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs underline"
          >
            🔍 Cómo funciona el sistema
          </a>
        </div>
      </div>
    </div>
  );
}