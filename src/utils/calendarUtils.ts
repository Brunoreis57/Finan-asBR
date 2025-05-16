export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  category: string;
  notes?: string;
  amount?: number;  // Valor monetário associado ao evento
  isRecurring?: boolean;  // Indicador se o evento é recorrente
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';  // Padrão de recorrência
  recurrenceEndDate?: string;  // Data de término da recorrência
  sendReminder?: boolean;  // Indicador se deve enviar lembrete
  reminderEmail?: string;  // Email para enviar o lembrete
  reminderDays?: number;  // Quantos dias antes do evento enviar o lembrete
}

// Get all events
export function getEvents(): Event[] {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events) : [];
}

// Add a new event
export function addEvent(event: Omit<Event, 'id'>): Event {
  const events = getEvents();
  
  const newEvent: Event = {
    ...event,
    id: crypto.randomUUID(),
  };
  
  events.push(newEvent);
  localStorage.setItem('events', JSON.stringify(events));
  
  // Se for evento recorrente, cria os eventos futuros
  if (event.isRecurring && event.recurrencePattern && event.recurrenceEndDate) {
    createRecurringEvents(newEvent);
  }
  
  return newEvent;
}

// Criar eventos recorrentes
function createRecurringEvents(baseEvent: Event): void {
  if (!baseEvent.isRecurring || !baseEvent.recurrencePattern || !baseEvent.recurrenceEndDate) {
    return;
  }
  
  const events = getEvents();
  const startDate = new Date(baseEvent.date);
  const endDate = new Date(baseEvent.recurrenceEndDate);
  
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 1); // Começa do dia seguinte
  
  while (currentDate <= endDate) {
    let shouldAddEvent = false;
    const newDate = new Date(currentDate);
    
    switch (baseEvent.recurrencePattern) {
      case 'daily':
        shouldAddEvent = true;
        break;
      case 'weekly':
        // Verifica se é o mesmo dia da semana
        shouldAddEvent = newDate.getDay() === startDate.getDay();
        break;
      case 'monthly':
        // Verifica se é o mesmo dia do mês
        shouldAddEvent = newDate.getDate() === startDate.getDate();
        break;
      case 'yearly':
        // Verifica se é o mesmo dia do ano
        shouldAddEvent = newDate.getDate() === startDate.getDate() && 
                          newDate.getMonth() === startDate.getMonth();
        break;
    }
    
    if (shouldAddEvent) {
      const recurringEvent: Event = {
        ...baseEvent,
        id: crypto.randomUUID(),
        date: newDate.toISOString().split('T')[0],
      };
      events.push(recurringEvent);
    }
    
    // Avança um dia
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  localStorage.setItem('events', JSON.stringify(events));
}

// Delete an event
export function deleteEvent(id: string): boolean {
  const events = getEvents();
  const filteredEvents = events.filter(e => e.id !== id);
  
  if (filteredEvents.length !== events.length) {
    localStorage.setItem('events', JSON.stringify(filteredEvents));
    return true;
  }
  
  return false;
}

// Get events by date
export function getEventsByDate(date: Date): Event[] {
  const events = getEvents();
  
  // Set time to beginning of day for comparison
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === targetDate.getTime();
  });
}

// Editar evento
export function updateEvent(event: Event): boolean {
  const events = getEvents();
  const index = events.findIndex(e => e.id === event.id);
  
  if (index !== -1) {
    events[index] = event;
    localStorage.setItem('events', JSON.stringify(events));
    return true;
  }
  
  return false;
}

// Obter categorias de eventos
export function getEventCategories(): { id: string, name: string }[] {
  return [
    { id: 'work', name: 'Trabalho' },
    { id: 'personal', name: 'Pessoal' },
    { id: 'health', name: 'Saúde' },
    { id: 'finance', name: 'Financeiro' },
    { id: 'other', name: 'Outro' },
  ];
}