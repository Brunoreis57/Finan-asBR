import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="hidden md:flex items-center space-x-2">
            <span className="font-semibold text-lg text-primary-600 dark:text-primary-400">LifeTrack</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-gray-600" />
            ) : (
              <Sun className="h-5 w-5 text-gray-300" />
            )}
          </button>
          
          <div className="hidden md:flex items-center">
            <span className="text-sm font-medium mr-2">
              {user?.name}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;