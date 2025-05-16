import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Filter, DollarSign, PiggyBank, Coffee, Home, ShoppingBag, Car, HeartPulse } from 'lucide-react';
import { getTransactions, addTransaction, Transaction, TransactionType } from '../../utils/financeUtils';
import TransactionItem from '../../components/finances/TransactionItem';
import AddTransactionModal from '../../components/finances/AddTransactionModal';
import MonthPicker from '../../components/finances/MonthPicker';

// Categories with icons
export const categories = [
  { id: 'salary', name: 'Salário', icon: DollarSign, color: 'text-emerald-500' },
  { id: 'savings', name: 'Poupança', icon: PiggyBank, color: 'text-blue-500' },
  { id: 'food', name: 'Alimentação', icon: Coffee, color: 'text-amber-500' },
  { id: 'housing', name: 'Moradia', icon: Home, color: 'text-purple-500' },
  { id: 'shopping', name: 'Compras', icon: ShoppingBag, color: 'text-pink-500' },
  { id: 'transport', name: 'Transporte', icon: Car, color: 'text-indigo-500' },
  { id: 'health', name: 'Saúde', icon: HeartPulse, color: 'text-red-500' },
];

function Finances() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  
  useEffect(() => {
    // Check if URL has a "new" parameter
    const newType = searchParams.get('new') as TransactionType | null;
    if (newType && (newType === 'income' || newType === 'expense')) {
      setIsModalOpen(true);
      // Clear the URL parameter after opening the modal
      setSearchParams({});
    }
    
    loadTransactions();
  }, [searchParams]);
  
  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedMonth, selectedType]);
  
  const loadTransactions = () => {
    const transactions = getTransactions();
    setTransactions(transactions);
  };
  
  const filterTransactions = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    let filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month - 1 &&
        (selectedType === 'all' || transaction.type === selectedType)
      );
    });
    
    // Sort by date, most recent first
    filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredTransactions(filtered);
    
    // Calculate income and expenses for selected month
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    filtered.forEach(transaction => {
      if (transaction.type === 'income') {
        monthlyIncome += transaction.amount;
      } else {
        monthlyExpenses += transaction.amount;
      }
    });
    
    setIncome(monthlyIncome);
    setExpenses(monthlyExpenses);
  };
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    loadTransactions();
    setIsModalOpen(false);
  };

  return (
    <div className="pb-16 md:pb-0">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Finanças</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas receitas e despesas
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Transação
          </button>
        </div>
      </header>
      
      {/* Monthly summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Receitas</h3>
          <p className="text-2xl font-semibold mt-2 text-emerald-600 dark:text-emerald-400">
            R${income.toFixed(2)}
          </p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas</h3>
          <p className="text-2xl font-semibold mt-2 text-red-600 dark:text-red-400">
            R${expenses.toFixed(2)}
          </p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo</h3>
          <p className={`text-2xl font-semibold mt-2 ${
            income - expenses >= 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            R${(income - expenses).toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-3">Filtros:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <MonthPicker 
            value={selectedMonth} 
            onChange={setSelectedMonth} 
          />
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TransactionType | 'all')}
            className="input h-9 py-0 pl-3 pr-8 md:w-auto"
          >
            <option value="all">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
      </div>
      
      {/* Transactions list */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Transações</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-4">Nenhuma transação encontrada para este período.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Transação
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
        initialType={searchParams.get('new') as TransactionType || undefined}
      />
    </div>
  );
}

export default Finances;