import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Trash } from 'lucide-react';
import { Transaction } from '../../utils/financeUtils';
import { categories } from '../../pages/finances/Finances';
import { deleteTransaction } from '../../utils/financeUtils';

interface TransactionItemProps {
  transaction: Transaction;
  showDelete?: boolean;
  hideAmount?: boolean;
}

function TransactionItem({ transaction, showDelete = true, hideAmount = false }: TransactionItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const category = categories.find(c => c.id === transaction.category);
  const CategoryIcon = category?.icon || (() => null);
  
  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(transaction.id);
      window.location.reload(); // Simple way to refresh data
    }
  };

  // Formata o valor monetário (real ou oculto)
  const formatAmount = () => {
    if (hideAmount) {
      return '••••••';
    }
    return `${transaction.type === 'income' ? '+' : '-'}R$${transaction.amount.toFixed(2)}`;
  };
  
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
      <div className="flex items-center">
        <div className={`p-2 rounded-full mr-3 ${
          transaction.type === 'income'
            ? 'bg-emerald-100 dark:bg-emerald-900/30'
            : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          {transaction.type === 'income' ? (
            <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {transaction.description}
            </h3>
            {category && (
              <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${category.color} bg-gray-100 dark:bg-gray-800`}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {category.name}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formattedDate}
          </div>
        </div>
        
        <div className="text-right">
          <span className={`font-semibold ${
            transaction.type === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatAmount()}
          </span>
          
          {showDelete && (
            <div className="mt-1 relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
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
    </div>
  );
}

export default TransactionItem;