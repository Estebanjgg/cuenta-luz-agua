'use client';

import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useSupabaseEnergyData } from './hooks/useSupabaseEnergyData';
import { 
  AuthComponent,
  ReadingForm,
  ReadingsList,
  ConsumptionStats,
  CostBreakdown,
  MonthSelector,
  ConsumptionChart,
  Navbar,
  TariffFlagSelector
} from './components';
import SessionStatus from './components/UI/SessionStatus';
import TariffConfig from './components/UI/TariffConfig';
import { APP_CONFIG } from './constants';
import { TariffConfig as TariffConfigType, ExtendedTariffConfig } from './types';

// Función para determinar el origen de la tarifa
const getTariffSourceDescription = (tariff: any): string => {
  // Verificar si es una tarifa con método calculateCost específico (como Energisa)
  if (tariff?.calculateCost && typeof tariff.calculateCost === 'function') {
    // Detectar Energisa por su precio específico
    if (Math.abs(tariff.pricePerKwh - 0.795530) < 0.001) {
      return 'Tarifa Energisa Sul-Sudeste (Bragança Paulista, SP)';
    }
    return `Tarifa personalizada (R$ ${tariff.pricePerKwh?.toFixed(3)}/kWh)`;
  }
  
  // Verificar si tiene información de compañía desde source
  if (tariff?.source?.company_name) {
    const location = tariff.source.city && tariff.source.state ? ` (${tariff.source.city}, ${tariff.source.state})` : '';
    return `Tarifa ${tariff.source.company_name}${location}`;
  }
  
  // Verificar si tiene información de compañía directa
  if (tariff?.company_name) {
    const location = tariff.city && tariff.state ? ` (${tariff.city}, ${tariff.state})` : '';
    return `Tarifa ${tariff.company_name}${location}`;
  }
  
  // Verificar por tipo de fuente desde source
  if (tariff?.source?.type) {
    switch (tariff.source.type) {
      case 'invoice':
        return 'Tarifa basada en factura';
      case 'aneel':
        const company = tariff.source.company_name || 'ANEEL';
        const state = tariff.source.state ? ` (${tariff.source.state})` : '';
        return `Tarifa ${company}${state}`;
      case 'saved':
        return 'Tarifa guardada';
      case 'manual':
        const manualCompany = tariff.source.company_name || 'Compañía personalizada';
        const manualLocation = tariff.source.city && tariff.source.state ? ` (${tariff.source.city}, ${tariff.source.state})` : '';
        return `Tarifa ${manualCompany}${manualLocation}`;
    }
  }
  
  // Verificar por tipo de fuente directo
  if (tariff?.source_type) {
    switch (tariff.source_type) {
      case 'invoice':
        return 'Tarifa basada en factura';
      case 'aneel':
        return 'Tarifa ANEEL';
      case 'saved':
        return 'Tarifa guardada';
      case 'manual':
        return 'Tarifa configurada manualmente';
    }
  }
  
  // Fallback
  return `Tarifa configurada manualmente (R$ ${tariff?.pricePerKwh?.toFixed(3) || '0.000'}/kWh)`;
};

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    currentMonth,
    isLoading,
    addReading,
    deleteReading,
    changeMonth,
    switchToMonth,
    hasMonthData,
    resetMonth,
    getCurrentReading,
    getConsumptionStats,
    tariff,
    changeTariffFlag,
    saveTariffConfig,
    userTariff,
    updateTariff
  } = useSupabaseEnergyData();
  
  const [showTariffConfig, setShowTariffConfig] = useState(false);

  // Si no hay usuario autenticado, mostrar componente de autenticación
  if (!user && !authLoading) {
    return <AuthComponent />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const stats = getConsumptionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <Navbar 
        onLogout={signOut} 
        onOpenTariffConfig={() => setShowTariffConfig(true)}
      />
      
      <div className="max-w-6xl mx-auto p-4">

        {/* Selector de Mes */}
        <MonthSelector 
          currentMonth={currentMonth.month}
          currentYear={currentMonth.year}
          onMonthChange={changeMonth}
          onSwitchToMonth={switchToMonth}
          hasMonthData={hasMonthData}
        />

        {/* Selector de Bandera Tarifaria */}
        <TariffFlagSelector 
          selectedFlag={currentMonth.tariffFlag || 'GREEN'}
          onFlagChange={changeTariffFlag}
        />

        {/* Formulario para agregar lectura */}
        <ReadingForm 
          onAddReading={addReading}
          currentReading={getCurrentReading()}
        />

        {/* Lista de lecturas */}
        <ReadingsList 
          readings={currentMonth.readings}
          initialReading={currentMonth.initialReading}
          onDeleteReading={deleteReading}
        />

        {/* Gráfico */}
        <ConsumptionChart 
          readings={currentMonth.readings} 
          initialReading={currentMonth.initialReading}
        />

        {/* Estadísticas de Consumo */}
        <ConsumptionStats 
          stats={stats}
          readings={currentMonth.readings}
          currentMonth={currentMonth.month}
          currentYear={currentMonth.year}
        />

        {/* Desglose detallado de costos */}
        <CostBreakdown 
          consumption={stats.totalConsumption}
          tariff={tariff}
          flagType={currentMonth.tariffFlag}
          tariffSource={getTariffSourceDescription(tariff)}
        />

        {/* Acciones adicionales */}
        {currentMonth.readings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Acciones</h3>
              <button
                onClick={resetMonth}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reiniciar Mes</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>💡 Controla tu consumo eléctrico y ahorra en tu factura</p>
          <p className="mt-1">Desarrollado con Next.js, TypeScript y Tailwind CSS</p>
        </div>
      </div>
      
      {/* Modal de Configuración de Tarifas */}
      <TariffConfig
        isOpen={showTariffConfig}
        onClose={() => setShowTariffConfig(false)}
        currentConfig={userTariff || {
          pricePerKwh: 0.795,
          additionalFees: 41.12,
          publicLightingFee: 0
        }}
        onSave={async (config: ExtendedTariffConfig) => {
          // Convertir ExtendedTariffConfig a TariffConfig
          const tariffConfig: TariffConfigType = {
            pricePerKwh: config.pricePerKwh,
            additionalFees: config.additionalFees,
            publicLightingFee: config.publicLightingFee,
            // Preservar propiedades adicionales si existen
            ...(config.source && { source: config.source }),
            ...(config.calculateCost && { calculateCost: config.calculateCost })
          };
          
          // Usar updateTariff para actualizar inmediatamente el estado
          await updateTariff(tariffConfig);
          setShowTariffConfig(false);
        }}
      />
      
      {/* Componente de estado de sesión (solo en desarrollo) */}
      <SessionStatus compact={true} position="bottom-right" />
    </div>
  );
}
