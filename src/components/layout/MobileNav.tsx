import { Home, PieChart, Calendar, Dumbbell, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function MobileNav() {
  const navLinks = [
    { icon: Home, label: 'Home', to: '/' },
    { icon: PieChart, label: 'Finances', to: '/finances' },
    { icon: Calendar, label: 'Calendar', to: '/calendar' },
    { icon: Dumbbell, label: 'Workouts', to: '/workouts' },
    { icon: User, label: 'Profile', to: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
      <div className="flex justify-around">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-3 ${
                isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <link.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;