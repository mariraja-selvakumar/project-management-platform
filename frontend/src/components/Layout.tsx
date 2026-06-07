import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Briefcase, CheckSquare, Users, LogOut, User, Menu, X, ChevronRight } from 'lucide-react';

import { LogoutModal } from './LogoutModal';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path === '/tasks') return 'Tasks';
    if (path === '/users') return 'User Management';
    if (path === '/profile') return 'My Profile';
    return 'Platform';
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
    setIsLogoutModalOpen(false);
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, permission: 'reports:view' },
    { to: '/projects', label: 'Projects', icon: <Briefcase size={20} />, permission: 'projects:read' },
    { to: '/tasks', label: 'Tasks', icon: <CheckSquare size={20} />, permission: 'tasks:read' },
    { to: '/users', label: 'Users', icon: <Users size={20} />, permission: 'users:manage' },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || (user?.permissions?.includes(item.permission))
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className={`transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h2 className="text-xl font-bold text-gray-800 dark:text-white">Platform</h2>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            {isSidebarOpen ? <X size={20} className="dark:text-white" /> : <Menu size={20} className="dark:text-white" />}
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {filteredNavItems.map((item) => (
            <Link 
              key={item.to} 
              to={item.to} 
              className="flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={!isSidebarOpen ? item.label : undefined}
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link to="/profile" className="flex items-center justify-between px-2">
            <div className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 ${!isSidebarOpen ? 'justify-center w-full' : ''}`}>
              <User size={20} />
              {isSidebarOpen && <span className="text-sm font-medium truncate">{user?.firstName}</span>}
            </div>
            {isSidebarOpen && (
              <button 
                onClick={(e) => { e.preventDefault(); setIsLogoutModalOpen(true); }} 
                className="text-red-600 dark:text-red-400 hover:text-red-800 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            )}
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-8">
           <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="hover:text-gray-700 dark:hover:text-gray-200 cursor-default">Platform</span>
              <ChevronRight size={14} />
              <span className="font-bold text-gray-900 dark:text-white">{getPageTitle()}</span>
           </div>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onConfirm={handleLogout} 
        onCancel={() => setIsLogoutModalOpen(false)} 
      />
    </div>
  );
};

export default Layout;
