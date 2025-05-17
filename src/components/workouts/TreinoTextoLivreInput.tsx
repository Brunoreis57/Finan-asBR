import { useState, useEffect } from 'react';
import { parseTreinoTextoLivre, TreinoProcessado } from '../../utils/workoutAI';
import { WorkoutType } from '../../utils/workoutUtils';
import { CheckCircle, RefreshCw, AlertCircle, Code, Clipboard } from 'lucide-react';

interface TreinoTextoLivreInputProps {
  tipo: WorkoutType;
  onParsedDataChange: (data: TreinoProcessado | null) => void;
  initialValue?: string;
}

function TreinoTextoLivreInput({ tipo, onParsedDataChange, initialValue = '' }: TreinoTextoLivreInputProps) {
  const [texto, setTexto] = useState(initialValue);
  const [dadosProcessados, setDadosProcessados] = useState<TreinoProcessado | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingParsed, setEditingParsed] = useState(false);
  const [parsedJson, setParsedJson] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Processar texto quando o usuário terminar de digitar
  useEffect(() => {
    if (!texto.trim()) {
      setDadosProcessados(null);
      onParsedDataChange(null);
      return;
    }
    
    const timer = setTimeout(() => {
      if (texto.trim().length > 10) {
        processarTexto();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [texto]);

  // Processar texto com a função de IA
  const processarTexto = () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      const resultado = parseTreinoTextoLivre(texto, tipo);
      setDadosProcessados(resultado);
      setParsedJson(resultado ? JSON.stringify(resultado, null, 2) : '');
      onParsedDataChange(resultado);
    } catch (error) {
      console.error('Erro ao processar texto:', error);
      setErrorMessage('Não foi possível interpretar o texto. Por favor, tente descrever o treino com mais detalhes.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Atualizar dados quando o JSON editado for alterado
  const handleSaveJsonEdit = () => {
    try {
      const parsedData = JSON.parse(parsedJson);
      setDadosProcessados(parsedData);
      onParsedDataChange(parsedData);
      setEditingParsed(false);
    } catch (error) {
      setErrorMessage('JSON inválido. Verifique a formatação.');
    }
  };

  // Função para colar texto da área de transferência
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setTexto(clipboardText);
      }
    } catch (error) {
      console.error('Erro ao acessar a área de transferência:', error);
      setErrorMessage('Não foi possível acessar a área de transferência. Por favor, cole o texto manualmente.');
    }
  };
  
  // Formatação de dados para exibição ao usuário
  const formatarExibicaoCorrida = (corrida: TreinoProcessado & { tipo: 'corrida' }) => {
    return (
      <div className="space-y-2">
        {corrida.distancia_km && (
          <div>
            <span className="font-medium">Distância:</span> {corrida.distancia_km} km
          </div>
        )}
        
        {corrida.tempo_total_min && (
          <div>
            <span className="font-medium">Tempo:</span> {corrida.tempo_total_min} minutos
          </div>
        )}
        
        {corrida.ritmo_medio && (
          <div>
            <span className="font-medium">Ritmo médio:</span> {corrida.ritmo_medio}
          </div>
        )}
        
        {corrida.tiros && corrida.tiros.length > 0 && (
          <div>
            <span className="font-medium">Tiros:</span>
            <ul className="list-disc ml-5">
              {corrida.tiros.map((tiro, index) => (
                <li key={index}>
                  {tiro.repeticoes}x {tiro.distancia}m 
                  {tiro.intensidade && ` (intensidade ${tiro.intensidade})`}
                  {tiro.descanso_min && ` com ${tiro.descanso_min} min de descanso`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  const formatarExibicaoAcademia = (academia: TreinoProcessado & { tipo: 'academia' }) => {
    return (
      <div>
        <span className="font-medium">Exercícios detectados:</span>
        <ul className="list-disc ml-5 mt-1">
          {academia.exercicios.map((exercicio, index) => (
            <li key={index}>
              <span className="font-medium">{exercicio.nome}:</span> {exercicio.series}x{exercicio.reps}
              {exercicio.peso_kg ? ` com ${exercicio.peso_kg}kg` : ''}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="texto-treino" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descreva seu treino em texto livre
          </label>
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="flex items-center text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800"
            title="Colar do clipboard"
          >
            <Clipboard className="h-3 w-3 mr-1" />
            Colar
          </button>
        </div>
        <textarea
          id="texto-treino"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="input h-28 w-full"
          placeholder={tipo === 'running' 
            ? "Ex: Hoje corri 5km em 25 minutos, fiz 4 tiros de 400m com 1min de descanso..." 
            : "Ex: Supino 3x10 com 60kg, agachamento 4x12 com 80kg..."
          }
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Descreva seu treino naturalmente e o sistema tentará interpretar os detalhes.
          </p>
          <button
            type="button"
            onClick={processarTexto}
            className="flex items-center text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Processar
          </button>
        </div>
      </div>
      
      {/* Área de visualização do resultado processado */}
      {(dadosProcessados || isProcessing || errorMessage) && (
        <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              {isProcessing ? 'Processando...' : 'Interpretação do treino'}
            </h3>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={processarTexto}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400"
                title="Reprocessar texto"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => setEditingParsed(!editingParsed)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400"
                title="Editar manualmente"
              >
                <Code className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {isProcessing ? (
            <div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ) : errorMessage ? (
            <div className="flex items-start text-red-500 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          ) : editingParsed ? (
            <div className="space-y-2">
              <textarea
                value={parsedJson}
                onChange={(e) => setParsedJson(e.target.value)}
                className="input font-mono text-xs h-40 w-full"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingParsed(false)}
                  className="btn btn-sm btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveJsonEdit}
                  className="btn btn-sm btn-primary"
                >
                  Aplicar Mudanças
                </button>
              </div>
            </div>
          ) : dadosProcessados ? (
            <div>
              {dadosProcessados.tipo === 'corrida' ? 
                formatarExibicaoCorrida(dadosProcessados as TreinoProcessado & { tipo: 'corrida' }) : 
                formatarExibicaoAcademia(dadosProcessados as TreinoProcessado & { tipo: 'academia' })
              }
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default TreinoTextoLivreInput; 