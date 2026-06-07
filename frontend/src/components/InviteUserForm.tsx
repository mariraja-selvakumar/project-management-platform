import React from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  roleIds: z.array(z.coerce.number()).min(1, 'Select at least one role'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserFormProps {
  onSubmit: (data: InviteFormData) => void;
  onCancel: () => void;
}

export const InviteUserForm: React.FC<InviteUserFormProps> = ({ onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema) as unknown as Resolver<InviteFormData>,
    defaultValues: { roleIds: [3] } // Default to 'Member'
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as InviteFormData))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input {...register('email')} className="w-full p-2 border border-gray-300 rounded-lg" />
        {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input {...register('firstName')} className="w-full p-2 border border-gray-300 rounded-lg" />
          {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName.message}</span>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input {...register('lastName')} className="w-full p-2 border border-gray-300 rounded-lg" />
          {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName.message}</span>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
        <input type="password" {...register('temporaryPassword')} className="w-full p-2 border border-gray-300 rounded-lg" />
        {errors.temporaryPassword && <span className="text-red-500 text-xs">{errors.temporaryPassword.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
        <div className="grid grid-cols-2 gap-2">
            {[ { id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 3, name: 'Member' }, { id: 4, name: 'Viewer' } ].map(role => (
                <label key={role.id} className="flex items-center gap-2">
                    <input type="checkbox" value={role.id} {...register('roleIds')} />
                    {role.name}
                </label>
            ))}
        </div>
        {errors.roleIds && <span className="text-red-500 text-xs">{errors.roleIds.message}</span>}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Invite</button>
      </div>
    </form>
  );
};
