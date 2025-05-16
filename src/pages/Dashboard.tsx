import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, MinusCircle, Calendar as CalendarIcon, Dumbbell, Eye, EyeOff } from 'lucide-react';
import { getTransactions } from '../utils/financeUtils';
import { getEvents, updateEvent } from '../utils/calendarUtils';
import DashboardStat from '../components/dashboard/DashboardStat';
import TransactionItem from '../components/finances/TransactionItem';
import EventItem from '../components/calendar/EventItem';
import EditEventModal from '../components/calendar/EditEventModal';

function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [hideValues, setHideValues] = useState(() => {
    // Recupera a preferência do usuário do localStorage, padrão é false (valores visíveis)
    const saved = localStorage.getItem('hideFinancialValues');
    return saved ? JSON.parse(saved) : false;
  });

  // Salvar preferência quando mudar
  useEffect(() => {
    localStorage.setItem('hideFinancialValues', JSON.stringify(hideValues));
  }, [hideValues]);

  // Função para carregar eventos
  const loadEvents = useCallback(() => {
    const allEvents = getEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = allEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
    
    setUpcomingEvents(upcoming);
  }, []);

  // Função para carregar dados financeiros
  const loadFinancialData = useCallback(() => {
    const transactions = getTransactions();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calculate balance, monthly income and expenses
    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      
      // Update total balance
      if (transaction.type === 'income') {
        totalBalance += transaction.amount;
      } else {
        totalBalance -= transaction.amount;
      }
      
      // Update monthly figures
      if (transactionDate.getMonth() === currentMonth && 
          transactionDate.getFullYear() === currentYear) {
        if (transaction.type === 'income') {
          monthlyIncome += transaction.amount;
        } else {
          monthlyExpenses += transaction.amount;
        }
      }
    });
    
    setBalance(totalBalance);
    setMonthIncome(monthlyIncome);
    setMonthExpenses(monthlyExpenses);
    
    // Get recent transactions (last 5)
    setRecentTransactions(transactions.slice(0, 5));
  }, []);

  useEffect(() => {
    // Load financial data
    loadFinancialData();
    
    // Load upcoming events
    loadEvents();
    
    // Adicionar event listeners para eventos personalizados
    const handleEventDeleted = () => {
      loadEvents();
    };
    
    const handleEventUpdated = () => {
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
  }, [loadFinancialData, loadEvents]);

  // Função para lidar com a edição de eventos
  const handleEditEvent = (event: any) => {
    updateEvent(event);
    loadEvents();
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };
  
  // Função para abrir o modal de edição para um evento específico
  const handleEventEdit = useCallback((event: any) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  }, []);

  // Função para alternar visibilidade dos valores
  const toggleValueVisibility = () => {
    setHideValues(prev => !prev);
  };

  // Função para formatar o valor monetário (real ou oculto)
  const formatCurrency = (value: number) => {
    return hideValues ? "••••••" : `R$${value.toFixed(2)}`;
  };

  return (
    <div className="pb-16 md:pb-0">
      {/* Greeting */}
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aqui está sua visão geral atual
          </p>
        </div>
        <button
          onClick={toggleValueVisibility}
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label={hideValues ? "Mostrar valores" : "Ocultar valores"}
          title={hideValues ? "Mostrar valores" : "Ocultar valores"}
        >
          {hideValues ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </header>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <DashboardStat 
          title="Saldo Atual" 
          value={formatCurrency(balance)} 
          status={balance >= 0 ? 'positive' : 'negative'} 
        />
        <DashboardStat 
          title="Receitas do Mês" 
          value={formatCurrency(monthIncome)} 
          status="positive" 
        />
        <DashboardStat 
          title="Despesas do Mês" 
          value={formatCurrency(monthExpenses)} 
          status="negative" 
        />
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/finances?new=income" className="btn btn-outline flex-col py-4 h-auto">
          <PlusCircle className="h-6 w-6 mb-2 text-emerald-500" />
          <span>Adicionar Receita</span>
        </Link>
        <Link to="/finances?new=expense" className="btn btn-outline flex-col py-4 h-auto">
          <MinusCircle className="h-6 w-6 mb-2 text-red-500" />
          <span>Adicionar Despesa</span>
        </Link>
        <Link to="/calendar?new=event" className="btn btn-outline flex-col py-4 h-auto">
          <CalendarIcon className="h-6 w-6 mb-2 text-primary-500" />
          <span>Adicionar Evento</span>
        </Link>
        <Link to="/workouts?new=workout" className="btn btn-outline flex-col py-4 h-auto">
          <Dumbbell className="h-6 w-6 mb-2 text-secondary-500" />
          <span>Adicionar Treino</span>
        </Link>
      </div>
      
      {/* Recent Transactions */}
      <div className="card mb-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Transações Recentes</h2>
          <Link to="/finances" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            Ver todas
          </Link>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
                hideAmount={hideValues}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Nenhuma transação ainda. Adicione sua primeira!
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Próximos Eventos</h2>
          <Link to="/calendar" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            Ver todos
          </Link>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventItem 
                key={event.id} 
                event={event} 
                showActions
                onDelete={loadEvents}
                onEdit={handleEventEdit}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Nenhum próximo evento. Adicione um ao seu calendário!
            </div>
          )}
        </div>
      </div>
      
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

// Helper function to get greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default Dashboard;