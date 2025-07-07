'use client';

import { useState, useCallback } from 'react';
import { TariffConfig } from '@/app/types';
import { TariffParser, DistribuidoraResidencial, loadTariffData } from '@/app/utils/tariffParser';

export interface DistribuidoraANEEL {
  nome: string;
  sigla: string;
  estado: string;
  classe: string;
  subgrupo: string;
  modalidade: string;
  tarifa_energia: number;
  tarifa_tusd: number;
  tarifa_total: number;
  vigencia_inicio: string;
  vigencia_fim: string;
}

export interface EstadoInfo {
  sigla: string;
  nome: string;
  regiao: string;
}

const ESTADOS_BRASIL: EstadoInfo[] = [
  { sigla: 'AC', nome: 'Acre', regiao: 'Norte' },
  { sigla: 'AL', nome: 'Alagoas', regiao: 'Nordeste' },
  { sigla: 'AP', nome: 'Amapá', regiao: 'Norte' },
  { sigla: 'AM', nome: 'Amazonas', regiao: 'Norte' },
  { sigla: 'BA', nome: 'Bahia', regiao: 'Nordeste' },
  { sigla: 'CE', nome: 'Ceará', regiao: 'Nordeste' },
  { sigla: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste' },
  { sigla: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste' },
  { sigla: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste' },
  { sigla: 'MA', nome: 'Maranhão', regiao: 'Nordeste' },
  { sigla: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste' },
  { sigla: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste' },
  { sigla: 'PA', nome: 'Pará', regiao: 'Norte' },
  { sigla: 'PB', nome: 'Paraíba', regiao: 'Nordeste' },
  { sigla: 'PR', nome: 'Paraná', regiao: 'Sul' },
  { sigla: 'PE', nome: 'Pernambuco', regiao: 'Nordeste' },
  { sigla: 'PI', nome: 'Piauí', regiao: 'Nordeste' },
  { sigla: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste' },
  { sigla: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste' },
  { sigla: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul' },
  { sigla: 'RO', nome: 'Rondônia', regiao: 'Norte' },
  { sigla: 'RR', nome: 'Roraima', regiao: 'Norte' },
  { sigla: 'SC', nome: 'Santa Catarina', regiao: 'Sul' },
  { sigla: 'SP', nome: 'São Paulo', regiao: 'Sudeste' },
  { sigla: 'SE', nome: 'Sergipe', regiao: 'Nordeste' },
  { sigla: 'TO', nome: 'Tocantins', regiao: 'Norte' }
];

// Mapeamento de distribuidoras conhecidas por estado
const DISTRIBUIDORAS_POR_ESTADO: { [key: string]: { nome: string; sigla: string; tarifa_estimada: number }[] } = {
  'SP': [
    { nome: 'Enel Distribuição São Paulo', sigla: 'ENEL-SP', tarifa_estimada: 0.795 },
    { nome: 'CPFL Paulista', sigla: 'CPFL', tarifa_estimada: 0.782 },
    { nome: 'Elektro', sigla: 'EKT', tarifa_estimada: 0.801 },
    { nome: 'CPFL Piratininga', sigla: 'CPFL-PIR', tarifa_estimada: 0.789 }
  ],
  'RJ': [
    { nome: 'Light SESA', sigla: 'LIGHT', tarifa_estimada: 0.823 },
    { nome: 'Enel Distribuição Rio', sigla: 'ENEL-RJ', tarifa_estimada: 0.815 }
  ],
  'MG': [
    { nome: 'CEMIG Distribuição', sigla: 'CEMIG-D', tarifa_estimada: 0.756 },
    { nome: 'CPFL Santa Cruz', sigla: 'CPFL-SC', tarifa_estimada: 0.768 }
  ],
  'RS': [
    { nome: 'RGE Sul', sigla: 'RGE', tarifa_estimada: 0.734 },
    { nome: 'CEEE Distribuição', sigla: 'CEEE-D', tarifa_estimada: 0.741 }
  ],
  'PR': [
    { nome: 'Copel Distribuição', sigla: 'COPEL-DIS', tarifa_estimada: 0.698 }
  ],
  'SC': [
    { nome: 'CELESC Distribuição', sigla: 'CELESC-DIS', tarifa_estimada: 0.712 }
  ],
  'BA': [
    { nome: 'Neoenergia Coelba', sigla: 'COELBA', tarifa_estimada: 0.687 }
  ],
  'PE': [
    { nome: 'Neoenergia Pernambuco', sigla: 'CELPE', tarifa_estimada: 0.692 }
  ],
  'CE': [
    { nome: 'Enel Distribuição Ceará', sigla: 'ENEL-CE', tarifa_estimada: 0.678 }
  ],
  'GO': [
    { nome: 'Enel Distribuição Goiás', sigla: 'ENEL-GO', tarifa_estimada: 0.721 }
  ],
  'DF': [
    { nome: 'Neoenergia Brasília', sigla: 'CEB-DIS', tarifa_estimada: 0.745 }
  ]
};

export const useTariffAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para buscar tarifas da ANEEL usando o parser otimizado
  const fetchANEELTariffs = useCallback(async (estado?: string, limit?: number): Promise<DistribuidoraANEEL[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar o parser otimizado em vez de processar 25k registros
      const distribuidorasResidenciais = await loadTariffData(estado, limit);
      
      // Converter para formato compatível
      const tarifasANEEL: DistribuidoraANEEL[] = distribuidorasResidenciais.map(dist => ({
        nome: dist.nome,
        sigla: dist.sigla,
        estado: dist.estado,
        classe: 'Residencial',
        subgrupo: 'B1',
        modalidade: 'Convencional',
        tarifa_energia: TariffParser.convertMWhToKWh(dist.vlrTE),
         tarifa_tusd: TariffParser.convertMWhToKWh(dist.vlrTUSD),
         tarifa_total: TariffParser.convertMWhToKWh(dist.vlrTotal),
         vigencia_inicio: dist.vigenciaInicio,
         vigencia_fim: dist.vigenciaFim
      }));
      
      return tarifasANEEL;
    } catch (err) {
      const errorMessage = 'Erro ao buscar tarifas da ANEEL';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);



  // Función para obtener todas las distribuidoras de un estado
  const getAllDistribuidorasEstado = useCallback(async (estado: string): Promise<DistribuidoraANEEL[]> => {
    return fetchANEELTariffs(estado, 20000);
  }, [fetchANEELTariffs]);

  // Função para buscar tarifas reais da ANEEL (implementação futura)
  const fetchRealANEELTariffs = useCallback(async (estado: string): Promise<DistribuidoraANEEL[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        'https://dadosabertos.aneel.gov.br/dataset/5a583f3e-1646-4f67-bf0f-69db4203e89e/resource/fcf2906c-7c32-4b9b-a637-054e7a5234f4/download/tarifas-homologadas-distribuidoras-energia-eletrica.csv',
        {
          method: 'GET',
          headers: {
            'Accept': 'text/csv',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const csvText = await response.text();
      const parsedData = parseCSVToDistribuidoras(csvText, estado);
      
      return parsedData;
    } catch (err) {
      console.error('Erro ao buscar dados reais da ANEEL:', err);
      // Fallback para dados simulados
      return await fetchANEELTariffs(estado);
    } finally {
      setLoading(false);
    }
  }, [fetchANEELTariffs]);

  // Parser para CSV da ANEEL
  const parseCSVToDistribuidoras = (csvText: string, estado: string): DistribuidoraANEEL[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
    const data: DistribuidoraANEEL[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= headers.length) {
        // Mapear colunas do CSV para nossa estrutura
        const distribuidora: DistribuidoraANEEL = {
          nome: values[0] || '',
          sigla: values[1] || '',
          estado: values[2] || '',
          classe: values[3] || 'Residencial',
          subgrupo: values[4] || 'B1',
          modalidade: values[5] || 'Convencional',
          tarifa_energia: parseFloat(values[6]?.replace(',', '.')) || 0,
          tarifa_tusd: parseFloat(values[7]?.replace(',', '.')) || 0,
          tarifa_total: parseFloat(values[8]?.replace(',', '.')) || 0,
          vigencia_inicio: values[9] || '',
          vigencia_fim: values[10] || ''
        };
        
        // Filtrar por estado e classe residencial
        if (distribuidora.estado === estado && 
            distribuidora.classe.toLowerCase().includes('residencial')) {
          data.push(distribuidora);
        }
      }
    }
    
    return data;
  };

  // Converter distribuidora ANEEL para configuração de tarifa
  const convertToTariffConfig = (distribuidora: DistribuidoraANEEL): Partial<TariffConfig> => {
    return {
      pricePerKwh: distribuidora.tarifa_total,
      additionalFees: 41.12, // Valor padrão, pode ser ajustado
      publicLightingFee: 0,  // Valor padrão, pode ser ajustado
    };
  };

  // Obter informações do estado
  const getEstadoInfo = (sigla: string): EstadoInfo | undefined => {
    return ESTADOS_BRASIL.find(estado => estado.sigla === sigla);
  };

  // Obter todos os estados
  const getAllEstados = (): EstadoInfo[] => {
    return ESTADOS_BRASIL;
  };

  // Obter estados disponíveis no parser
  const getAvailableStates = useCallback((): string[] => {
    return TariffParser.getEstadosDisponiveis();
  }, []);

  // Obter distribuidora mais barata por estado
  const getCheapestDistribuidora = useCallback(async (estado: string): Promise<DistribuidoraANEEL | null> => {
    try {
      const distribuidoras = await fetchANEELTariffs(estado);
      if (distribuidoras.length === 0) return null;
      
      return distribuidoras.reduce((cheapest, current) => 
        current.tarifa_total < cheapest.tarifa_total ? current : cheapest
      );
    } catch (error) {
      console.error('Erro ao buscar distribuidora mais barata:', error);
      return null;
    }
  }, [fetchANEELTariffs]);

  // Validar tarifa
  const validateTariff = (tariff: TariffConfig): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (tariff.pricePerKwh < 0.1 || tariff.pricePerKwh > 2.0) {
      errors.push('Tarifa por kWh deve estar entre R$ 0,10 e R$ 2,00');
    }
    
    if ((tariff.additionalFees || 0) < 0 || (tariff.additionalFees || 0) > 200) {
      errors.push('Taxas adicionais devem estar entre R$ 0,00 e R$ 200,00');
    }
    
    if ((tariff.publicLightingFee || 0) < 0 || (tariff.publicLightingFee || 0) > 100) {
      errors.push('Taxa de iluminação deve estar entre R$ 0,00 e R$ 100,00');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Calcular custo estimado
  const calculateEstimatedCost = (tariff: TariffConfig, kwh: number = 100): number => {
    return (tariff.pricePerKwh * kwh) + (tariff.additionalFees || 0) + (tariff.publicLightingFee || 0);
  };

  return {
    loading,
    error,
    fetchANEELTariffs,
    getAllDistribuidorasEstado,
    fetchRealANEELTariffs,
    convertToTariffConfig,
    getEstadoInfo,
    getAllEstados,
    getAvailableStates,
    getCheapestDistribuidora,
    validateTariff,
    calculateEstimatedCost,
    DISTRIBUIDORAS_POR_ESTADO
  };
};

export default useTariffAPI;