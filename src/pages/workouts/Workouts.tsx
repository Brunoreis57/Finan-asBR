import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { 
  getWorkouts, 
  addRunningWorkout, 
  addGymWorkout, 
  Workout, 
  WorkoutType 
} from '../../utils/workoutUtils';
import WorkoutItem from '../../components/workouts/WorkoutItem';
import AddWorkoutModal from '../../components/workouts/AddWorkoutModal';
import MonthPicker from '../../components/finances/MonthPicker';

function Workouts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkoutType>('running');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  
  useEffect(() => {
    // Check if URL has a "new" parameter
    if (searchParams.get('new') === 'workout') {
      setIsModalOpen(true);
      // Clear the URL parameter after opening the modal
      setSearchParams({});
    }
    
    loadWorkouts();
  }, [searchParams]);
  
  useEffect(() => {
    filterWorkouts();
  }, [workouts, selectedMonth, activeTab]);
  
  const loadWorkouts = () => {
    const workouts = getWorkouts();
    setWorkouts(workouts);
  };
  
  const filterWorkouts = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    let filtered = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return (
        workoutDate.getFullYear() === year &&
        workoutDate.getMonth() === month - 1 &&
        workout.type === activeTab
      );
    });
    
    // Sort by date, most recent first
    filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredWorkouts(filtered);
  };
  
  const handleAddWorkout = (workoutData: any) => {
    if (activeTab === 'running') {
      addRunningWorkout(workoutData);
    } else {
      addGymWorkout(workoutData);
    }
    
    loadWorkouts();
    setIsModalOpen(false);
  };

  return (
    <div className="pb-16 md:pb-0">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Workouts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your running and gym sessions
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Workout
          </button>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'running'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('running')}
        >
          Running
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'gym'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('gym')}
        >
          Gym
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-3">Month:</span>
        </div>
        
        <MonthPicker 
          value={selectedMonth} 
          onChange={setSelectedMonth} 
        />
      </div>
      
      {/* Workouts list */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">
            {activeTab === 'running' ? 'Running Sessions' : 'Gym Sessions'}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map((workout) => (
              <WorkoutItem key={workout.id} workout={workout} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-4">No {activeTab} workouts found for this month.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Workout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Workout Modal */}
      <AddWorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWorkout}
        workoutType={activeTab}
        onChangeType={setActiveTab}
      />
    </div>
  );
}

export default Workouts;