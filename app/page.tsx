'use client';

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
  Navbar
} from './components';
import { APP_CONFIG } from './constants';

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
    tariff
  } = useSupabaseEnergyData();

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
      <Navbar onLogout={signOut} />
      
      <div className="max-w-6xl mx-auto p-4">

        {/* Selector de Mes */}
        <MonthSelector 
          currentMonth={currentMonth.month}
          currentYear={currentMonth.year}
          onMonthChange={changeMonth}
          onSwitchToMonth={switchToMonth}
          hasMonthData={hasMonthData}
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
    </div>
  );
}
