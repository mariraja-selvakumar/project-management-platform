import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Briefcase, CheckSquare, Users, LogOut, User, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, permission: 'reports:view' },
    { to: '/projects', label: 'Projects', icon: <Briefcase size={20} />, permission: 'projects:read' },
    { to: '/tasks', label: 'Tasks', icon: <CheckSquare size={20} />, permission: 'tasks:read' },
    { to: '/users', label: 'Users', icon: <Users size={20} />, permission: 'users:read' },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || (user?.permissions?.includes(item.permission))
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`transition-all duration-300 bg-white border-r border-gray-200 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h2 className="text-xl font-bold text-gray-800">Platform</h2>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-gray-100">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {filteredNavItems.map((item) => (
            <Link 
              key={item.to} 
              to={item.to} 
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={!isSidebarOpen ? item.label : undefined}
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between px-2">
            <div className={`flex items-center gap-2 text-gray-700 ${!isSidebarOpen ? 'justify-center w-full' : ''}`}>
              <User size={20} />
              {isSidebarOpen && <span className="text-sm font-medium truncate">{user?.firstName}</span>}
            </div>
            {isSidebarOpen && (
              <button 
                onClick={handleLogout} 
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
           {/* Breadcrumbs or Page Title could go here */}
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
