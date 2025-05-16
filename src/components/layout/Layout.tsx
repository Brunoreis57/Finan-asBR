import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar for desktop */}
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          {/* Top navbar */}
          <Navbar onMenuClick={toggleSidebar} />
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}

export default Layout;