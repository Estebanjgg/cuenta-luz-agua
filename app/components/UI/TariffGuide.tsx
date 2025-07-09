'use client';

import { useState } from 'react';

export default function TariffGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Como encontrar minha tarifa na conta de luz?</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Guia para Encontrar sua Tarifa</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">🔍 Onde procurar na conta:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Tarifa de Energia (TE):</strong> Valor por kWh da energia consumida</li>
                <li>• <strong>TUSD (Tarifa de Uso do Sistema de Distribuição):</strong> Valor por kWh do uso da rede</li>
                <li>• <strong>Tarifa Total:</strong> TE + TUSD (este é o valor que você deve usar)</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">🧮 Como calcular:</h4>
              <div className="text-sm text-blue-700">
                <p className="mb-2"><strong>Método 1 - Valores separados:</strong></p>
                <p className="bg-blue-50 p-2 rounded font-mono text-xs mb-2">
                  Tarifa Total = TE + TUSD<br/>
                  Exemplo: R$ 0,29274 + R$ 0,43244 = R$ 0,72518/kWh
                </p>
                
                <p className="mb-2"><strong>Método 2 - Cálculo direto:</strong></p>
                <p className="bg-blue-50 p-2 rounded font-mono text-xs">
                  Tarifa = Valor Total da Energia ÷ Consumo (kWh)<br/>
                  Exemplo: R$ 467,77 ÷ 588 kWh = R$ 0,79553/kWh
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">⚠️ Atenção:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Não inclua bandeiras tarifárias no cálculo base</li>
                <li>• Não inclua impostos (ICMS, PIS/COFINS) no valor da tarifa</li>
                <li>• Use apenas os valores de TE + TUSD ou o cálculo direto</li>
                <li>• A tarifa pode variar entre distribuidoras e regiões</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Principais Distribuidoras:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-700">
                <div>
                  <p><strong>São Paulo:</strong> Enel (~R$ 0,725/kWh)</p>
                  <p><strong>Rio de Janeiro:</strong> Light (~R$ 0,682/kWh)</p>
                  <p><strong>Minas Gerais:</strong> Cemig (~R$ 0,715/kWh)</p>
                </div>
                <div>
                  <p><strong>Bahia:</strong> Coelba (~R$ 0,699/kWh)</p>
                  <p><strong>Paraná:</strong> Copel (~R$ 0,671/kWh)</p>
                  <p><strong>Rio Grande do Sul:</strong> RGE (~R$ 0,732/kWh)</p>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                *Valores aproximados e podem variar. Consulte sempre sua conta atual.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}