import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEvents, addEvent, updateEvent, Event } from '../../utils/calendarUtils';
import EventItem from '../../components/calendar/EventItem';
import AddEventModal from '../../components/calendar/AddEventModal';
import EditEventModal from '../../components/calendar/EditEventModal';
import CalendarGrid from '../../components/calendar/CalendarGrid';

function Calendar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today;
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  
  // Função para carregar eventos
  const loadEvents = useCallback(() => {
    const events = getEvents();
    setEvents(events);
  }, []);
  
  useEffect(() => {
    // Check if URL has a "new" parameter
    if (searchParams.get('new') === 'event') {
      setIsAddModalOpen(true);
      // Clear the URL parameter after opening the modal
      setSearchParams({});
    }
    
    loadEvents();
    
    // Adicionar event listeners para eventos personalizados
    const handleEventDeleted = (e: Event) => {
      loadEvents();
    };
    
    const handleEventUpdated = (e: Event) => {
      loadEvents();
    };
    
    const handleEventEditRequest = (e: CustomEvent) => {
      if (e.detail) {
        setEditingEvent(e.detail);
        setIsEditModalOpen(true);
      }
    };
    
    window.addEventListener('eventDeleted', handleEventDeleted as EventListener);
    window.addEventListener('eventUpdated', handleEventUpdated as EventListener);
    window.addEventListener('eventEditRequest', handleEventEditRequest as EventListener);
    
    return () => {
      // Remover event listeners ao desmontar o componente
      window.removeEventListener('eventDeleted', handleEventDeleted as EventListener);
      window.removeEventListener('eventUpdated', handleEventUpdated as EventListener);
      window.removeEventListener('eventEditRequest', handleEventEditRequest as EventListener);
    };
  }, [searchParams, loadEvents, setSearchParams]);
  
  useEffect(() => {
    filterEventsByDate();
  }, [events, selectedDate]);
  
  const filterEventsByDate = () => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    const filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === selected.getTime();
    });
    
    // Sort by time
    filtered.sort((a, b) => {
      const timeA = a.time ? new Date(`1970-01-01T${a.time}`).getTime() : 0;
      const timeB = b.time ? new Date(`1970-01-01T${b.time}`).getTime() : 0;
      return timeA - timeB;
    });
    
    setSelectedDateEvents(filtered);
  };
  
  const handleAddEvent = (event: Omit<Event, 'id'>) => {
    addEvent(event);
    loadEvents();
    setIsAddModalOpen(false);
  };

  // Função para lidar com a edição de eventos
  const handleEditEvent = (event: Event) => {
    updateEvent(event);
    loadEvents();
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };
  
  // Função para lidar com a exclusão de eventos diretamente na página
  const handleEventDelete = useCallback(() => {
    loadEvents();
  }, [loadEvents]);
  
  // Função para abrir o modal de edição para um evento específico
  const handleEventEdit = useCallback((event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  }, []);
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="pb-16 md:pb-0">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Calendário</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seus eventos e compromissos
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Evento
          </button>
        </div>
      </header>
      
      {/* Calendar navigation */}
      <div className="card mb-6">
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-2">
          <CalendarGrid 
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            events={events}
          />
        </div>
      </div>
      
      {/* Selected day events */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            {formatSelectedDate(selectedDate)}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <EventItem 
                key={event.id} 
                event={event} 
                showActions 
                onDelete={handleEventDelete}
                onEdit={handleEventEdit}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-4">Nenhum evento agendado para este dia.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Evento
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEvent}
        initialDate={selectedDate.toISOString().split('T')[0]}
      />
      
      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleEditEvent}
        event={editingEvent}
      />
    </div>
  );
}

export default Calendar;