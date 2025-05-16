import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { getEventCategories, Event } from '../../utils/calendarUtils';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  event: Event | null;
}

function EditEventModal({ isOpen, onClose, onSave, event }: EditEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [sendReminder, setSendReminder] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderDays, setReminderDays] = useState(1);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  
  useEffect(() => {
    if (isOpen && event) {
      // Preencher o formulário com os dados do evento
      setTitle(event.title);
      setDate(event.date);
      setTime(event.time || '');
      setCategory(event.category);
      setNotes(event.notes || '');
      setAmount(event.amount !== undefined ? event.amount.toString() : '');
      setIsRecurring(!!event.isRecurring);
      setRecurrencePattern(event.recurrencePattern || 'weekly');
      setRecurrenceEndDate(event.recurrenceEndDate || '');
      setSendReminder(!!event.sendReminder);
      setReminderEmail(event.reminderEmail || '');
      setReminderDays(event.reminderDays || 1);
      setNewCategory('');
      setShowCategoryInput(false);
    }
  }, [isOpen, event]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || (!category && !newCategory) || !event) {
      return; // Form validation
    }
    
    // Use new category if provided
    const finalCategory = newCategory || category;
    
    const updatedEvent: Event = {
      ...event,
      title,
      date,
      time: time || undefined,
      category: finalCategory,
      notes: notes || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      isRecurring: isRecurring ? true : undefined,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      recurrenceEndDate: isRecurring ? recurrenceEndDate : undefined,
      sendReminder: sendReminder ? true : undefined,
      reminderEmail: sendReminder ? reminderEmail : undefined,
      reminderDays: sendReminder ? reminderDays : undefined,
    };
    
    onSave(updatedEvent);
    
    // Mostrar aviso sobre processamento automático se for evento recorrente com valor
    // e não era recorrente antes ou não tinha valor antes
    const hasNewRecurringWithAmount = 
      isRecurring && 
      amount && 
      parseFloat(amount) > 0 && 
      (!event.isRecurring || !event.amount);
      
    if (hasNewRecurringWithAmount) {
      setTimeout(() => {
        alert("Este evento recorrente com valor monetário será processado automaticamente como uma despesa no dia 1 de cada mês até a data de término da recorrência.");
      }, 500);
    }
  };
  
  const categories = getEventCategories();
  
  if (!isOpen || !event) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Editar Evento
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Título */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Título do evento"
            />
          </div>
          
          {/* Data */}
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
          
          {/* Horário */}
          <div className="mb-4">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Horário (Opcional)
            </label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input"
            />
          </div>
          
          {/* Categoria */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            {!showCategoryInput ? (
              <div className="flex items-center">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required={!showCategoryInput}
                  className="input flex-1"
                  disabled={showCategoryInput}
                >
                  <option value="" disabled>Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ml-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setShowCategoryInput(true)}
                  title="Adicionar nova categoria"
                >
                  <Plus className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required={showCategoryInput}
                  className="input flex-1"
                  placeholder="Nova categoria"
                />
                <button
                  type="button"
                  className="ml-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => {
                    setShowCategoryInput(false);
                    setNewCategory('');
                  }}
                  title="Voltar às categorias existentes"
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>
          
          {/* Valor Monetário */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor (Opcional)
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
                step="0.01"
                min="0"
                className="input pl-7"
                placeholder="0,00"
              />
            </div>
          </div>
          
          {/* Recorrência */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Evento recorrente
              </label>
            </div>
            
            {isRecurring && (
              <div className="ml-6 mt-2 space-y-3">
                <div>
                  <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Padrão de recorrência
                  </label>
                  <select
                    id="recurrencePattern"
                    value={recurrencePattern}
                    onChange={(e) => setRecurrencePattern(e.target.value as any)}
                    className="input"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de término
                  </label>
                  <input
                    type="date"
                    id="recurrenceEndDate"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    min={date}
                    required={isRecurring}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Lembrete */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="sendReminder"
                checked={sendReminder}
                onChange={(e) => setSendReminder(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="sendReminder" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Receber lembrete por email
              </label>
            </div>
            
            {sendReminder && (
              <div className="ml-6 mt-2 space-y-3">
                <div>
                  <label htmlFor="reminderEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email para lembrete
                  </label>
                  <input
                    type="email"
                    id="reminderEmail"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    required={sendReminder}
                    className="input"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Enviar lembrete quantos dias antes
                  </label>
                  <select
                    id="reminderDays"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(parseInt(e.target.value))}
                    className="input"
                  >
                    <option value="1">1 dia antes</option>
                    <option value="2">2 dias antes</option>
                    <option value="3">3 dias antes</option>
                    <option value="7">1 semana antes</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Observações */}
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
          
          {/* Botões */}
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEventModal; 