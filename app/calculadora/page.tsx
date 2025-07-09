'use client';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthComponent, Navbar } from '../components';
import ApplianceCalculator from '../components/UI/ApplianceCalculator';
import TariffGuide from '../components/UI/TariffGuide';
import SessionStatus from '../components/UI/SessionStatus';

export default function CalculadoraPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();

  // Si no hay usuario autenticado, mostrar componente de autenticación
  if (!user && !authLoading) {
    return <AuthComponent />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <Navbar 
        onLogout={signOut}
        currentPage="calculadora"
      />
      
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ⚡ Calculadora de Consumo de Eletrodomésticos
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubra quanto cada eletrodoméstico da sua casa consome de energia e quanto isso custa na sua conta de luz. 
            Adicione seus aparelhos e veja métricas detalhadas de consumo.
          </p>
        </div>

        {/* Calculadora */}
        <ApplianceCalculator />

        {/* Guia de Tarifas */}
        <TariffGuide />

        {/* Dicas de Economia */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Dicas para Economizar Energia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🌡️ Ar Condicionado</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Use temperatura entre 23-25°C</li>
                <li>• Mantenha portas e janelas fechadas</li>
                <li>• Limpe os filtros regularmente</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">❄️ Geladeira</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Mantenha entre 3-5°C</li>
                <li>• Não abra desnecessariamente</li>
                <li>• Verifique as borrachas de vedação</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Iluminação</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use lâmpadas LED</li>
                <li>• Aproveite a luz natural</li>
                <li>• Desligue luzes desnecessárias</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">🧺 Máquina de Lavar</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Use água fria quando possível</li>
                <li>• Lave com carga completa</li>
                <li>• Limpe o filtro regularmente</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">📺 Eletrônicos</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Desligue da tomada quando não usar</li>
                <li>• Use modo econômico</li>
                <li>• Evite deixar em stand-by</li>
              </ul>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-800 mb-2">🍳 Cozinha</h3>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Use panelas com fundo adequado</li>
                <li>• Tampe as panelas durante o cozimento</li>
                <li>• Descongele alimentos naturalmente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Como Interpretar os Resultados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Fórmula do Cálculo</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm">
                  <strong>Consumo (kWh) = Potência (W) × Tempo (h) ÷ 1000</strong><br/><br/>
                  <strong>Custo (R$) = Consumo (kWh) × Tarifa (R$/kWh)</strong>
                </code>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                A potência está indicada na etiqueta do aparelho ou manual. 
                O tempo de uso deve ser estimado baseado no seu uso real.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Classificação de Consumo</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm"><strong>Baixo:</strong> 0-2 kWh/mês</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm"><strong>Médio:</strong> 2-10 kWh/mês</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm"><strong>Alto:</strong> 10-50 kWh/mês</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm"><strong>Muito Alto:</strong> +50 kWh/mês</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>💡 Baseado na fórmula padrão de cálculo de consumo energético</p>
          <p className="mt-1">Os valores são estimativas e podem variar conforme condições de uso</p>
        </div>
      </div>
      
      {/* Componente de estado de sesión (solo en desarrollo) */}
      <SessionStatus compact={true} position="bottom-right" />
    </div>
  );
}