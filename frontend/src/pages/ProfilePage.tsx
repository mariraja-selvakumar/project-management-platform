import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { useMutation } from '@tanstack/react-query';
import { Sun, Moon } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const updateProfileMutation = useMutation({
    mutationFn: (data: z.infer<typeof profileSchema>) => userService.updateProfile(user!.id, data),
    onSuccess: (updatedUser) => {
        setUser({ ...user!, ...updatedUser });
        setIsEditMode(false);
        alert('Profile updated successfully');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: z.infer<typeof passwordSchema>) => authService.changePassword(data),
    onSuccess: () => alert('Password changed successfully')
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: { firstName: user?.firstName || '', lastName: user?.lastName || '' }
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema)
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Profile</h1>
        
        {/* Theme Toggle Switch */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 px-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            <span className="text-sm font-medium">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <button 
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className="sr-only">Toggle Theme</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Personal Information</h2>
                <button type="button" onClick={() => setIsEditMode(!isEditMode)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {isEditMode ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input {...profileForm.register('firstName')} disabled={!isEditMode} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900" placeholder="First Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input {...profileForm.register('lastName')} disabled={!isEditMode} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900" placeholder="Last Name" />
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Roles</label>
                <div className="flex flex-wrap gap-2">
                  {user?.roles?.map((role) => (
                    <span key={role} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {isEditMode && <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm">Save Changes</button>}
        </form>

        <form onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold dark:text-white">Security</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input type="password" {...passwordForm.register('oldPassword')} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input type="password" {...passwordForm.register('newPassword')} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="••••••••" />
              </div>
            </div>
            <button className="w-full bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
