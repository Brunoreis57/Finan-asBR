import { useMemo } from 'react';
import { Event } from '../../utils/calendarUtils';

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: Event[];
}

function CalendarGrid({ currentMonth, selectedDate, onSelectDate, events }: CalendarGridProps) {
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Find first day of month
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    // Find last day of month
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Calculate days from previous month to display
    const firstDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Add days from previous month
    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Calculate days from next month to display
    const daysNeeded = 42 - days.length; // 6 weeks (42 days) total in calendar
    
    // Add days from next month
    for (let i = 1; i <= daysNeeded; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  }, [currentMonth]);
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if a date is selected
  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Days of week labels
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }) => {
          const dateEvents = getEventsForDate(date);
          const hasEvents = dateEvents.length > 0;
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={`
                h-12 p-1 rounded-md flex flex-col items-center justify-start
                ${isSelected(date) 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : isCurrentMonth 
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800' 
                    : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
                ${isToday(date) && !isSelected(date) ? 'border border-primary-500 dark:border-primary-700' : ''}
              `}
            >
              <span className={`text-sm ${isToday(date) ? 'font-bold' : ''}`}>
                {date.getDate()}
              </span>
              
              {hasEvents && (
                <div className="mt-1 flex space-x-0.5">
                  {dateEvents.length > 2 ? (
                    <span className="h-1 w-1 rounded-full bg-primary-500 dark:bg-primary-400"></span>
                  ) : (
                    dateEvents.slice(0, 2).map((event, i) => (
                      <span 
                        key={i} 
                        className="h-1 w-1 rounded-full bg-primary-500 dark:bg-primary-400"
                      ></span>
                    ))
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;