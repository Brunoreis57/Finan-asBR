import { useState, useCallback } from 'react';
import { Clock, Tag, MoreHorizontal, Trash, DollarSign, Bell, Edit } from 'lucide-react';
import { Event, deleteEvent, updateEvent } from '../../utils/calendarUtils';
import { useAuth } from '../../contexts/AuthContext';

interface EventItemProps {
  event: Event;
  showActions?: boolean;
  onDelete?: () => void;
  onEdit?: (event: Event) => void;
}

function EventItem({ event, showActions = false, onDelete, onEdit }: EventItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const formattedDate = new Date(event.date).toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Color mapping for event categories
  const categoryColors: Record<string, string> = {
    work: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    finance: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  
  const handleDelete = useCallback(() => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      const success = deleteEvent(event.id);
      
      if (success) {
        // Verificar se o usuário ainda está autenticado
        if (!isAuthenticated) {
          // Redirecionar para login apenas se não estiver autenticado
          return;
        }
        
        // Chamar o callback de exclusão se fornecido
        if (onDelete) {
          onDelete();
        } else {
          // Atualizar a visualização sem recarregar a página toda
          // Isso evita problemas com a sessão do usuário
          window.dispatchEvent(new CustomEvent('eventDeleted', { detail: event.id }));
        }
      }
    }
  }, [event.id, isAuthenticated, onDelete]);
  
  const handleSendReminder = () => {
    // Se o evento já está configurado para lembrete, apenas confirmar
    if (event.sendReminder) {
      alert(`Um lembrete será enviado para ${event.reminderEmail} ${event.reminderDays} dia(s) antes do evento.`);
      return;
    }
    
    // Caso contrário, perguntar email
    const email = prompt('Digite seu email para receber lembrete:', '');
    if (email) {
      const days = parseInt(prompt('Quantos dias antes do evento deseja receber o lembrete?', '1') || '1');
      
      const updatedEvent: Event = {
        ...event,
        sendReminder: true,
        reminderEmail: email,
        reminderDays: days
      };
      
      updateEvent(updatedEvent);
      alert(`Lembrete configurado! Um email será enviado para ${email} ${days} dia(s) antes do evento.`);
      // Evitar recarregar a página inteira
      window.dispatchEvent(new CustomEvent('eventUpdated', { detail: updatedEvent }));
    }
  };
  
  // Função para lidar com a edição do evento
  const handleEdit = useCallback(() => {
    // Fechar menu de opções
    setShowOptions(false);
    
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      return;
    }
    
    // Chamar o callback de edição se fornecido
    if (onEdit) {
      onEdit(event);
    } else {
      // Disparar evento personalizado para edição
      window.dispatchEvent(new CustomEvent('eventEditRequest', { detail: event }));
    }
  }, [event, isAuthenticated, onEdit]);
  
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="sm:flex sm:items-start">
        <div className="mb-3 sm:mb-0 sm:mr-4 flex-shrink-0">
          <div className="h-12 w-12 rounded-md bg-primary-100 dark:bg-primary-900/30 flex flex-col items-center justify-center text-primary-700 dark:text-primary-400">
            <span className="text-sm font-medium">{formattedDate.split(' ')[0]}</span>
            <span className="text-lg font-bold">{formattedDate.split(' ')[1].replace(',', '')}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
            {event.title}
            <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
              categoryColors[event.category] || categoryColors.other
            }`}>
              <Tag className="h-3 w-3 mr-1" />
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            
            {event.isRecurring && (
              <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                Recorrente
              </span>
            )}
          </h3>
          
          <div className="mt-1 flex flex-wrap gap-2 items-center text-sm text-gray-500 dark:text-gray-400">
            {event.time && (
              <p className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(event.time)}
              </p>
            )}
            
            {event.amount !== undefined && (
              <p className="flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                R${event.amount.toFixed(2)}
              </p>
            )}
            
            {event.sendReminder && (
              <p className="flex items-center">
                <Bell className="h-3 w-3 mr-1" />
                Lembrete {event.reminderDays} dia(s) antes
              </p>
            )}
          </div>
          
          {event.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {event.notes}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="mt-3 sm:mt-0 relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </button>
                <button
                  onClick={handleSendReminder}
                  className="flex items-center w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {event.sendReminder ? 'Ver detalhes do lembrete' : 'Configurar lembrete'}
                </button>
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
        )}
      </div>
    </div>
  );
}

// Helper to format time from 24h to 12h format
function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default EventItem;