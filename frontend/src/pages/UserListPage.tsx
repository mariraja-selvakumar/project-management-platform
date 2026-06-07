import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { userService, type User } from '../services/userService';
import { UserPlus, Mail, Calendar, X } from 'lucide-react';
import { InviteUserForm } from '../components/InviteUserForm';
import { EditRolesForm } from '../components/EditRolesForm';

const UserListPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const canManageUsers = currentUser?.permissions?.includes('users:manage');
  const [activeUser, setActiveUser] = useState<User | 'invite' | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({}),
  });

  const inviteMutation = useMutation({
    mutationFn: userService.inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setActiveUser(null);
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: ({ id, roleIds }: { id: number, roleIds: number[] }) => userService.updateUserRoles(id, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setActiveUser(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setActiveUser(null);
    },
  });

  if (isLoading) return <div className="p-4 text-center">Loading users...</div>;
  if (error) return <div className="p-4 text-red-600 text-center">Error loading users</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        {canManageUsers && (
          <button 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            onClick={() => setActiveUser('invite')}
          >
            <UserPlus size={18} />
            <span>Invite User</span>
          </button>
        )}
      </div>

      {activeUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                {activeUser === 'invite' ? 'Invite User' : 'Edit Roles'}
              </h2>
              <button onClick={() => setActiveUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            {activeUser === 'invite' ? (
              <InviteUserForm 
                onSubmit={(data) => inviteMutation.mutate(data)} 
                onCancel={() => setActiveUser(null)} 
              />
            ) : (
              <EditRolesForm 
                initialRoleIds={[]}
                onSubmit={(data) => updateRolesMutation.mutate({ id: (activeUser as User).id, ...data })} 
                onDeactivate={() => deactivateMutation.mutate((activeUser as User).id)}
                onCancel={() => setActiveUser(null)} 
              />
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-gray-800 shadow-sm">
                        {user.firstName?.[0] ?? ''}{user.lastName?.[0] ?? ''}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canManageUsers && (
                      <button 
                        className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline transition-all"
                        onClick={() => setActiveUser(user)}
                      >
                        Edit Roles
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserListPage;
