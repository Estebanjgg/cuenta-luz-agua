'use client';

import { useState, useEffect } from 'react';

import { DEFAULT_TARIFF } from '../../constants';
import TariffSettings from './TariffSettings';

interface Appliance {
  id: string;
  name: string;
  power: number; // watts
  hoursPerDay: number;
  daysPerMonth: number;
  category: string;
}

interface ApplianceStats {
  dailyConsumption: number; // kWh
  monthlyConsumption: number; // kWh
  dailyCost: number; // R$
  monthlyCost: number; // R$
}

const APPLIANCE_CATEGORIES = [
  'Cozinha',
  'Climatização',
  'Entretenimento',
  'Limpeza',
  'Iluminação',
  'Outros'
];

const COMMON_APPLIANCES = [
  { name: 'Geladeira', power: 150, category: 'Cozinha' },
  { name: 'Microondas', power: 1200, category: 'Cozinha' },
  { name: 'Air Fryer', power: 1500, category: 'Cozinha' },
  { name: 'Fogão Elétrico', power: 2000, category: 'Cozinha' },
  { name: 'Ar Condicionado', power: 2000, category: 'Climatização' },
  { name: 'Ventilador', power: 75, category: 'Climatização' },
  { name: 'Televisão', power: 100, category: 'Entretenimento' },
  { name: 'Máquina de Lavar', power: 500, category: 'Limpeza' },
  { name: 'Freezer', power: 300, category: 'Cozinha' }
];

export default function ApplianceCalculator() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentTariff, setCurrentTariff] = useState(DEFAULT_TARIFF.baseConsumption);
  const [formData, setFormData] = useState({
    name: '',
    power: '',
    hoursPerDay: '',
    daysPerMonth: '30',
    category: 'Outros'
  });

  // Cargar tarifa personalizada del localStorage
  useEffect(() => {
    const savedTariff = localStorage.getItem('customTariff');
    if (savedTariff) {
      const tariffValue = parseFloat(savedTariff);
      if (!isNaN(tariffValue) && tariffValue > 0) {
        setCurrentTariff(tariffValue);
      }
    }
  }, []);

  // Guardar tarifa personalizada en localStorage
  const handleTariffChange = (newTariff: number) => {
    setCurrentTariff(newTariff);
    localStorage.setItem('customTariff', newTariff.toString());
  };

  const calculateApplianceStats = (appliance: Appliance): ApplianceStats => {
    const dailyConsumption = (appliance.power * appliance.hoursPerDay) / 1000; // kWh
    const monthlyConsumption = dailyConsumption * appliance.daysPerMonth;
    const dailyCost = dailyConsumption * currentTariff;
    const monthlyCost = monthlyConsumption * currentTariff;

    return {
      dailyConsumption,
      monthlyConsumption,
      dailyCost,
      monthlyCost
    };
  };

  const getTotalStats = () => {
    return appliances.reduce(
      (total, appliance) => {
        const stats = calculateApplianceStats(appliance);
        return {
          dailyConsumption: total.dailyConsumption + stats.dailyConsumption,
          monthlyConsumption: total.monthlyConsumption + stats.monthlyConsumption,
          dailyCost: total.dailyCost + stats.dailyCost,
          monthlyCost: total.monthlyCost + stats.monthlyCost
        };
      },
      { dailyConsumption: 0, monthlyConsumption: 0, dailyCost: 0, monthlyCost: 0 }
    );
  };

  const addAppliance = () => {
    if (!formData.name || !formData.power || !formData.hoursPerDay) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newAppliance: Appliance = {
      id: Date.now().toString(),
      name: formData.name,
      power: parseFloat(formData.power),
      hoursPerDay: parseFloat(formData.hoursPerDay),
      daysPerMonth: parseFloat(formData.daysPerMonth),
      category: formData.category
    };

    setAppliances([...appliances, newAppliance]);
    setFormData({
      name: '',
      power: '',
      hoursPerDay: '',
      daysPerMonth: '30',
      category: 'Outros'
    });
    setShowForm(false);
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter(app => app.id !== id));
  };

  const addCommonAppliance = (commonAppliance: typeof COMMON_APPLIANCES[0]) => {
    setFormData({
      name: commonAppliance.name,
      power: commonAppliance.power.toString(),
      hoursPerDay: '',
      daysPerMonth: '30',
      category: commonAppliance.category
    });
    setShowForm(true);
  };

  const totalStats = getTotalStats();
  const appliancesByCategory = appliances.reduce((acc, appliance) => {
    if (!acc[appliance.category]) {
      acc[appliance.category] = [];
    }
    acc[appliance.category].push(appliance);
    return acc;
  }, {} as Record<string, Appliance[]>);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          🏠 Calculadora de Consumo de Eletrodomésticos
        </h2>
        <div className="flex items-center space-x-3">
          <TariffSettings 
             currentTariff={currentTariff}
             onTariffChange={handleTariffChange}
           />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Adicionar Eletrodoméstico</span>
          </button>
        </div>
      </div>

      {/* Resumo Total */}
      {appliances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Consumo Diário</h3>
            <p className="text-2xl font-bold text-blue-800">
              {totalStats.dailyConsumption.toFixed(2)} kWh
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Consumo Mensal</h3>
            <p className="text-2xl font-bold text-green-800">
              {totalStats.monthlyConsumption.toFixed(2)} kWh
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-600">Custo Diário</h3>
            <p className="text-2xl font-bold text-yellow-800">
              R$ {totalStats.dailyCost.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-600">Custo Mensal</h3>
            <p className="text-2xl font-bold text-red-800">
              R$ {totalStats.monthlyCost.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Adicionar Novo Eletrodoméstico</h3>
          
          {/* Eletrodomésticos Comuns */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Ou escolha um comum:</h4>
            <div className="flex flex-wrap gap-2">
              {COMMON_APPLIANCES.map((appliance, index) => (
                <button
                  key={index}
                  onClick={() => addCommonAppliance(appliance)}
                  className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {appliance.name} ({appliance.power}W)
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Eletrodoméstico *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Geladeira"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potência (Watts) *
              </label>
              <input
                type="number"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas por Dia *
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dias por Mês
              </label>
              <input
                type="number"
                value={formData.daysPerMonth}
                onChange={(e) => setFormData({ ...formData, daysPerMonth: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {APPLIANCE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={addAppliance}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Eletrodomésticos por Categoria */}
      {appliances.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(appliancesByCategory).map(([category, categoryAppliances]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{category}</h3>
              <div className="grid gap-4">
                {categoryAppliances.map((appliance) => {
                  const stats = calculateApplianceStats(appliance);
                  return (
                    <div key={appliance.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{appliance.name}</h4>
                          <p className="text-sm text-gray-600">
                            {appliance.power}W • {appliance.hoursPerDay}h/dia • {appliance.daysPerMonth} dias/mês
                          </p>
                        </div>
                        <button
                          onClick={() => removeAppliance(appliance.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <div>
                          <span className="text-xs text-gray-500">Consumo Diário</span>
                          <p className="font-semibold text-blue-600">{stats.dailyConsumption.toFixed(2)} kWh</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Consumo Mensal</span>
                          <p className="font-semibold text-green-600">{stats.monthlyConsumption.toFixed(2)} kWh</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Custo Diário</span>
                          <p className="font-semibold text-yellow-600">R$ {stats.dailyCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Custo Mensal</span>
                          <p className="font-semibold text-red-600">R$ {stats.monthlyCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum eletrodoméstico adicionado
          </h3>
          <p className="text-gray-500 mb-4">
            Adicione seus eletrodomésticos para calcular o consumo e custo de energia
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Adicionar Primeiro Eletrodoméstico
          </button>
        </div>
      )}

      {/* Informações sobre o Cálculo */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Como funciona o cálculo?</h4>
        <p className="text-sm text-blue-700">
          <strong>Consumo (kWh) = Potência (W) × Tempo (h) ÷ 1000</strong><br/>
          O custo é calculado multiplicando o consumo pela tarifa atual (R$ {currentTariff.toFixed(5)}/kWh).
          Os valores não incluem bandeiras tarifárias, impostos ou taxas adicionais.
        </p>
      </div>
    </div>
  );
}