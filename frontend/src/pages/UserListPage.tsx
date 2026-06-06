import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService, User } from '../services/userService';
import { UserPlus, Shield, Mail, Calendar } from 'lucide-react';
import './UserListPage.css';

const UserListPage: React.FC = () => {
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({}),
  });

  if (isLoading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error loading users</div>;

  return (
    <div className="users-page">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <button className="btn btn-primary">
          <UserPlus size={18} />
          <span>Invite User</span>
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{user.firstName} {user.lastName}</span>
                      <span className="user-email"><Mail size={12} /> {user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="login-cell">
                    <Calendar size={14} />
                    <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</span>
                  </div>
                </td>
                <td>
                  <button className="btn-text">Edit Roles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListPage;
