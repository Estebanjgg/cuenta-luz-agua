import { NextRequest, NextResponse } from 'next/server';

// Configuración de la API de ANEEL
const ANEEL_API_BASE = 'https://dadosabertos.aneel.gov.br/api/3/action';
const RESOURCE_ID = 'fcf2906c-7c32-4b9b-a637-054e7a5234f4';

// Interface para la respuesta de la API de ANEEL
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

interface DistribuidoraResidencial {
  sigla: string;
  nome: string;
  estado: string;
  cnpj: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  modalidade: string;
  postoTarifario: string;
  vlrTUSD: number;
  vlrTE: number;
  vlrTotal: number;
  fonte?: string;
}




// Función para determinar el estado basado en la distribuidora
// Basado en el diccionario de metadatos de ANEEL y cobertura geográfica
function determineStateFromDistributor(distribuidora: string): string {
  const upperDistribuidora = distribuidora.toUpperCase();
  
  // Mapeo de distribuidoras a estados
  const distribuidoraStateMap: { [key: string]: string } = {
    // São Paulo
    'ENEL SP': 'SP',
    'ENEL DISTRIBUICAO SAO PAULO': 'SP',
    'CPFL PAULISTA': 'SP',
    'CPFL PIRATININGA': 'SP',
    'ELEKTRO': 'SP',
    'ELETROPAULO': 'SP',
    'BANDEIRANTE ENERGIA': 'SP',
    'CPFL SANTA CRUZ': 'SP',
    'ENERGISA SUL-SUDESTE': 'SP',
    
    // Rio de Janeiro
    'LIGHT': 'RJ',
    'ENEL RJ': 'RJ',
    'ENEL DISTRIBUICAO RIO': 'RJ',
    'AMPLA': 'RJ',
    
    // Minas Gerais
    'CEMIG': 'MG',
    'CEMIG DISTRIBUICAO': 'MG',
    'ENERGISA MINAS GERAIS': 'MG',
    'LIGHT ESCO': 'MG',
    
    // Rio Grande do Sul
    'RGE': 'RS',
    'CEEE': 'RS',
    'RGE SUL': 'RS',
    'ENERGISA NOVA FRIBURGO': 'RS',
    
    // Paraná
    'COPEL': 'PR',
    'COPEL DISTRIBUICAO': 'PR',
    
    // Santa Catarina
    'CELESC': 'SC',
    'CELESC DISTRIBUICAO': 'SC',
    
    // Bahia
    'COELBA': 'BA',
    'NEOENERGIA COELBA': 'BA',
    
    // Ceará
    'ENEL CE': 'CE',
    'ENEL DISTRIBUICAO CEARA': 'CE',
    
    // Pernambuco
    'CELPE': 'PE',
    'NEOENERGIA PE': 'PE',
    'NEOENERGIA PERNAMBUCO': 'PE',
    
    // Distrito Federal
    'CEB': 'DF',
    'NEOENERGIA BRASILIA': 'DF',
    
    // Goiás
    'ENEL GO': 'GO',
    'ENEL DISTRIBUICAO GOIAS': 'GO',
    'CELG': 'GO',
    
    // Espírito Santo
    'EDP ESCELSA': 'ES',
    'ESCELSA': 'ES',
    
    // Mato Grosso do Sul
    'ENERGISA MS': 'MS',
    'ENERGISA MATO GROSSO DO SUL': 'MS',
    
    // Mato Grosso
    'ENERGISA MT': 'MT',
    'ENERGISA MATO GROSSO': 'MT',
    
    // Paraíba
    'ENERGISA PB': 'PB',
    'ENERGISA PARAIBA': 'PB',
    
    // Sergipe
    'ENERGISA SE': 'SE',
    'ENERGISA SERGIPE': 'SE',
    
    // Rio Grande do Norte
    'COSERN': 'RN',
    'NEOENERGIA COSERN': 'RN',
    
    // Alagoas
    'CEAL': 'AL',
    'NEOENERGIA CEAL': 'AL',
    
    // Amazonas
    'AMAZONAS ENERGIA': 'AM',
    'AME': 'AM',
    
    // Pará
    'CELPA': 'PA',
    'EQUATORIAL PARA': 'PA',
    
    // Maranhão
    'CEMAR': 'MA',
    'EQUATORIAL MARANHAO': 'MA',
    
    // Piauí
    'CEPISA': 'PI',
    'EQUATORIAL PIAUI': 'PI',
    
    // Acre
    'ELETROACRE': 'AC',
    
    // Rondônia
    'CERON': 'RO',
    'ENERGISA RONDONIA': 'RO',
    
    // Roraima
    'RRE': 'RR',
    'RORAIMA ENERGIA': 'RR',
    
    // Amapá
    'CEA': 'AP',
    'COMPANHIA DE ELETRICIDADE DO AMAPA': 'AP',
    
    // Tocantins
    'CELTINS': 'TO',
    'ENERGISA TOCANTINS': 'TO'
  };
  
  // Buscar coincidencia exacta o parcial
  for (const [key, state] of Object.entries(distribuidoraStateMap)) {
    if (upperDistribuidora.includes(key)) {
      return state;
    }
  }
  
  return 'SP'; // Default a São Paulo si no se encuentra
}

export async function POST(request: NextRequest) {
  try {
    const { estado, limit = 10000 } = await request.json();
    
    console.log('Consultando API de ANEEL desde el servidor...', { estado, limit });
    
    // Consultar tarifas residenciales (Grupo B1) con vigencia actual - aumentamos el límite
    const url = `${ANEEL_API_BASE}/datastore_search?resource_id=${RESOURCE_ID}&filters={"DscSubGrupo":"B1","DscClasse":"Residencial"}&limit=${limit}`;
    
    console.log('URL de consulta ANEEL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TariffApp/1.0)'
      }
    });
    
    if (!response.ok) {
      console.warn('Error al obtener datos de ANEEL:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Error al consultar API de ANEEL', distribuidoras: [] },
        { status: 500 }
      );
    }
    
    const data: ANEELResponse = await response.json();
    
    if (!data.success || !data.result.records.length) {
      console.warn('No se encontraron datos en la respuesta de ANEEL');
      return NextResponse.json(
        { error: 'No se encontraron datos', distribuidoras: [] },
        { status: 404 }
      );
    }
    
    // Procesar y convertir los datos de ANEEL
    const distribuidorasMap = new Map<string, DistribuidoraResidencial>();
    const hoje = new Date();
    
    console.log(`Procesando ${data.result.records.length} registros de ANEEL...`);
    
    data.result.records.forEach(record => {
      const sigAgente = record.SigAgente;
      
      // Verificar si la vigencia está activa
      const inicioVigencia = new Date(record.DatInicioVigencia);
      const fimVigencia = new Date(record.DatFimVigencia);
      
      // Solo considerar tarifas con vigencia actual o futura
      if (fimVigencia >= hoje) {
        // Convertir valores de string a número (ANEEL usa vírgula como separador decimal)
        const vlrTUSD = parseFloat(record.VlrTUSD.replace(',', '.')) || 0;
        const vlrTE = parseFloat(record.VlrTE.replace(',', '.')) || 0;
        const tarifaTotal = vlrTUSD + vlrTE;
        
        // Determinar estado baseado no nome da distribuidora
        const estadoDist = determineStateFromDistributor(sigAgente);
        
        // Para obtener más variedad, usar solo la sigla como clave (sin modalidad)
        const key = sigAgente;
        
        if (!distribuidorasMap.has(key) || distribuidorasMap.get(key)!.vlrTotal > tarifaTotal) {
          distribuidorasMap.set(key, {
            sigla: sigAgente,
            nome: sigAgente,
            estado: estadoDist,
            cnpj: record.NumCNPJDistribuidora,
            vigenciaInicio: record.DatInicioVigencia,
            vigenciaFim: record.DatFimVigencia,
            modalidade: record.DscModalidadeTarifaria || 'Convencional',
            postoTarifario: record.NomPostoTarifario || 'Único',
            vlrTUSD: vlrTUSD,
            vlrTE: vlrTE,
            vlrTotal: tarifaTotal,
            fonte: 'ANEEL_API'
          });
        }
      }
    });
    
    console.log(`Mapeadas ${distribuidorasMap.size} distribuidoras únicas`);
    
    let distribuidorasFromAPI = Array.from(distribuidorasMap.values());
    
    // Filtrar por estado si se especifica
    if (estado) {
      distribuidorasFromAPI = distribuidorasFromAPI.filter(d => d.estado === estado);
    }
    
    // Ordenar por tarifa más baja
    distribuidorasFromAPI.sort((a, b) => a.vlrTotal - b.vlrTotal);
    
    console.log(`Procesadas ${distribuidorasFromAPI.length} distribuidoras desde ANEEL`);
    
    return NextResponse.json({
      success: true,
      distribuidoras: distribuidorasFromAPI,
      total: distribuidorasFromAPI.length,
      fonte: 'ANEEL_API',
      filtros: { estado }
    });
    
  } catch (error) {
    console.error('Error en la API proxy de ANEEL:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        distribuidoras: [],
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API proxy para datos de ANEEL. Use POST con parámetros.',
    endpoints: {
      POST: '/api/aneel-tariffs',
      parameters: {
        estado: 'string (opcional) - Filtrar por estado (SP, RJ, MG, etc.)'
      }
    }
  });
}