import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao fazer login');
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
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Entre na sua conta</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
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
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Lembrar-me
                </label>
              </div>
              
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Esqueceu a senha?
              </Link>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;