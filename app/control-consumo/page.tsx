'use client';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSupabaseEnergyData } from '../hooks/useSupabaseEnergyData';
import { 
  AuthComponent,
  ReadingForm,
  ReadingsList,
  ConsumptionStats,
  CostBreakdown,
  PeriodNavigator,
  ConsumptionChart,
  Navbar,
  TariffFlagSelector,
  InitialMonthModal
} from '../components';
import SessionStatus from '../components/UI/SessionStatus';
import { useTariffs } from '../hooks/useTariffs';
import { useState, useEffect } from 'react';
import { Tariff } from '../types';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();
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
    changeTariffFlag
  } = useSupabaseEnergyData();
  
  // Hook para obtener tarifas
  const { getMonthTariff, assignTariffToMonth } = useTariffs();

  // Estados para los modales de tarifas (ya no se necesita showTariffManager)
  
  // Estado para la tarifa específica del mes
  const [selectedMonthTariff, setSelectedMonthTariff] = useState<Tariff | null>(null);
  
  // Estado para el modal inicial
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [hasCheckedInitialData, setHasCheckedInitialData] = useState(false);

  // Cargar la tarifa específica del mes actual
  useEffect(() => {
    const loadMonthTariff = async () => {
      if (user && currentMonth) {
        const monthTariff = await getMonthTariff(currentMonth.month, currentMonth.year);
        setSelectedMonthTariff(monthTariff);
      }
    };
    
    loadMonthTariff();
  }, [user, currentMonth.month, currentMonth.year]);

  // Mostrar modal inicial cuando el usuario entre y no tenga datos
  useEffect(() => {
    if (user && !isLoading && !hasCheckedInitialData) {
      // Verificar si el usuario tiene algún dato guardado en el mes actual
      const hasCurrentMonthData = currentMonth && 
                                 (currentMonth.readings.length > 0 || 
                                  (currentMonth.initialReading > 0 && currentMonth.initialReading !== 65788));
      
      // Si no tiene datos en el mes actual, mostrar el modal
      if (!hasCurrentMonthData) {
        setShowInitialModal(true);
      }
      
      // Marcar que ya se verificó
      setHasCheckedInitialData(true);
    }
  }, [user, isLoading, currentMonth, hasCheckedInitialData]);

  // Resetear el flag cuando el componente se desmonte, el usuario cambie o se navegue a la página
  useEffect(() => {
    // Resetear el flag cada vez que se monta el componente
    setHasCheckedInitialData(false);
    
    return () => {
      setHasCheckedInitialData(false);
    };
  }, [user]);

  // Funciones para manejar el modal inicial
  const handleInitialMonthSelect = async (month: string, year: number, initialReading?: number, readingDay?: number) => {
    try {
      await changeMonth(month, year, initialReading || 0, readingDay);
      setShowInitialModal(false);
      
      // Mostrar mensaje de éxito
      console.log(`✅ Período ${month} ${year} creado exitosamente`);
    } catch (error) {
      console.error('Error al crear el período:', error);
    }
  };

  const handleInitialSwitchToMonth = (month: string, year: number) => {
    try {
      switchToMonth(month, year);
      setShowInitialModal(false);
      
      // Mostrar mensaje de éxito
      console.log(`✅ Mes ${month} ${year} cargado exitosamente`);
    } catch (error) {
      console.error('Error al cargar el mes:', error);
    }
  };

  // Si no hay usuario autenticado, mostrar componente de autenticación
  if (!user && !authLoading) {
    return <AuthComponent />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
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
      />
      
      <div className="max-w-6xl mx-auto p-4">

        {/* Navegador de Período */}
          <PeriodNavigator 
            currentMonth={currentMonth.month}
            currentYear={currentMonth.year}
            onMonthChange={changeMonth}
            onSwitchToMonth={switchToMonth}
            hasMonthData={hasMonthData}
            selectedMonthTariff={selectedMonthTariff}
            onTariffSelect={async (tariff) => {
              const success = await assignTariffToMonth(currentMonth.month, currentMonth.year, tariff.id);
              if (success) {
                setSelectedMonthTariff(tariff);
              }
            }}
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
          currentMonth={currentMonth}
          onUpdateReadingDay={(newReadingDay) => {
            changeMonth(currentMonth.month, currentMonth.year, currentMonth.initialReading, newReadingDay);
          }}
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
          flagType={currentMonth.tariffFlag || 'GREEN'}
          selectedTariff={selectedMonthTariff}
        />

        {/* Botón de Reiniciar Mes (si hay lecturas) */}
        {currentMonth.readings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t('actions.resetMonth')}</h3>
                <p className="text-sm text-gray-600">{t('actions.resetMonthDescription')}</p>
              </div>
              <button
                onClick={resetMonth}
                className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{t('actions.resetMonth')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>{t('footer.message')}</p>
          <p className="mt-1">{t('footer.tech')}</p>
        </div>
      </div>
      

      
      {/* Componente de estado de sesión (solo en desarrollo) */}
      <SessionStatus compact={true} position="bottom-right" />
      
      {/* Modal inicial para selección de mes */}
      <InitialMonthModal
        isOpen={showInitialModal}
        onClose={() => setShowInitialModal(false)}
        onMonthSelect={handleInitialMonthSelect}
        hasMonthData={hasMonthData}
        onSwitchToMonth={handleInitialSwitchToMonth}
      />
    </div>
  );
}