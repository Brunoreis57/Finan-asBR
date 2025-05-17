import { TreinoProcessado } from './workoutAI';

export type WorkoutType = 'running' | 'gym';

// Common workout fields
interface BaseWorkout {
  id: string;
  type: WorkoutType;
  date: string;
  notes?: string;
  textoOriginal?: string; // Descrição em texto livre fornecida pelo usuário
  dadosProcessados?: TreinoProcessado; // Dados estruturados extraídos do texto
}

// Running-specific fields
interface RunningWorkout extends BaseWorkout {
  type: 'running';
  distance: number;
  time: number;
  pace: number;
  intensity: 'easy' | 'medium' | 'hard';
}

// Gym exercise structure
interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

// Gym-specific fields
interface GymWorkout extends BaseWorkout {
  type: 'gym';
  name: string;
  exercises: Exercise[];
}

// Union type for different workout types
export type Workout = RunningWorkout | GymWorkout;

// Get all workouts
export function getWorkouts(): Workout[] {
  const workouts = localStorage.getItem('workouts');
  return workouts ? JSON.parse(workouts) : [];
}

// Add a new running workout
export function addRunningWorkout(workout: Omit<RunningWorkout, 'id'>): RunningWorkout {
  const workouts = getWorkouts();
  
  const newWorkout: RunningWorkout = {
    ...workout,
    id: crypto.randomUUID(),
  };
  
  workouts.push(newWorkout);
  localStorage.setItem('workouts', JSON.stringify(workouts));
  
  return newWorkout;
}

// Add a new gym workout
export function addGymWorkout(workout: Omit<GymWorkout, 'id'>): GymWorkout {
  const workouts = getWorkouts();
  
  const newWorkout: GymWorkout = {
    ...workout,
    id: crypto.randomUUID(),
  };
  
  workouts.push(newWorkout);
  localStorage.setItem('workouts', JSON.stringify(workouts));
  
  return newWorkout;
}

// Delete a workout
export function deleteWorkout(id: string): boolean {
  try {
    const workouts = getWorkouts();
    
    // Verifica se o ID existe antes de tentar excluir
    const workoutToDelete = workouts.find(w => w.id === id);
    if (!workoutToDelete) {
      console.error(`Treino com ID ${id} não encontrado`);
      return false;
    }
    
    const filteredWorkouts = workouts.filter(w => w.id !== id);
    
    // Salva a nova lista no localStorage
    localStorage.setItem('workouts', JSON.stringify(filteredWorkouts));
    return true;
  } catch (error) {
    console.error('Erro ao excluir treino:', error);
    return false;
  }
}