import { Home, PieChart, Calendar, Dumbbell, User, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const sidebarLinks = [
    { icon: Home, label: 'Início', to: '/' },
    { icon: PieChart, label: 'Finanças', to: '/finances' },
    { icon: Calendar, label: 'Calendário', to: '/calendar' },
    { icon: Dumbbell, label: 'Treinos', to: '/workouts' },
    { icon: User, label: 'Perfil', to: '/profile' },
  ];

  // Mobile sidebar with overlay
  if (isOpen) {
    return (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 md:hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="font-semibold text-lg text-primary-600 dark:text-primary-400">LifeTrack</span>
            <button 
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium text-lg">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user?.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {sidebarLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <link.icon className="h-5 w-5 mr-3" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Desktop sidebar (always visible)
  return (
    <div className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <span className="font-bold text-xl text-primary-600 dark:text-primary-400">LifeTrack</span>
      </div>
      
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium text-lg">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{user?.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[160px]">{user?.email}</div>
          </div>
        </div>
        
        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <link.icon className="h-5 w-5 mr-3" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;