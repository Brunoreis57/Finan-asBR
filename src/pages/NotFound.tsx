import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Home, Sun, Moon } from 'lucide-react';

function NotFound() {
  const { theme, toggleTheme } = useTheme();
  
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
      
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">Página Não Encontrada</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/" className="btn btn-primary inline-flex items-center">
          <Home className="h-4 w-4 mr-2" />
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}

export default NotFound;