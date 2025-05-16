import { useEffect, useState } from 'react';
import { 
  processRecurringEventsWithAmount, 
  isFirstDayOfMonth,
  showRecurringEventsProcessedNotification 
} from '../utils/recurringEventsService';

// Este componente não renderiza nada visualmente, apenas processa eventos
function RecurringEventProcessor() {
  const [hasProcessed, setHasProcessed] = useState(false);
  
  useEffect(() => {
    // Pedir permissão para notificações
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Processar eventos recorrentes apenas uma vez por sessão
    if (!hasProcessed) {
      // Processar eventos recorrentes com valor monetário
      const results = processRecurringEventsWithAmount();
      
      // Se pelo menos um evento foi processado com sucesso, exibir notificação
      if (results.some(r => r.success)) {
        showRecurringEventsProcessedNotification(results);
      }
      
      setHasProcessed(true);
    }
    
    // Configurar um intervalo para verificar eventos recorrentes a cada hora
    // Isso é útil se o usuário mantiver o aplicativo aberto durante a virada do mês
    const intervalId = setInterval(() => {
      if (isFirstDayOfMonth()) {
        const results = processRecurringEventsWithAmount();
        if (results.some(r => r.success)) {
          showRecurringEventsProcessedNotification(results);
        }
      }
    }, 3600000); // 1 hora em milissegundos
    
    return () => {
      clearInterval(intervalId);
    };
  }, [hasProcessed]);
  
  // Este componente não renderiza nada
  return null;
}

export default RecurringEventProcessor; 