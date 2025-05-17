import { WorkoutType } from './workoutUtils';

interface TreinoCorrida {
  tipo: 'corrida';
  distancia_km?: number;
  tempo_total_min?: number;
  ritmo_medio?: string;
  calorias?: number;
  tiros?: {
    distancia: number;
    intensidade: string;
    descanso_min?: number;
    repeticoes: number;
  }[];
}

interface TreinoAcademia {
  tipo: 'academia';
  exercicios: {
    nome: string;
    series: number;
    reps: number;
    peso_kg?: number;
  }[];
}

export type TreinoProcessado = TreinoCorrida | TreinoAcademia;

// Função que simula um processamento de IA para extrair dados estruturados de texto
export function parseTreinoTextoLivre(texto: string, tipo: WorkoutType): TreinoProcessado | null {
  if (!texto.trim()) return null;
  
  // Processar texto de corrida
  if (tipo === 'running') {
    const treinoCorrida: TreinoCorrida = { tipo: 'corrida' };
    
    // Procurar por distância (padrão: Números seguidos de km, Km ou quilômetros)
    const distanciaMatch = texto.match(/(\d+[.,]?\d*)\s*(km|quilômetros|quilometros)/i);
    if (distanciaMatch) {
      treinoCorrida.distancia_km = parseFloat(distanciaMatch[1].replace(',', '.'));
    }
    
    // Procurar por tempo total (padrão: Números seguidos de min, minutos, ou h:mm)
    const tempoTotalMatch = texto.match(/(\d+[.,]?\d*)\s*(min|minutos)/i) || 
                          texto.match(/(\d+):(\d{2})/);
    if (tempoTotalMatch) {
      if (tempoTotalMatch[2] === 'min' || tempoTotalMatch[2] === 'minutos') {
        treinoCorrida.tempo_total_min = parseFloat(tempoTotalMatch[1].replace(',', '.'));
      } else {
        // Formato h:mm
        treinoCorrida.tempo_total_min = parseInt(tempoTotalMatch[1]) * 60 + parseInt(tempoTotalMatch[2]);
      }
    }
    
    // Procurar por ritmo médio (padrão: números:números/km)
    const ritmoMatch = texto.match(/(\d+):(\d{2})\/km/);
    if (ritmoMatch) {
      treinoCorrida.ritmo_medio = `${ritmoMatch[1]}:${ritmoMatch[2]}/km`;
    } else if (treinoCorrida.distancia_km && treinoCorrida.tempo_total_min) {
      // Calcular ritmo se temos distância e tempo
      const ritmoMinutos = treinoCorrida.tempo_total_min / treinoCorrida.distancia_km;
      const ritmoMin = Math.floor(ritmoMinutos);
      const ritmoSec = Math.round((ritmoMinutos - ritmoMin) * 60);
      treinoCorrida.ritmo_medio = `${ritmoMin}:${ritmoSec.toString().padStart(2, '0')}/km`;
    }
    
    // Procurar por tiros (repetições de alta intensidade)
    const tirosMatch = texto.match(/(\d+)\s*(?:tiros|sprints|repetições|repeticoes)\s*(?:de)?\s*(\d+)(?:m|metros)/i);
    const descansoMatch = texto.match(/(?:com|de)\s*(\d+)\s*(?:min|minutos|segundos|s)\s*(?:de)?\s*(?:descanso|intervalo|pausa)/i);
    
    if (tirosMatch) {
      const repeticoes = parseInt(tirosMatch[1]);
      const distancia = parseInt(tirosMatch[2]);
      
      // Tenta detectar intensidade a partir do texto
      let intensidade = 'forte';
      if (texto.match(/leve|suave|baixa/i)) intensidade = 'leve';
      else if (texto.match(/moderado|medio|média/i)) intensidade = 'moderado';
      else if (texto.match(/forte|intenso|alta|máxima|maxima/i)) intensidade = 'forte';
      
      const tiro = {
        distancia,
        intensidade,
        repeticoes
      };
      
      // Adicionar tempo de descanso se encontrado
      if (descansoMatch) {
        const descansoValue = parseInt(descansoMatch[1]);
        const unidade = descansoMatch[2]?.toLowerCase();
        if (unidade === 's' || unidade === 'segundos') {
          tiro.descanso_min = descansoValue / 60; // Converter segundos para minutos
        } else {
          tiro.descanso_min = descansoValue;
        }
      }
      
      treinoCorrida.tiros = [tiro];
    }
    
    return treinoCorrida;
  } 
  // Processar texto de academia
  else if (tipo === 'gym') {
    const treinoAcademia: TreinoAcademia = { 
      tipo: 'academia',
      exercicios: [] 
    };
    
    // Dividir o texto em partes que podem representar exercícios individuais
    // Padrões comuns: "nome do exercício XxY com Z kg" ou "nome do exercício séries x repetições"
    const linhas = texto.split(/[,;.]/).filter(l => l.trim());
    
    for (const linha of linhas) {
      // Procurar por padrões como "3x10", "3 x 10", "3 séries de 10" etc.
      const seriesRepsMatch = linha.match(/(\d+)\s*(?:x|×|\*|\s+séries\s+de|\s+series\s+de)\s*(\d+)/i);
      
      if (seriesRepsMatch) {
        const series = parseInt(seriesRepsMatch[1]);
        const reps = parseInt(seriesRepsMatch[2]);
        
        // Extrair o nome do exercício (texto antes do padrão de séries/reps)
        const nomeMatch = linha.substring(0, seriesRepsMatch.index).trim();
        
        // Extrair peso (se presente)
        const pesoMatch = linha.match(/(?:com|de)\s*(\d+[.,]?\d*)\s*(?:kg|quilos)/i);
        
        let peso = undefined;
        if (pesoMatch) {
          peso = parseFloat(pesoMatch[1].replace(',', '.'));
        }
        
        // Tentar normalizar nomes de exercícios comuns
        let nome = nomeMatch;
        
        // Mapeamento de termos coloquiais para nomes padronizados
        const mapeamentoExercicios: {[key: string]: string} = {
          'supino': 'Supino reto',
          'supino reto': 'Supino reto',
          'leg': 'Leg press',
          'leg press': 'Leg press',
          'agachamento': 'Agachamento',
          'rosca': 'Rosca direta',
          'rosca direta': 'Rosca direta',
          'crucifixo': 'Crucifixo',
          'desenvolvimento': 'Desenvolvimento de ombros',
          'pulley': 'Puxada no pulley',
          'abdominais': 'Abdominal',
          'abdominal': 'Abdominal',
          'panturrilha': 'Elevação de panturrilha',
          'barra': 'Levantamento terra',
          'terra': 'Levantamento terra',
          'flexão': 'Flexão de braço',
          'extensão': 'Extensão de pernas',
          'stiff': 'Stiff',
          'remada': 'Remada',
          'bíceps': 'Rosca bíceps',
          'tríceps': 'Extensão de tríceps',
          'voador': 'Crucifixo no voador',
          'cadeira': 'Cadeira extensora',
          'mesa': 'Mesa flexora'
        };
        
        // Normalizar nome do exercício
        for (const [termo, padronizado] of Object.entries(mapeamentoExercicios)) {
          if (nome.toLowerCase().includes(termo.toLowerCase())) {
            nome = padronizado;
            break;
          }
        }
        
        // Adicionar exercício se tiver dados suficientes
        if (nome && series && reps) {
          treinoAcademia.exercicios.push({
            nome,
            series,
            reps,
            peso_kg: peso
          });
        }
      }
    }
    
    // Só retorna se encontrou pelo menos um exercício
    if (treinoAcademia.exercicios.length > 0) {
      return treinoAcademia;
    }
  }
  
  return null;
} 