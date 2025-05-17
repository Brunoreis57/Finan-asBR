import { useState } from 'react';
import { Calendar, Timer, MoreHorizontal, Trash, BarChart3, Dumbbell, Flame as Flames, Footprints, MessageSquareText } from 'lucide-react';
import { Workout, deleteWorkout } from '../../utils/workoutUtils';

interface WorkoutItemProps {
  workout: Workout;
}

function WorkoutItem({ workout }: WorkoutItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showOriginalText, setShowOriginalText] = useState(false);
  
  const formattedDate = new Date(workout.date).toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este treino?')) {
      try {
        const success = deleteWorkout(workout.id);
        if (success) {
          // Mostrar uma mensagem de feedback breve
          const messageElement = document.createElement('div');
          messageElement.className = 'fixed top-4 right-4 bg-green-100 border border-green-300 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300 p-3 rounded-md z-50';
          messageElement.textContent = 'Treino excluído com sucesso';
          document.body.appendChild(messageElement);
          
          // Remover o elemento após 3 segundos
          setTimeout(() => {
            document.body.removeChild(messageElement);
          }, 3000);
          
          // Recarregar a página após uma pequena pausa
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          console.error('Não foi possível excluir o treino');
          alert('Não foi possível excluir o treino. Tente novamente mais tarde.');
        }
      } catch (error) {
        console.error('Erro ao excluir treino:', error);
        alert('Ocorreu um erro ao excluir o treino. Tente novamente mais tarde.');
      }
    }
  };
  
  // Running workout
  if (workout.type === 'running') {
    return (
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
        <div className="sm:flex sm:items-start">
          <div className="mb-3 sm:mb-0 sm:mr-4 flex-shrink-0">
            <div className="h-12 w-12 rounded-md bg-primary-100 dark:bg-primary-900/30 flex flex-col items-center justify-center text-primary-700 dark:text-primary-400">
              <Footprints className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                {workout.distance} km Corrida
              </h3>
              <div className="ml-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedDate}
              </div>
              
              {workout.textoOriginal && (
                <button 
                  onClick={() => setShowOriginalText(!showOriginalText)}
                  className={`ml-2 flex items-center text-xs ${
                    showOriginalText ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                  title="Ver descrição original"
                >
                  <MessageSquareText className="h-3 w-3 mr-1" />
                  Texto
                </button>
              )}
            </div>
            
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Timer className="h-4 w-4 mr-1" />
                <span>{workout.time} min</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span>{workout.pace} min/km</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Flames className="h-4 w-4 mr-1" />
                <span>
                  {workout.intensity === 'easy' ? 'Leve' : 
                   workout.intensity === 'medium' ? 'Moderado' : 'Intenso'}
                </span>
              </div>
            </div>
            
            {/* Mostrar tiros/sprints se disponíveis nos dados processados */}
            {workout.dadosProcessados?.tipo === 'corrida' && workout.dadosProcessados.tiros && workout.dadosProcessados.tiros.length > 0 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Tiros:</span>{' '}
                {workout.dadosProcessados.tiros.map((tiro, index) => (
                  <span key={index}>
                    {tiro.repeticoes}x {tiro.distancia}m
                    {tiro.descanso_min ? ` (descanso ${tiro.descanso_min}min)` : ''}
                    {index < workout.dadosProcessados.tiros.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
            
            {/* Texto original */}
            {showOriginalText && workout.textoOriginal && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-1">Descrição original:</p>
                <p>{workout.textoOriginal}</p>
              </div>
            )}
            
            {workout.notes && !showOriginalText && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {workout.notes}
              </p>
            )}
          </div>
          
          <div className="mt-3 sm:mt-0 relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Gym workout
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
      <div className="sm:flex sm:items-start">
        <div className="mb-3 sm:mb-0 sm:mr-4 flex-shrink-0">
          <div className="h-12 w-12 rounded-md bg-secondary-100 dark:bg-secondary-900/30 flex flex-col items-center justify-center text-secondary-700 dark:text-secondary-400">
            <Dumbbell className="h-6 w-6" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              {workout.name}
            </h3>
            <div className="ml-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {formattedDate}
            </div>
            
            {workout.textoOriginal && (
              <button 
                onClick={() => setShowOriginalText(!showOriginalText)}
                className={`ml-2 flex items-center text-xs ${
                  showOriginalText ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                }`}
                title="Ver descrição original"
              >
                <MessageSquareText className="h-3 w-3 mr-1" />
                Texto
              </button>
            )}
          </div>
          
          {/* Texto original */}
          {showOriginalText && workout.textoOriginal && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-1">Descrição original:</p>
              <p>{workout.textoOriginal}</p>
            </div>
          )}
          
          {!showOriginalText && (
            <>
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercícios:</h4>
                <div className="space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        {exercise.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {exercise.sets} séries × {exercise.reps} repetições
                        {exercise.weight && ` • ${exercise.weight} kg`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {workout.notes && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {workout.notes}
                </p>
              )}
            </>
          )}
        </div>
        
        <div className="mt-3 sm:mt-0 relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <Trash className="h-4 w-4 mr-2" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutItem;