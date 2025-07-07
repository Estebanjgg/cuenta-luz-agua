import { TariffConfig } from '../types';

// Estructura simplificada para distribuidoras residenciales
export interface DistribuidoraResidencial {
  sigla: string;
  nome: string;
  estado: string;
  cnpj: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  modalidade: string;
  postoTarifario: string;
  vlrTUSD: number; // Valor TUSD en R$/MWh
  vlrTE: number;   // Valor TE en R$/MWh
  vlrTotal: number; // Valor total en R$/MWh
  fonte?: string;
}

// Parser otimizado para dados residenciais do XML da ANEEL
export class TariffParser {
  private static readonly ESTADOS_BRASIL = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Distribuidoras principais por estado (dados simulados baseados em distribuidoras reais)
  public static readonly DISTRIBUIDORAS_PRINCIPAIS: DistribuidoraResidencial[] = [
    // São Paulo
    { sigla: 'ENEL SP', nome: 'Enel Distribuição São Paulo', estado: 'SP', cnpj: '61695227000193', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 280.45, vlrTE: 420.32, vlrTotal: 700.77 },
    { sigla: 'CPFL PAULISTA', nome: 'CPFL Paulista', estado: 'SP', cnpj: '02998611000104', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 275.20, vlrTE: 415.80, vlrTotal: 691.00 },
    { sigla: 'ENERGISA SUL-SUDESTE', nome: 'Energisa Sul-Sudeste - Distribuidora de Energia S.A.', estado: 'SP', cnpj: '07282377000120', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 350.00, vlrTE: 445.53, vlrTotal: 795.53 },
    { sigla: 'ELETROPAULO', nome: 'Eletropaulo Metropolitana', estado: 'SP', cnpj: '61695227000193', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 285.60, vlrTE: 425.40, vlrTotal: 711.00 },
    
    // Rio de Janeiro
    { sigla: 'LIGHT', nome: 'Light Serviços de Eletricidade', estado: 'RJ', cnpj: '04336050000108', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 290.15, vlrTE: 430.85, vlrTotal: 721.00 },
    { sigla: 'ENEL RJ', nome: 'Enel Distribuição Rio', estado: 'RJ', cnpj: '78570769000176', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 285.30, vlrTE: 425.70, vlrTotal: 711.00 },
    
    // Minas Gerais
    { sigla: 'CEMIG', nome: 'Cemig Distribuição', estado: 'MG', cnpj: '06981180000116', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 270.80, vlrTE: 410.20, vlrTotal: 681.00 },
    
    // Rio Grande do Sul
    { sigla: 'RGE', nome: 'Rio Grande Energia', estado: 'RS', cnpj: '02016440000162', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 265.40, vlrTE: 405.60, vlrTotal: 671.00 },
    
    // Paraná
    { sigla: 'COPEL', nome: 'Copel Distribuição', estado: 'PR', cnpj: '04995199000198', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 260.20, vlrTE: 400.80, vlrTotal: 661.00 },
    
    // Bahia
    { sigla: 'COELBA', nome: 'Coelba', estado: 'BA', cnpj: '15139629000159', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 295.60, vlrTE: 435.40, vlrTotal: 731.00 },
    
    // Ceará
    { sigla: 'ENEL CE', nome: 'Enel Distribuição Ceará', estado: 'CE', cnpj: '07437908000119', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 300.20, vlrTE: 440.80, vlrTotal: 741.00 },
    
    // Pernambuco
    { sigla: 'NEOENERGIA PE', nome: 'Neoenergia Pernambuco', estado: 'PE', cnpj: '10835932000189', vigenciaInicio: '2024-01-01', vigenciaFim: '2024-12-31', modalidade: 'Convencional', postoTarifario: 'Único', vlrTUSD: 298.40, vlrTE: 438.60, vlrTotal: 737.00 },
  ];

  // Converter valor de R$/MWh para R$/kWh (método público)
  static convertMWhToKWh(valorMWh: number): number {
    return valorMWh / 1000;
  }

  // Obter distribuidoras por estado
  static getDistribuidorasByEstado(estado: string): DistribuidoraResidencial[] {
    return this.DISTRIBUIDORAS_PRINCIPAIS.filter(d => d.estado === estado);
  }

  // Obter todos os estados disponíveis
  static getEstadosDisponiveis(): string[] {
    return this.ESTADOS_BRASIL;
  }

  // Converte dados da distribuidora para TariffConfig
  static convertToTariffConfig(distribuidora: DistribuidoraResidencial): Partial<TariffConfig> {
    const pricePerKwh = this.convertMWhToKWh(distribuidora.vlrTotal);
    
    // Valores específicos para Energisa Sul-Sudeste baseados na factura real
    if (distribuidora.sigla === 'ENERGISA SUL-SUDESTE') {
      return {
        pricePerKwh: pricePerKwh,
        publicLightingFee: 70.00, // R$ 41,12 para 588 kWh = ~R$ 0,07/kWh = 70/1000
        additionalFees: this.calculateAdditionalFees(pricePerKwh),
        taxes: this.calculateTaxes(pricePerKwh),
        calculateCost: this.createEnergisaCalculator()
      };
    }
    
    return {
      pricePerKwh: pricePerKwh,
      publicLightingFee: this.calculatePublicLightingFee(pricePerKwh),
      additionalFees: this.calculateAdditionalFees(pricePerKwh),
      taxes: this.calculateTaxes(pricePerKwh)
    };
  }

  // Calculadora específica para Energisa Sul-Sudeste baseada na factura real
  private static createEnergisaCalculator() {
    return (kwh: number, flagType?: any) => {
      // Valores baseados na factura real de 588 kWh = R$ 542,39
      // Tarifa base: R$ 0,795530 por kWh (R$ 467,77 / 588 kWh)
      const baseCost = kwh * 0.795530;
      
      // Contribuição de iluminação pública: R$ 41,12 fixo mensal
      const publicLighting = 41.12;
      
      // Impostos e taxas (diferença entre total e base + iluminação)
      // R$ 542,39 - R$ 467,77 - R$ 41,12 = R$ 33,50 para 588 kWh
      const taxesAndFees = (kwh / 588) * 33.50;
      
      return Math.round((baseCost + publicLighting + taxesAndFees) * 100) / 100;
    };
  }

  // Calcular taxa de iluminação pública (aproximadamente 3-5% da tarifa)
  private static calculatePublicLightingFee(tarifaKWh: number): number {
    return Math.round((tarifaKWh * 0.04) * 100) / 100; // 4% da tarifa
  }

  // Calcular taxas adicionais (PIS/COFINS, ICMS, etc.)
  private static calculateAdditionalFees(tarifaKWh: number): number {
    // Estimativa de taxas adicionais (bandeiras tarifárias, etc.)
    return Math.round((tarifaKWh * 0.15) * 100) / 100; // 15% da tarifa
  }

  // Calcular impostos inclusos
  private static calculateTaxes(tarifaKWh: number): number {
    // PIS/COFINS (~9.25%) + ICMS (varia por estado, média ~18%)
    return Math.round((tarifaKWh * 0.27) * 100) / 100; // 27% da tarifa
  }

  // Validar se uma distribuidora está vigente
  static isDistribuidoraVigente(distribuidora: DistribuidoraResidencial): boolean {
    const hoje = new Date();
    const inicio = new Date(distribuidora.vigenciaInicio);
    const fim = new Date(distribuidora.vigenciaFim);
    
    return hoje >= inicio && hoje <= fim;
  }

  // Buscar distribuidora por sigla
  static findDistribuidoraBySigla(sigla: string): DistribuidoraResidencial | undefined {
    return this.DISTRIBUIDORAS_PRINCIPAIS.find(d => d.sigla === sigla);
  }

  // Obter distribuidora mais barata por estado
  static getCheapestByEstado(estado: string): DistribuidoraResidencial | undefined {
    const distribuidoras = this.getDistribuidorasByEstado(estado);
    return distribuidoras.reduce((cheapest, current) => 
      current.vlrTotal < cheapest.vlrTotal ? current : cheapest
    );
  }

  // Obter distribuidora mais cara por estado
  static getMostExpensiveByEstado(estado: string): DistribuidoraResidencial | undefined {
    const distribuidoras = this.getDistribuidorasByEstado(estado);
    return distribuidoras.reduce((expensive, current) => 
      current.vlrTotal > expensive.vlrTotal ? current : expensive
    );
  }

  // Método para determinar o estado baseado na distribuidora
  public static determineStateFromDistributor(sigla: string): string {
    const distribuidoraEstadoMap: { [key: string]: string } = {
      'ENEL SP': 'SP', 'CPFL PAULISTA': 'SP', 'ENERGISA SUL-SUDESTE': 'SP', 'ELETROPAULO': 'SP',
      'LIGHT': 'RJ', 'ENEL RJ': 'RJ',
      'CEMIG': 'MG',
      'RGE': 'RS',
      'COPEL': 'PR',
      'COELBA': 'BA',
      'ENEL CE': 'CE',
      'NEOENERGIA PE': 'PE'
    };
    
    return distribuidoraEstadoMap[sigla] || 'SP'; // Default para SP
  }
}

// Configuração da API de ANEEL
const ANEEL_API_BASE = 'https://dadosabertos.aneel.gov.br/api/3/action';
const RESOURCE_ID = 'fcf2906c-7c32-4b9b-a637-054e7a5234f4';

// Interface para a resposta da API de ANEEL
interface ANEELResponse {
  success: boolean;
  result: {
    records: ANEELRecord[];
    total: number;
  };
}

interface ANEELRecord {
  _id: number;
  DatGeracaoConjuntoDados: string;
  DscREH: string;
  SigAgente: string;
  NumCNPJDistribuidora: string;
  DatInicioVigencia: string;
  DatFimVigencia: string;
  DscBaseTarifaria: string;
  DscSubGrupo: string;
  DscModalidadeTarifaria: string;
  DscClasse: string;
  DscSubClasse: string;
  DscDetalhe: string;
  NomPostoTarifario: string;
  DscUnidadeTerciaria: string;
  SigAgenteAcessante: string;
  VlrTUSD: string;
  VlrTE: string;
}

// Función para obtener datos de tarifas residenciales vía proxy del servidor
export const loadTariffData = async (estado?: string, limit?: number): Promise<DistribuidoraResidencial[]> => {
  try {
    console.log('Carregando dados de tarifas da ANEEL via API proxy...');
    
    const response = await fetch('/api/aneel-tariffs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado, limit })
    });
    
    if (!response.ok) {
      console.warn('Error en proxy de ANEEL:', response.status, response.statusText);
      if (estado) {
        return TariffParser.getDistribuidorasByEstado(estado);
      }
      return TariffParser.DISTRIBUIDORAS_PRINCIPAIS;
    }
    
    const data = await response.json();
    
    if (!data.success || !data.distribuidoras.length) {
      console.warn('No se encontraron datos en la respuesta del proxy');
      if (estado) {
        return TariffParser.getDistribuidorasByEstado(estado);
      }
      return TariffParser.DISTRIBUIDORAS_PRINCIPAIS;
    }
    
    console.log(`✅ Cargadas ${data.distribuidoras.length} distribuidoras desde ANEEL`);
    if (data.filtros) {
      console.log('🔍 Filtros aplicados:', data.filtros);
    }
    return data.distribuidoras;
    
  } catch (error) {
    console.error('Error al consultar proxy de ANEEL:', error);
    console.log('🔄 Usando datos locales como fallback');
    
    if (estado) {
      return TariffParser.getDistribuidorasByEstado(estado);
    }
    return TariffParser.DISTRIBUIDORAS_PRINCIPAIS;
  }
};



export default TariffParser;