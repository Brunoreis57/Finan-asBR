export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

// Get all transactions
export function getTransactions(): Transaction[] {
  const transactions = localStorage.getItem('transactions');
  return transactions ? JSON.parse(transactions) : [];
}

// Add a new transaction
export function addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
  const transactions = getTransactions();
  
  const newTransaction: Transaction = {
    ...transaction,
    id: crypto.randomUUID(),
  };
  
  transactions.unshift(newTransaction); // Add to the beginning for newest first
  localStorage.setItem('transactions', JSON.stringify(transactions));
  
  return newTransaction;
}

// Delete a transaction
export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const filteredTransactions = transactions.filter(t => t.id !== id);
  
  if (filteredTransactions.length !== transactions.length) {
    localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
    return true;
  }
  
  return false;
}

// Get transactions by month
export function getTransactionsByMonth(year: number, month: number): Transaction[] {
  const transactions = getTransactions();
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getFullYear() === year &&
      transactionDate.getMonth() === month
    );
  });
}

// Interface para rastrear eventos processados automaticamente
interface ProcessedRecurringEvent {
  eventId: string;
  lastProcessedDate: string; // Formato YYYY-MM
}

// Obter eventos já processados
export function getProcessedRecurringEvents(): ProcessedRecurringEvent[] {
  const processed = localStorage.getItem('processedRecurringEvents');
  return processed ? JSON.parse(processed) : [];
}

// Salvar evento processado
export function markEventAsProcessed(eventId: string, yearMonth: string): void {
  const processed = getProcessedRecurringEvents();
  
  const existingIndex = processed.findIndex(p => p.eventId === eventId);
  
  if (existingIndex >= 0) {
    processed[existingIndex].lastProcessedDate = yearMonth;
  } else {
    processed.push({
      eventId,
      lastProcessedDate: yearMonth
    });
  }
  
  localStorage.setItem('processedRecurringEvents', JSON.stringify(processed));
}

// Verificar se um evento já foi processado para um mês específico
export function isEventProcessedForMonth(eventId: string, yearMonth: string): boolean {
  const processed = getProcessedRecurringEvents();
  const processedEvent = processed.find(p => p.eventId === eventId);
  
  if (!processedEvent) {
    return false;
  }
  
  return processedEvent.lastProcessedDate === yearMonth;
}

// Adicionar transação automaticamente a partir de um evento recorrente
export function addTransactionFromEvent(
  description: string,
  amount: number,
  category: string,
  notes?: string
): Transaction {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  
  const transaction: Omit<Transaction, 'id'> = {
    type: 'expense',
    description,
    amount,
    category: category === 'finance' ? 'housing' : category, // Mapear categoria do evento para categoria de transação
    date: formattedDate,
    notes: notes ? `${notes} (Gerado automaticamente de evento recorrente)` : 'Gerado automaticamente de evento recorrente'
  };
  
  return addTransaction(transaction);
}