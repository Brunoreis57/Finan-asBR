import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, ArrowLeft } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao redefinir senha');
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
          {isSubmitted ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Verifique seu email</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enviamos um link de redefinição de senha para {email}. Por favor, verifique sua caixa de entrada.
              </p>
              <Link
                to="/login"
                className="btn btn-primary w-full"
              >
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <Link to="/login" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h2 className="text-xl font-semibold ml-2 text-gray-800 dark:text-gray-200">Redefina sua senha</h2>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Digite seu endereço de email e enviaremos um link para redefinir sua senha.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
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
                
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;