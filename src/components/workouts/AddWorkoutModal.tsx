import { useState, useEffect } from 'react';
import { X, Trash, Plus } from 'lucide-react';
import { WorkoutType } from '../../utils/workoutUtils';

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
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Running fields
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [pace, setPace] = useState('');
  const [intensity, setIntensity] = useState('medium');
  
  // Gym fields
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([
    { name: '', sets: '', reps: '', weight: '' }
  ]);
  
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
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
    }
  }, [isOpen]);
  
  // Calculate pace when distance or time changes
  useEffect(() => {
    if (distance && time) {
      const distanceNum = parseFloat(distance);
      const timeNum = parseFloat(time);
      
      if (distanceNum > 0 && timeNum > 0) {
        const paceVal = (timeNum / distanceNum).toFixed(2);
        setPace(paceVal);
      }
    }
  }, [distance, time]);
  
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Add Workout
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Workout Type Tabs */}
          <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                workoutType === 'running'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => onChangeType('running')}
            >
              Running
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                workoutType === 'gym'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => onChangeType('gym')}
            >
              Gym
            </button>
          </div>
          
          {/* Date */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
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
          
          {workoutType === 'running' ? (
            <>
              {/* Running Fields */}
              <div className="mb-4">
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Distance (km)
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
                  Time (minutes)
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
                  Pace (min/km)
                </label>
                <input
                  type="text"
                  id="pace"
                  value={pace}
                  readOnly
                  className="input bg-gray-50 dark:bg-gray-700"
                  placeholder="Calculated automatically"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Intensity
                </label>
                <select
                  id="intensity"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Gym Fields */}
              <div className="mb-4">
                <label htmlFor="workout-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workout Name
                </label>
                <input
                  type="text"
                  id="workout-name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  required
                  className="input"
                  placeholder="Leg Day, Upper Body, etc."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exercises
                </label>
                
                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Exercise {index + 1}
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
                      
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(index, 'name', e.target.value)}
                          className="input"
                          placeholder="Exercise name"
                          required
                        />
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                              className="input"
                              placeholder="Sets"
                              required
                              min="1"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Sets</span>
                          </div>
                          
                          <div>
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                              className="input"
                              placeholder="Reps"
                              required
                              min="1"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Reps</span>
                          </div>
                          
                          <div>
                            <input
                              type="number"
                              value={exercise.weight}
                              onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                              className="input"
                              placeholder="Weight (kg)"
                              min="0"
                              step="0.5"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Weight (kg)</span>
                          </div>
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
                  Add Exercise
                </button>
              </div>
            </>
          )}
          
          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input h-20"
              placeholder="How did it go? Any achievements?"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWorkoutModal;