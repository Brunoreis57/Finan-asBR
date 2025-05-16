import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  value: string; // YYYY-MM format
  onChange: (value: string) => void;
}

function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [year, month] = value.split('-').map(Number);
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    onChange(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
  };
  
  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    onChange(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md h-9">
      <button
        type="button"
        onClick={handlePrevMonth}
        className="px-2 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <div className="px-2 font-medium text-gray-700 dark:text-gray-300">
        {monthNames[month - 1]} {year}
      </div>
      
      <button
        type="button"
        onClick={handleNextMonth}
        className="px-2 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default MonthPicker;