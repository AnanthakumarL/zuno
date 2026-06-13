import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { clsx } from 'clsx';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true); // always show on desktop resize back
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-dark-50 flex">

      {/* Mobile backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />

      {/* Main content */}
      <main
        className={clsx(
          'flex-1 transition-all duration-300 min-h-screen',
          isMobile ? 'ml-0' : isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'
        )}
      >
        {/* Mobile top bar */}
        {isMobile && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-dark-100 sticky top-0 z-30 shadow-sm">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-dark-50 text-dark-700 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="font-heading font-bold text-dark-900 text-lg">Zuno Admin</span>
            </div>
          </div>
        )}

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
