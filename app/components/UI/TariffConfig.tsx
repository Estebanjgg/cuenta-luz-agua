'use client';

import React, { useState, useEffect } from 'react';
import { TariffConfig as TariffConfigType, SavedTariff, ExtendedTariffConfig } from '@/app/types';
import { useTariffManager } from '@/app/hooks/useTariffManager';
import { useTariffAPI } from '@/app/hooks/useTariffAPI';
import { useAuth } from '@/app/contexts/AuthContext';

interface DistribuidoraData {
  nome: string;
  sigla: string;
  estado: string;
  tarifa_residencial: number;
  tarifa_comercial: number;
  tarifa_industrial: number;
  taxa_iluminacao: number;
  taxa_adicional: number;
}

interface TariffConfigProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ExtendedTariffConfig;
  onSave: (config: ExtendedTariffConfig) => void;
  invoiceBasedConfig?: {
    pricePerKwh: number;
    publicLightingFee?: number;
    additionalFees?: number;
    companyName?: string;
  };
}

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const TariffConfig: React.FC<TariffConfigProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
  invoiceBasedConfig
}) => {
  // Estados principales
  const [configType, setConfigType] = useState<'automatic' | 'manual' | 'saved'>('automatic');
  const [selectedSavedTariff, setSelectedSavedTariff] = useState<SavedTariff | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTariffName, setNewTariffName] = useState('');
  
  // Estados para configuración automática (ANEEL)
  const [selectedEstado, setSelectedEstado] = useState<string>('SP');
  const [selectedDistribuidora, setSelectedDistribuidora] = useState<string>('');
  const [distribuidoras, setDistribuidoras] = useState<DistribuidoraData[]>([]);
  const [loadingDistribuidoras, setLoadingDistribuidoras] = useState(false);
  const [showAllDistribuidoras, setShowAllDistribuidoras] = useState(false);
  
  // Estados para configuración manual
  const [manualConfig, setManualConfig] = useState({
    pricePerKwh: currentConfig.pricePerKwh || 0,
    additionalFees: currentConfig.additionalFees || 0,
    publicLightingFee: currentConfig.publicLightingFee || 0,
    companyName: '',
    city: 'Bragança Paulista',
    state: 'SP'
  });
  
  // Estados de control
  const [config, setConfig] = useState<TariffConfigType>(currentConfig);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [useManualConfig, setUseManualConfig] = useState(false);
  
  const { user, session, loading: authLoading } = useAuth();
  const { getAllEstados, fetchANEELTariffs, getAllDistribuidorasEstado } = useTariffAPI();
  const {
    savedTariffs,
    userTariffConfig,
    loading: tariffManagerLoading,
    error: tariffManagerError,
    saveTariff,
    applyTariffToUser,
    updateUserTariffConfig,
    deleteTariff,
    getCurrentExtendedConfig,
    getTariffsByLocation,
    getPredefinedTariffs,
    getUserTariffs
  } = useTariffManager();

  // Cargar distribuidoras usando el parser optimizado
  const loadDistribuidoras = async () => {
    setLoadingDistribuidoras(true);
    setErrors(prev => ({ ...prev, distribuidoras: '' }));
    
    try {
      let distribuidorasANEEL;
      
      console.log(`🔍 Cargando distribuidoras para ${selectedEstado}`, {
        showAllDistribuidoras,
        selectedEstado
      });
      
      if (showAllDistribuidoras || selectedEstado === 'SP') {
        // Obtener todas las distribuidoras del estado (especialmente para SP)
        console.log(`🌍 Cargando TODAS las distribuidoras de ${selectedEstado}`);
        distribuidorasANEEL = await getAllDistribuidorasEstado(selectedEstado);
      } else {
        // Búsqueda normal por estado
        console.log(`📍 Búsqueda normal para ${selectedEstado}`);
        distribuidorasANEEL = await fetchANEELTariffs(selectedEstado);
      }
      
      // Convertir a formato compatible
      const distribuidorasCompativel: DistribuidoraData[] = distribuidorasANEEL.map(dist => ({
        nome: dist.nome,
        sigla: dist.sigla,
        estado: dist.estado,
        tarifa_residencial: dist.tarifa_total,
        tarifa_comercial: dist.tarifa_total * 0.9,
        tarifa_industrial: dist.tarifa_total * 0.7,
        taxa_iluminacao: dist.tarifa_tusd * 0.04,
        taxa_adicional: dist.tarifa_energia * 0.15
      }));
      
      setDistribuidoras(distribuidorasCompativel);
      console.log(`✅ Cargadas ${distribuidorasCompativel.length} distribuidoras`);
    } catch (error) {
      console.error('Erro ao carregar distribuidoras:', error);
      setErrors(prev => ({ ...prev, distribuidoras: 'Error al cargar las distribuidoras' }));
      setDistribuidoras([]);
    } finally {
      setLoadingDistribuidoras(false);
    }
  };

  // Manejar selección de tarifa guardada
  const handleSavedTariffSelect = (tariff: SavedTariff) => {
    setSelectedSavedTariff(tariff);
    setConfig({
      pricePerKwh: tariff.price_per_kwh,
      additionalFees: tariff.additional_fees || 0,
      publicLightingFee: tariff.public_lighting_fee || 0
    });
  };

  // Guardar tarifa manual
  const handleSaveManualTariff = async () => {
    // Verificar autenticación primero
    if (authLoading) {
      setErrors(prev => ({ ...prev, save: 'Verificando autenticación...' }));
      return;
    }
    
    if (!user || !session) {
      setErrors(prev => ({ ...prev, save: 'Error de autenticación: Debe iniciar sesión para guardar tarifas' }));
      return;
    }
    
    if (!newTariffName.trim()) {
      setErrors(prev => ({ ...prev, tariffName: 'El nombre es requerido' }));
      return;
    }

    // Validar que los valores de tarifa sean válidos
    if (!config.pricePerKwh || config.pricePerKwh <= 0) {
      setErrors(prev => ({ ...prev, save: 'Debe configurar un precio por kWh válido' }));
      return;
    }

    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, save: '' })); // Limpiar errores previos
      
      const tariffData = {
        name: newTariffName,
        company_name: manualConfig.companyName || 'Compañía personalizada',
        company_code: manualConfig.companyName?.substring(0, 10).toUpperCase() || 'CUSTOM',
        city: manualConfig.city,
        state: manualConfig.state,
        price_per_kwh: config.pricePerKwh,
        public_lighting_fee: config.publicLightingFee || 0,
        additional_fees: config.additionalFees || 0,
        source_type: 'manual' as const,
        is_predefined: false
      };
      
      const result = await saveTariff(tariffData);
      
      if (result) {
        // Crear la configuración final para aplicar al usuario
        const finalConfig: ExtendedTariffConfig = {
          pricePerKwh: config.pricePerKwh,
          additionalFees: config.additionalFees,
          publicLightingFee: config.publicLightingFee,
          source: {
            type: 'manual',
            company_name: manualConfig.companyName,
            city: manualConfig.city,
            state: manualConfig.state
          }
        };
        
        // Aplicar la configuración al usuario actual
        await applyTariffToUser(result);
        await onSave(finalConfig);
        
        setShowSaveDialog(false);
        setNewTariffName('');
        setErrors(prev => ({ ...prev, tariffName: '', save: '' }));
        
        alert('Tarifa guardada y aplicada exitosamente');
        
        // Cerrar el modal principal
        onClose();
      } else {
        throw new Error('No se pudo guardar la tarifa - saveTariff retornó false');
      }
    } catch (error) {
      console.error('Error al guardar tarifa:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar la tarifa';
      
      setErrors(prev => ({ ...prev, save: errorMessage }));
      alert(`Error al guardar la tarifa: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar tarifa da distribuidora selecionada
  const applyDistribuidoraTariff = () => {
    const distribuidora = distribuidoras.find(d => d.sigla === selectedDistribuidora);
    if (distribuidora) {
      setConfig({
        ...config,
        pricePerKwh: distribuidora.tarifa_residencial,
        publicLightingFee: distribuidora.taxa_iluminacao,
        additionalFees: distribuidora.taxa_adicional
      });
    }
  };

  // Validação
  const validateConfig = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (config.pricePerKwh < 0.1 || config.pricePerKwh > 2.0) {
      newErrors.pricePerKwh = 'Tarifa deve estar entre R$ 0,10 e R$ 2,00 por kWh';
    }
    
    if ((config.additionalFees || 0) < 0 || (config.additionalFees || 0) > 200) {
      newErrors.additionalFees = 'Taxas adicionais devem estar entre R$ 0 e R$ 200';
    }
    
    if ((config.publicLightingFee || 0) < 0 || (config.publicLightingFee || 0) > 100) {
      newErrors.publicLightingFee = 'Taxa de iluminação deve estar entre R$ 0 e R$ 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateConfig()) return;
    
    setLoading(true);
    try {
      let finalConfig: ExtendedTariffConfig;
      
      if (configType === 'manual') {
        // Para tarifas manuales, mostrar el diálogo de guardado
        // en lugar de guardar directamente
        setShowSaveDialog(true);
        setLoading(false);
        return;
      } else if (configType === 'saved' && selectedSavedTariff) {
        // Para tarifas guardadas, aplicar la tarifa al usuario
        if (user && session) {
          await applyTariffToUser(selectedSavedTariff);
        }
        
        finalConfig = {
          pricePerKwh: selectedSavedTariff.price_per_kwh,
          additionalFees: selectedSavedTariff.additional_fees || 0,
          publicLightingFee: selectedSavedTariff.public_lighting_fee || 0,
          source: {
            type: 'saved',
            company_name: selectedSavedTariff.company_name,
            city: selectedSavedTariff.city,
            state: selectedSavedTariff.state,
            saved_tariff_id: selectedSavedTariff.id
          }
        };
      } else if (configType === 'automatic') {
        const distribuidora = distribuidoras.find(d => d.sigla === selectedDistribuidora);
        const tariffConfig: TariffConfigType = {
          pricePerKwh: config.pricePerKwh,
          additionalFees: config.additionalFees || 0,
          publicLightingFee: config.publicLightingFee || 0
        };
        
        const source: ExtendedTariffConfig['source'] = {
          type: 'automatic',
          company_name: distribuidora?.nome,
          company_code: distribuidora?.sigla,
          state: selectedEstado
        };
        
        // Para configuraciones automáticas, actualizar la configuración del usuario
        if (user && session) {
          await updateUserTariffConfig(tariffConfig, source);
        }
        
        finalConfig = {
          ...tariffConfig,
          source
        };
      } else {
        finalConfig = config;
      }

      await onSave(finalConfig);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEstado && !useManualConfig) {
      // Para São Paulo, cargar automáticamente todas las distribuidoras
      if (selectedEstado === 'SP') {
        setShowAllDistribuidoras(true);
      }
      loadDistribuidoras();
    }
  }, [selectedEstado, useManualConfig]);

  useEffect(() => {
    if (selectedDistribuidora && !useManualConfig) {
      applyDistribuidoraTariff();
    }
  }, [selectedDistribuidora]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Configuração de Tarifas
              </h2>
              <p className="text-blue-100 mt-1">Personalize suas tarifas de energia elétrica</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Indicador de estado de autenticación */}
          <div className="mt-4">
            {authLoading ? (
              <div className="flex items-center gap-2 text-yellow-200 bg-yellow-500 bg-opacity-20 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm">Verificando autenticación...</span>
              </div>
            ) : user && session ? (
              <div className="flex items-center gap-2 text-green-200 bg-green-500 bg-opacity-20 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Sesión activa - {user.email}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-200 bg-red-500 bg-opacity-20 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm">Sin sesión activa - Inicie sesión para guardar tarifas</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tipo de Configuración */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Tipo de Configuración</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="configType"
                  value="automatic"
                  checked={configType === 'automatic'}
                  onChange={() => setConfigType('automatic')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Automática (ANEEL)</span>
                  <p className="text-sm text-gray-600">Datos oficiales de ANEEL</p>
                </div>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="configType"
                  value="saved"
                  checked={configType === 'saved'}
                  onChange={() => setConfigType('saved')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Tarifa Guardada</span>
                  <p className="text-sm text-gray-600">Usar tarifa previamente guardada</p>
                </div>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="configType"
                  value="manual"
                  checked={configType === 'manual'}
                  onChange={() => setConfigType('manual')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Manual</span>
                  <p className="text-sm text-gray-600">Configuración personalizada</p>
                </div>
              </label>
            </div>
            
            {/* Mostrar información de tarifa basada en factura */}
            {invoiceBasedConfig && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-medium text-blue-800">Tarifa basada en factura detectada</h4>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  Se detectó una configuración basada en tu factura de {invoiceBasedConfig.companyName || 'CPFL Paulista'}.
                  Al guardar en modo manual, se creará automáticamente una tarifa de Bragança Paulista.
                </p>
                <div className="text-sm text-blue-600">
                  <span className="font-medium">Tarifa: </span>R$ {invoiceBasedConfig.pricePerKwh.toFixed(6)}/kWh
                  {invoiceBasedConfig.publicLightingFee && (
                    <span className="ml-4"><span className="font-medium">Iluminación: </span>R$ {invoiceBasedConfig.publicLightingFee.toFixed(2)}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Configuración de Tarifas Guardadas */}
          {configType === 'saved' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Tarifas Guardadas</h3>
              
              {tariffManagerLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Cargando tarifas...</span>
                </div>
              ) : savedTariffs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay tarifas guardadas disponibles.</p>
                  <p className="text-sm mt-1">Crea una tarifa manual para guardarla.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedTariffs.map((tariff) => (
                    <div
                      key={tariff.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSavedTariff?.id === tariff.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSavedTariffSelect(tariff)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{tariff.name}</h4>
                          <p className="text-sm text-gray-600">
                            {tariff.company_name} - {tariff.city}, {tariff.state}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            <span className="text-green-600 font-medium">
                              R$ {tariff.price_per_kwh.toFixed(6)}/kWh
                            </span>
                            {tariff.public_lighting_fee && tariff.public_lighting_fee > 0 && (
                              <span className="text-blue-600">
                                Iluminación: R$ {tariff.public_lighting_fee.toFixed(2)}
                              </span>
                            )}
                            {tariff.additional_fees && tariff.additional_fees > 0 && (
                              <span className="text-orange-600">
                                Adicionales: R$ {tariff.additional_fees.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          {tariff.is_predefined && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Predefinida
                            </span>
                          )}
                          <span className="text-xs text-gray-500 mt-1 capitalize">
                            {tariff.source_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Configuração Automática */}
          {configType === 'automatic' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Configuração Automática
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Selecione seu estado e distribuidora para carregar as tarifas oficiais da ANEEL
                </p>
                
                {/* Seleção de Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={selectedEstado}
                      onChange={(e) => setSelectedEstado(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {ESTADOS_BRASIL.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  

                </div>

                {/* Opciones de búsqueda */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setShowAllDistribuidoras(true);
                      loadDistribuidoras();
                    }}
                    disabled={loadingDistribuidoras}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                  >
                    Cargar Todas las Distribuidoras
                  </button>
                  <button
                    onClick={() => {
                      setShowAllDistribuidoras(false);
                      loadDistribuidoras();
                    }}
                    disabled={loadingDistribuidoras}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors text-sm"
                  >
                    Limpiar
                  </button>
                </div>
                
                {/* Seleção de Distribuidora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distribuidora {distribuidoras.length > 0 && `(${distribuidoras.length} encontradas)`}
                  </label>
                  <select
                    value={selectedDistribuidora}
                    onChange={(e) => setSelectedDistribuidora(e.target.value)}
                    disabled={loadingDistribuidoras || distribuidoras.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Selecione uma distribuidora</option>
                    {distribuidoras.map(dist => (
                      <option key={`${dist.sigla}-${dist.nome}`} value={dist.sigla}>
                        {dist.nome} ({dist.sigla}) - R$ {dist.tarifa_residencial.toFixed(3)}/kWh
                      </option>
                    ))}
                  </select>
                  {loadingDistribuidoras && (
                    <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando distribuidoras desde ANEEL...
                    </p>
                  )}
                  {!loadingDistribuidoras && distribuidoras.length === 0 && selectedEstado && (
                    <p className="text-sm text-amber-600 mt-1">⚠️ No se encontraron distribuidoras. Intente con otra búsqueda.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Configuração Manual */}
          {configType === 'manual' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Configuração Manual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Companhia
                  </label>
                  <input
                    type="text"
                    value={manualConfig.companyName}
                    onChange={(e) => setManualConfig({...manualConfig, companyName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: CPFL Paulista"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={manualConfig.city}
                    onChange={(e) => setManualConfig({...manualConfig, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Bragança Paulista"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => {
                    // Sincronizar manualConfig con config antes de guardar
                    setManualConfig({
                      ...manualConfig,
                      pricePerKwh: config.pricePerKwh,
                      additionalFees: config.additionalFees || 0,
                      publicLightingFee: config.publicLightingFee || 0
                    });
                    setShowSaveDialog(true);
                  }}
                  disabled={!config.pricePerKwh || config.pricePerKwh <= 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar Tarifa
                </button>
              </div>
            </div>
          )}

          {/* Ajustes de Valores */}
          {(configType === 'manual' || configType === 'automatic') && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              {configType === 'manual' ? 'Valores de Tarifa' : 'Ajustes Finais'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tarifa por kWh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tarifa por kWh (R$)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.1"
                  max="2.0"
                  value={config.pricePerKwh}
                  onChange={(e) => setConfig({...config, pricePerKwh: parseFloat(e.target.value) || 0})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.pricePerKwh ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.795"
                />
                {errors.pricePerKwh && (
                  <p className="text-red-500 text-xs mt-1">{errors.pricePerKwh}</p>
                )}
              </div>

              {/* Taxas Adicionais */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Taxas Adicionais (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="200"
                  value={config.additionalFees || 0}
                  onChange={(e) => setConfig({...config, additionalFees: parseFloat(e.target.value) || 0})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.additionalFees ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="41.12"
                />
                {errors.additionalFees && (
                  <p className="text-red-500 text-xs mt-1">{errors.additionalFees}</p>
                )}
              </div>

              {/* Taxa de Iluminação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Taxa Iluminação (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={config.publicLightingFee || 0}
                  onChange={(e) => setConfig({...config, publicLightingFee: parseFloat(e.target.value) || 0})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.publicLightingFee ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.publicLightingFee && (
                  <p className="text-red-500 text-xs mt-1">{errors.publicLightingFee}</p>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Dialog para guardar tarifa manual */}
          {showSaveDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Guardar Tarifa</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la tarifa
                    </label>
                    <input
                      type="text"
                      value={newTariffName}
                      onChange={(e) => setNewTariffName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.tariffName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Mi tarifa personalizada"
                    />
                    {errors.tariffName && (
                      <p className="text-red-500 text-xs mt-1">{errors.tariffName}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p><strong>Compañía:</strong> {manualConfig.companyName || 'Sin especificar'}</p>
                    <p><strong>Ubicación:</strong> {manualConfig.city}, {manualConfig.state}</p>
                    <p><strong>Tarifa:</strong> R$ {manualConfig.pricePerKwh.toFixed(6)}/kWh</p>
                  </div>
                  
                  {errors.save && (
                    <p className="text-red-500 text-sm">{errors.save}</p>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        setNewTariffName('');
                        setErrors(prev => ({ ...prev, tariffName: '' }));
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveManualTariff}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumo */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resumo da Configuração
            </h3>
            
            {/* Información del tipo de configuración */}
            <div className="mb-4 p-3 bg-white rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Tipo de Configuración:</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {configType === 'automatic' ? 'Automática (ANEEL)' : 
                   configType === 'saved' ? 'Tarifa Guardada' : 'Manual'}
                </span>
              </div>
              
              {configType === 'saved' && selectedSavedTariff && (
                <div className="text-sm text-gray-600">
                  <p><strong>Tarifa:</strong> {selectedSavedTariff.name}</p>
                  <p><strong>Compañía:</strong> {selectedSavedTariff.company_name}</p>
                  <p><strong>Ubicación:</strong> {selectedSavedTariff.city}, {selectedSavedTariff.state}</p>
                </div>
              )}
              
              {configType === 'automatic' && selectedDistribuidora && (
                <div className="text-sm text-gray-600">
                  <p><strong>Estado:</strong> {selectedEstado}</p>
                  <p><strong>Distribuidora:</strong> {selectedDistribuidora}</p>
                </div>
              )}
              
              {configType === 'manual' && (
                <div className="text-sm text-gray-600">
                  <p><strong>Compañía:</strong> {manualConfig.companyName || 'Sin especificar'}</p>
                  <p><strong>Ubicación:</strong> {manualConfig.city}, {manualConfig.state}</p>
                </div>
              )}
            </div>
            
            {/* Valores de la tarifa */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3">
                <span className="text-gray-600">Preço por kWh:</span>
                <p className="font-semibold text-green-600">
                  R$ {(
                    configType === 'saved' && selectedSavedTariff ? selectedSavedTariff.price_per_kwh :
                    configType === 'manual' ? manualConfig.pricePerKwh :
                    config.pricePerKwh
                  ).toFixed(6)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <span className="text-gray-600">Taxa de Iluminação:</span>
                <p className="font-semibold text-blue-600">
                  R$ {(
                    configType === 'saved' && selectedSavedTariff ? (selectedSavedTariff.public_lighting_fee || 0) :
                    configType === 'manual' ? manualConfig.publicLightingFee :
                    (config.publicLightingFee || 0)
                  ).toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <span className="text-gray-600">Taxas Adicionais:</span>
                <p className="font-semibold text-orange-600">
                  R$ {(
                    configType === 'saved' && selectedSavedTariff ? (selectedSavedTariff.additional_fees || 0) :
                    configType === 'manual' ? manualConfig.additionalFees :
                    (config.additionalFees || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || authLoading || (
                (configType === 'automatic' && !selectedDistribuidora) ||
                (configType === 'saved' && !selectedSavedTariff) ||
                (configType === 'manual' && (!manualConfig.pricePerKwh || manualConfig.pricePerKwh <= 0 || !user || !session))
              )}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 
               authLoading ? 'Verificando...' :
               (!user || !session) && configType === 'manual' ? 'Inicie sesión para guardar' :
               'Salvar Configuração'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffConfig;