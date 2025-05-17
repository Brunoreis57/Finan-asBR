import { useState, useEffect } from 'react';
import { Plus, X, Trash, ChevronRight, ChevronLeft } from 'lucide-react';
import { WorkoutType } from '../../utils/workoutUtils';
import { TreinoProcessado } from '../../utils/workoutAI';
import TreinoTextoLivreInput from './TreinoTextoLivreInput';

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (workout: any) => void;
  workoutType: WorkoutType;
  onChangeType: (type: WorkoutType) => void;
}

function AddWorkoutModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  workoutType, 
  onChangeType 
}: AddWorkoutModalProps) {
  // Common fields
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  
  // Running specific fields
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [pace, setPace] = useState('');
  const [intensity, setIntensity] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // Gym specific fields
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([{ 
    name: '', 
    sets: '', 
    reps: '', 
    weight: '' 
  }]);
  
  // Texto livre
  const [usingTextInput, setUsingTextInput] = useState(false);
  const [processedData, setProcessedData] = useState<TreinoProcessado | null>(null);
  const [textoLivre, setTextoLivre] = useState('');
  
  // Reset form when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      
      // Reset running fields
      setDistance('');
      setTime('');
      setPace('');
      setIntensity('medium');
      
      // Reset gym fields
      setWorkoutName('');
      setExercises([{ name: '', sets: '', reps: '', weight: '' }]);
      
      // Reset text input
      setUsingTextInput(false);
      setProcessedData(null);
      setTextoLivre('');
    }
  }, [isOpen, workoutType]);
  
  // Calculate pace when distance or time changes
  useEffect(() => {
    if (distance && time) {
      const paceVal = parseFloat(time) / parseFloat(distance);
      if (!isNaN(paceVal)) {
        setPace(paceVal.toFixed(2));
      }
    }
  }, [distance, time]);
  
  // Preencher campos a partir dos dados processados do texto livre
  useEffect(() => {
    if (!processedData) return;
    
    if (processedData.tipo === 'corrida' && workoutType === 'running') {
      if (processedData.distancia_km) setDistance(processedData.distancia_km.toString());
      if (processedData.tempo_total_min) setTime(processedData.tempo_total_min.toString());
      
      // Calcular ritmo se temos distância e tempo
      if (processedData.distancia_km && processedData.tempo_total_min) {
        const paceVal = processedData.tempo_total_min / processedData.distancia_km;
        setPace(paceVal.toFixed(2));
      }
      
      // Detectar intensidade a partir dos tiros, se existirem
      if (processedData.tiros && processedData.tiros.length > 0) {
        const intensidadeTiro = processedData.tiros[0].intensidade.toLowerCase();
        if (intensidadeTiro.includes('leve') || intensidadeTiro.includes('suave')) setIntensity('easy');
        else if (intensidadeTiro.includes('forte') || intensidadeTiro.includes('intens')) setIntensity('hard');
        else setIntensity('medium');
      }
      
      // Se tiver descrição no texto, usar como notas
      if (textoLivre) setNotes(textoLivre);
    }
    else if (processedData.tipo === 'academia' && workoutType === 'gym') {
      setWorkoutName('Treino de Academia');
      
      if (processedData.exercicios && processedData.exercicios.length > 0) {
        const newExercises = processedData.exercicios.map(ex => ({
          name: ex.nome,
          sets: ex.series.toString(),
          reps: ex.reps.toString(),
          weight: ex.peso_kg ? ex.peso_kg.toString() : ''
        }));
        
        setExercises(newExercises);
      }
      
      // Se tiver descrição no texto, usar como notas
      if (textoLivre) setNotes(textoLivre);
    }
  }, [processedData, workoutType]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (workoutType === 'running') {
      if (!distance || !time || !date) {
        return; // Form validation
      }
      
      onAdd({
        type: 'running',
        distance: parseFloat(distance),
        time: parseFloat(time),
        pace: parseFloat(pace),
        intensity,
        date,
        notes: notes || undefined,
        textoOriginal: usingTextInput ? textoLivre : undefined,
        dadosProcessados: usingTextInput ? processedData : undefined
      });
    } else {
      if (!workoutName || !date || !exercises.length) {
        return; // Form validation
      }
      
      // Validate exercises
      const validExercises = exercises.filter(
        ex => ex.name && ex.sets && ex.reps
      );
      
      if (validExercises.length === 0) {
        return; // At least one valid exercise required
      }
      
      onAdd({
        type: 'gym',
        name: workoutName,
        exercises: validExercises.map(ex => ({
          name: ex.name,
          sets: parseInt(ex.sets),
          reps: parseInt(ex.reps),
          weight: ex.weight ? parseFloat(ex.weight) : undefined,
        })),
        date,
        notes: notes || undefined,
        textoOriginal: usingTextInput ? textoLivre : undefined,
        dadosProcessados: usingTextInput ? processedData : undefined
      });
    }
  };
  
  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }]);
  };
  
  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };
  
  const updateExercise = (index: number, field: string, value: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setExercises(updatedExercises);
  };
  
  const handleParsedDataChange = (data: TreinoProcessado | null) => {
    setProcessedData(data);
    if (data) {
      if (data.tipo === 'corrida' && workoutType !== 'running') {
        onChangeType('running');
      } else if (data.tipo === 'academia' && workoutType !== 'gym') {
        onChangeType('gym');
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {workoutType === 'running' ? 'Adicionar Corrida' : 'Adicionar Treino de Academia'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Workout Type Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-medium ${
              workoutType === 'running'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onChangeType('running')}
          >
            Corrida
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-medium ${
              workoutType === 'gym'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onChangeType('gym')}
          >
            Academia
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Input Mode Switch */}
          <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-100 dark:border-primary-900">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                Modo de entrada de dados
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Escolha como deseja adicionar seu treino.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                className={`p-3 flex flex-col items-center justify-center rounded-lg border ${!usingTextInput 
                  ? 'bg-primary-100 dark:bg-primary-800 border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-300' 
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setUsingTextInput(false)}
              >
                <span className="font-medium">Formulário detalhado</span>
                <span className="text-xs mt-1 text-center">Preencha os campos manualmente</span>
              </button>
              <button 
                type="button"
                className={`p-3 flex flex-col items-center justify-center rounded-lg border ${usingTextInput 
                  ? 'bg-primary-100 dark:bg-primary-800 border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-300' 
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setUsingTextInput(true)}
              >
                <span className="font-medium">Texto livre</span>
                <span className="text-xs mt-1 text-center">Cole ou escreva uma descrição do treino</span>
              </button>
            </div>
          </div>
          
          {/* Date Field (sempre presente) */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="input"
            />
          </div>
          
          {usingTextInput ? (
            <TreinoTextoLivreInput 
              tipo={workoutType} 
              onParsedDataChange={handleParsedDataChange}
              initialValue={textoLivre}
            />
          ) : workoutType === 'running' ? (
            <>
              {/* Running Fields */}
              <div className="mb-4">
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Distância (km)
                </label>
                <input
                  type="number"
                  id="distance"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                  className="input"
                  placeholder="5.0"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tempo (minutos)
                </label>
                <input
                  type="number"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  min="0"
                  required
                  className="input"
                  placeholder="30"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="pace" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ritmo (min/km)
                </label>
                <input
                  type="number"
                  id="pace"
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  step="0.01"
                  min="0"
                  readOnly
                  className="input bg-gray-50 dark:bg-gray-700"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Intensidade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className={`p-2 rounded-md ${
                      intensity === 'easy'
                        ? 'bg-green-100 border-2 border-green-500 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                    }`}
                    onClick={() => setIntensity('easy')}
                  >
                    Leve
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded-md ${
                      intensity === 'medium'
                        ? 'bg-yellow-100 border-2 border-yellow-500 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                    }`}
                    onClick={() => setIntensity('medium')}
                  >
                    Moderado
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded-md ${
                      intensity === 'hard'
                        ? 'bg-red-100 border-2 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                    }`}
                    onClick={() => setIntensity('hard')}
                  >
                    Intenso
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Gym Fields */}
              <div className="mb-4">
                <label htmlFor="workout-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Treino
                </label>
                <input
                  type="text"
                  id="workout-name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  required
                  className="input"
                  placeholder="Treino de perna, Superior, etc."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exercícios
                </label>
                
                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Exercício {index + 1}
                        </span>
                        
                        {exercises.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExercise(index)}
                            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="mb-2">
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(index, 'name', e.target.value)}
                          className="input"
                          placeholder="Nome do Exercício"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                            className="input"
                            placeholder="Séries"
                            min="1"
                            required
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Séries</span>
                        </div>
                        
                        <div>
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                            className="input"
                            placeholder="Repetições"
                            min="1"
                            required
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Repetições</span>
                        </div>
                        
                        <div>
                          <input
                            type="number"
                            value={exercise.weight}
                            onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                            className="input"
                            placeholder="Peso (kg)"
                            min="0"
                            step="0.5"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Peso (kg)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addExercise}
                  className="mt-2 w-full py-2 flex items-center justify-center text-sm text-primary-600 dark:text-primary-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Exercício
                </button>
              </div>
            </>
          )}
          
          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações (Opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input h-20"
              placeholder="Como foi o treino? Alguma conquista?"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Salvar Treino
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWorkoutModal;