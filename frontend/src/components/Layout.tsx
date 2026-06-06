import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Briefcase, CheckSquare, Users, LogOut, User } from 'lucide-react';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, permission: 'reports:view' },
    { to: '/projects', label: 'Projects', icon: <Briefcase size={20} />, permission: 'projects:read' },
    { to: '/tasks', label: 'Tasks', icon: <CheckSquare size={20} />, permission: 'tasks:read' },
    { to: '/users', label: 'Users', icon: <Users size={20} />, permission: 'users:read' },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || (user && user.permissions.includes(item.permission))
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Platform</h2>
        </div>
        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <Link key={item.to} to={item.to} className="nav-item">
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <User size={20} />
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-header">
           {/* Breadcrumbs or Page Title could go here */}
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
