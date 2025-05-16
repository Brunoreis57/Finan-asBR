import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TransactionType } from '../../utils/financeUtils';
import { categories } from '../../pages/finances/Finances';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: {
    type: TransactionType;
    description: string;
    amount: number;
    category: string;
    date: string;
    notes?: string;
  }) => void;
  initialType?: TransactionType;
}

function AddTransactionModal({ isOpen, onClose, onAdd, initialType }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(initialType || 'income');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialType) {
        setType(initialType);
      }
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [isOpen, initialType]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !category || !date) {
      return; // Form validation
    }
    
    onAdd({
      type,
      description,
      amount: parseFloat(amount),
      category,
      date,
      notes: notes || undefined,
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Adicionar Transação
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Transaction Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Transação
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  checked={type === 'income'}
                  onChange={() => setType('income')}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Receita</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  checked={type === 'expense'}
                  onChange={() => setType('expense')}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Despesa</span>
              </label>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="input"
              placeholder="Salário, Supermercado, etc."
            />
          </div>
          
          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">R$</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="input pl-7"
                placeholder="0,00"
              />
            </div>
          </div>
          
          {/* Category */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="input"
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="input"
            />
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações (Opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input h-20"
              placeholder="Detalhes adicionais..."
            />
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Adicionar Transação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;