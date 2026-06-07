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
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        {canManageUsers && (
          <button 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => setActiveUser('invite')}
          >
            <UserPlus size={18} />
            <span>Invite User</span>
          </button>
        )}
      </div>

      {activeUser && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {activeUser === 'invite' ? 'Invite User' : 'Edit Roles'}
              </h2>
              <button onClick={() => setActiveUser(null)}><X size={20} /></button>
            </div>
            {activeUser === 'invite' ? (
              <InviteUserForm 
                onSubmit={(data) => inviteMutation.mutate({ ...data, roleTypeId: data.roleIds[0] })} 
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

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {user.firstName?.[0] ?? ''}{user.lastName?.[0] ?? ''}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {canManageUsers && (
                    <button 
                      className="text-blue-600 text-sm font-medium hover:underline"
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
  );
};

export default UserListPage;
