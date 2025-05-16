import { getEvents, Event } from './calendarUtils';
import { 
  addTransactionFromEvent, 
  isEventProcessedForMonth, 
  markEventAsProcessed 
} from './financeUtils';

// Verificar se é o dia 1 do mês
export function isFirstDayOfMonth(): boolean {
  const today = new Date();
  return today.getDate() === 1;
}

// Verificar se a data atual está dentro do período de recorrência do evento
export function isEventActive(event: Event): boolean {
  if (!event.isRecurring) {
    return false;
  }
  
  const today = new Date();
  const eventDate = new Date(event.date);
  
  // Se a data de início do evento ainda não chegou
  if (eventDate > today) {
    return false;
  }
  
  // Se o evento tem data de término e ela já passou
  if (event.recurrenceEndDate) {
    const endDate = new Date(event.recurrenceEndDate);
    if (today > endDate) {
      return false;
    }
  }
  
  return true;
}

// Processar eventos recorrentes com valor monetário
export function processRecurringEventsWithAmount(): Array<{event: Event, success: boolean}> {
  // Só processar no dia 1 do mês
  if (!isFirstDayOfMonth()) {
    console.log('Não é dia 1 do mês, pulando processamento de eventos recorrentes');
    return [];
  }
  
  const events = getEvents();
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const results = [];
  
  // Filtrar eventos recorrentes com valor
  const recurringEventsWithAmount = events.filter(
    event => event.isRecurring && event.amount && event.amount > 0 && isEventActive(event)
  );
  
  // Para cada evento recorrente com valor
  for (const event of recurringEventsWithAmount) {
    // Verificar se já foi processado para este mês
    if (isEventProcessedForMonth(event.id, currentYearMonth)) {
      // Se já foi processado, não processa novamente
      results.push({ event, success: false });
      continue;
    }
    
    // Adicionar transação automática
    try {
      const eventTitle = `${event.title} (Recorrente)`;
      
      addTransactionFromEvent(
        eventTitle,
        event.amount || 0,
        event.category,
        event.notes
      );
      
      // Marcar como processado para este mês
      markEventAsProcessed(event.id, currentYearMonth);
      
      results.push({ event, success: true });
    } catch (error) {
      console.error('Erro ao processar evento recorrente:', error);
      results.push({ event, success: false });
    }
  }
  
  return results;
}

// Função para mostrar notificação ao usuário
export function showRecurringEventsProcessedNotification(results: Array<{event: Event, success: boolean}>): void {
  if (results.length === 0) {
    return;
  }
  
  const successful = results.filter(r => r.success);
  
  if (successful.length > 0) {
    const message = `${successful.length} eventos recorrentes processados automaticamente como despesas.`;
    
    // Se o navegador suporta notificações, mostra uma notificação
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Despesas Automáticas Adicionadas', { body: message });
    } else {
      // Caso contrário, mostra um alert
      alert(message);
    }
  }
} 