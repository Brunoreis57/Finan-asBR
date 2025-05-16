import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem');
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          aria-label={theme === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-gray-600" />
          ) : (
            <Sun className="h-5 w-5 text-gray-300" />
          )}
        </button>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">LifeTrack</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Seu assistente pessoal de finanças e fitness
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Crie sua conta</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input"
                placeholder="João Silva"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input"
                placeholder="••••••••"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar Senha
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="input"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;