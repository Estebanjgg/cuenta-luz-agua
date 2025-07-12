'use client';

import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { AuthComponent, Navbar } from './components';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InitialMonthModal from './components/UI/InitialMonthModal';
import { useSupabaseEnergyData } from './hooks/useSupabaseEnergyData';

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showInitialModal, setShowInitialModal] = useState(false);
  
  // Hook para acceder a los datos de energía
  const { hasMonthData, switchToMonth } = useSupabaseEnergyData();

  const handleShowConsumptionControl = () => {
    setShowInitialModal(true);
  };

  const handleCloseModal = () => {
    setShowInitialModal(false);
  };

  const handleMonthSelect = (month: string, year: number) => {
    // Cerrar el modal primero
    setShowInitialModal(false);
    // Redirigir a la página de control de consumo usando router.push
    router.push(`/control-consumo?month=${month}&year=${year}`);
  };

  const handleSwitchToMonth = (month: string, year: number) => {
    // Cerrar el modal primero
    setShowInitialModal(false);
    // Cambiar al mes seleccionado y redirigir
    switchToMonth(month, year);
    router.push('/control-consumo');
  };

  // Si no hay usuario autenticado, mostrar componente de autenticación
  if (!user && !authLoading) {
    return <AuthComponent />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('homePage.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Navbar */}
      <Navbar 
        onLogout={signOut}
        onShowConsumptionControl={handleShowConsumptionControl}
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('homePage.title')}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('homePage.subtitle')}
            </p>
            
            {/* Description */}
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              {t('homePage.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Control de Consumo Card */}
          <div 
            className={`group relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
              hoveredCard === 'consumption' ? 'ring-4 ring-blue-200' : ''
            }`}
            onMouseEnter={() => setHoveredCard('consumption')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            
            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('homePage.consumptionControl.title')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('homePage.consumptionControl.description')}
              </p>
              
              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('homePage.consumptionControl.features.meterReadings')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('homePage.consumptionControl.features.consumptionGraphs')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('homePage.consumptionControl.features.monthlyProjections')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('homePage.consumptionControl.features.costBreakdown')}
                </li>
              </ul>
              
              {/* Button */}
              <button 
                onClick={handleShowConsumptionControl}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {t('homePage.consumptionControl.button')}
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calculadora Card */}
          <div 
            className={`group relative bg-white rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
              hoveredCard === 'calculator' ? 'ring-4 ring-indigo-200' : ''
            }`}
            onMouseEnter={() => setHoveredCard('calculator')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            
            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('homePage.calculator.title')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('homePage.calculator.description')}
              </p>
              
              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('homePage.calculator.features.tariffFlags')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('homePage.calculator.features.tariffComparison')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('homePage.calculator.features.costSimulation')}
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('homePage.calculator.features.customTariffs')}
                </li>
              </ul>
              
              {/* Button */}
              <Link href="/calculadora">
                <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  {t('homePage.calculator.button')}
                  <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('homePage.benefits.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('homePage.benefits.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('homePage.benefits.guaranteedSavings.title')}</h3>
              <p className="text-gray-600">{t('homePage.benefits.guaranteedSavings.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('homePage.benefits.totalPrecision.title')}</h3>
              <p className="text-gray-600">{t('homePage.benefits.totalPrecision.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('homePage.benefits.easyToUse.title')}</h3>
              <p className="text-gray-600">{t('homePage.benefits.easyToUse.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-2">Gestiona tu consumo de energía de manera inteligente</p>
          <p className="text-sm text-gray-500">Desarrollado con tecnología moderna para un mejor control energético</p>
        </div>
      </div>

      {/* Initial Month Modal */}
      {showInitialModal && (
        <InitialMonthModal
          isOpen={showInitialModal}
          onClose={handleCloseModal}
          onMonthSelect={handleMonthSelect}
          hasMonthData={hasMonthData}
          onSwitchToMonth={handleSwitchToMonth}
        />
      )}
    </div>
  );
}
