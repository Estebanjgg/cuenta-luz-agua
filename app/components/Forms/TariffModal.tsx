'use client';

import React, { useState, useEffect } from 'react';
import { Tariff, TariffFormData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface TariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tariffData: TariffFormData) => Promise<boolean>;
  tariff?: Tariff | null; // Para edición
  title?: string;
}

// Valores oficiales de ANEEL para las bandeiras tarifarias (uniformes para todo Brasil)
const ANEEL_BANDEIRA_VALUES = {
  green: 0, // Verde: sin recargo adicional
  yellow: 0.01885, // Amarilla: R$ 1,885/100 kWh → R$ 0,01885/kWh
  red_1: 0.04463, // Roja Nivel 1: R$ 4,463/100 kWh → R$ 0,04463/kWh
  red_2: 0.07877  // Roja Nivel 2: R$ 7,877/100 kWh → R$ 0,07877/kWh
};

const initialFormData: TariffFormData = {
  city: '',
  state: '',
  company_name: '',
  price_per_kwh_green: 0.7950, // Valor base típico + bandeira verde (0)
  price_per_kwh_yellow: 0.7950 + ANEEL_BANDEIRA_VALUES.yellow,
  price_per_kwh_red_1: 0.7950 + ANEEL_BANDEIRA_VALUES.red_1,
  price_per_kwh_red_2: 0.7950 + ANEEL_BANDEIRA_VALUES.red_2,
  additional_fees: 0,
  public_lighting_fee: 0,
  is_public: false
};

export default function TariffModal({ 
  isOpen, 
  onClose, 
  onSave, 
  tariff, 
  title = 'Nueva Tarifa' 
}: TariffModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<TariffFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos de la tarifa para edición
  useEffect(() => {
    if (tariff) {
      setFormData({
        city: tariff.city,
        state: tariff.state,
        company_name: tariff.company_name,
        price_per_kwh_green: tariff.price_per_kwh_green,
        price_per_kwh_yellow: tariff.price_per_kwh_yellow,
        price_per_kwh_red_1: tariff.price_per_kwh_red_1,
        price_per_kwh_red_2: tariff.price_per_kwh_red_2,
        additional_fees: tariff.additional_fees,
        public_lighting_fee: tariff.public_lighting_fee,
        is_public: tariff.is_public
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [tariff, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.state.trim()) {
      newErrors.state = t('tariffModal.stateRequired');
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'El nombre de la compañía es requerido';
    }

    if (formData.price_per_kwh_green <= 0) {
      newErrors.price_per_kwh_green = t('tariffModal.priceGreaterThanZero');
    }

    if (formData.price_per_kwh_yellow <= 0) {
      newErrors.price_per_kwh_yellow = 'El precio por kWh (amarillo) debe ser mayor a 0';
    }

    if (formData.price_per_kwh_red_1 <= 0) {
      newErrors.price_per_kwh_red_1 = 'El precio por kWh (rojo 1) debe ser mayor a 0';
    }

    if (formData.price_per_kwh_red_2 <= 0) {
      newErrors.price_per_kwh_red_2 = 'El precio por kWh (rojo 2) debe ser mayor a 0';
    }

    if (formData.additional_fees < 0) {
      newErrors.additional_fees = 'Las tarifas adicionales no pueden ser negativas';
    }

    if (formData.public_lighting_fee < 0) {
      newErrors.public_lighting_fee = 'La tarifa de alumbrado público no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving tariff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof TariffFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Función para aplicar valores oficiales de ANEEL
  const applyAneelValues = () => {
    const basePrice = formData.price_per_kwh_green;
    setFormData(prev => ({
      ...prev,
      price_per_kwh_yellow: parseFloat((basePrice + ANEEL_BANDEIRA_VALUES.yellow).toFixed(4)),
      price_per_kwh_red_1: parseFloat((basePrice + ANEEL_BANDEIRA_VALUES.red_1).toFixed(4)),
      price_per_kwh_red_2: parseFloat((basePrice + ANEEL_BANDEIRA_VALUES.red_2).toFixed(4))
    }));
  };

  // Función para calcular solo los recargos de bandeira
  const calculateBandeiraCharge = (flag: 'yellow' | 'red_1' | 'red_2') => {
    return ANEEL_BANDEIRA_VALUES[flag];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{tariff ? t('tariffModal.update') : t('tariffModal.newTariff')}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tariffModal.city')}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Bragança Paulista"
                  disabled={isLoading}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tariffModal.state')}
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: SP"
                  disabled={isLoading}
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('tariffModal.electricCompany')}
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.company_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Energisa"
                disabled={isLoading}
              />
              {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
            </div>

            {/* Tarifas por bandera */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{t('tariffModal.tariffsByFlag')}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('tariffModal.aneelInfo')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applyAneelValues}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isLoading}
                >
                  {t('tariffModal.applyAneelValues')}
                </button>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">{t('tariffModal.flagInfo')}</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>{t('tariffModal.greenFlagInfo')}</strong></p>
                  <p><strong>{t('tariffModal.yellowFlagInfo')}</strong></p>
                  <p><strong>{t('tariffModal.redFlag1Info')}</strong></p>
                  <p><strong>{t('tariffModal.redFlag2Info')}</strong></p>
                  <p className="mt-2 italic">{t('tariffModal.flagInfoNote')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tariffModal.greenFlagLabel')}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={parseFloat(formData.price_per_kwh_green.toFixed(4))}
                    onChange={(e) => handleInputChange('price_per_kwh_green', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price_per_kwh_green ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.7950"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('tariffModal.baseTariffNote')}</p>
                  {errors.price_per_kwh_green && <p className="text-red-500 text-sm mt-1">{errors.price_per_kwh_green}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tariffModal.yellowFlagLabel')}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={parseFloat(formData.price_per_kwh_yellow.toFixed(4))}
                    onChange={(e) => handleInputChange('price_per_kwh_yellow', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price_per_kwh_yellow ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={(0.7950 + ANEEL_BANDEIRA_VALUES.yellow).toFixed(4)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Base + R$ {ANEEL_BANDEIRA_VALUES.yellow.toFixed(5)}/kWh (ANEEL)</p>
                  {errors.price_per_kwh_yellow && <p className="text-red-500 text-sm mt-1">{errors.price_per_kwh_yellow}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tariffModal.redFlag1Label')}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={parseFloat(formData.price_per_kwh_red_1.toFixed(4))}
                    onChange={(e) => handleInputChange('price_per_kwh_red_1', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price_per_kwh_red_1 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={(0.7950 + ANEEL_BANDEIRA_VALUES.red_1).toFixed(4)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Base + R$ {ANEEL_BANDEIRA_VALUES.red_1.toFixed(5)}/kWh (ANEEL)</p>
                  {errors.price_per_kwh_red_1 && <p className="text-red-500 text-sm mt-1">{errors.price_per_kwh_red_1}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tariffModal.redFlag2Label')}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={parseFloat(formData.price_per_kwh_red_2.toFixed(4))}
                    onChange={(e) => handleInputChange('price_per_kwh_red_2', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price_per_kwh_red_2 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={(0.7950 + ANEEL_BANDEIRA_VALUES.red_2).toFixed(4)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Base + R$ {ANEEL_BANDEIRA_VALUES.red_2.toFixed(5)}/kWh (ANEEL)</p>
                  {errors.price_per_kwh_red_2 && <p className="text-red-500 text-sm mt-1">{errors.price_per_kwh_red_2}</p>}
                </div>
              </div>
            </div>

            {/* Tarifas fijas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">{t('tariffModal.fixedTariffs')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tariffModal.additionalFees')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.additional_fees}
                    onChange={(e) => handleInputChange('additional_fees', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.additional_fees ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="41.12"
                    disabled={isLoading}
                  />
                  {errors.additional_fees && <p className="text-red-500 text-sm mt-1">{errors.additional_fees}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tariffModal.publicLighting')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.public_lighting_fee}
                    onChange={(e) => handleInputChange('public_lighting_fee', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.public_lighting_fee ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="15.00"
                    disabled={isLoading}
                  />
                  {errors.public_lighting_fee && <p className="text-red-500 text-sm mt-1">{errors.public_lighting_fee}</p>}
                </div>
              </div>
            </div>

            {/* Opciones */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="mr-2"
                disabled={isLoading}
              />
              <label htmlFor="is_public" className="text-sm text-gray-700">
                {t('tariffModal.makePublic')}
              </label>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                {t('tariffModal.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? t('tariffModal.saving') : tariff ? t('tariffModal.update') : t('tariffModal.createTariff')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}