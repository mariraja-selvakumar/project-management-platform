import React from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const rolesSchema = z.object({
  roleIds: z.array(z.coerce.number()).min(1, 'Select at least one role'),
});

type RolesFormData = z.infer<typeof rolesSchema>;

interface EditRolesFormProps {
  onSubmit: (data: { roleIds: number[] }) => void;
  onCancel: () => void;
  onDeactivate: () => void;
  initialRoleIds: number[];
}

export const EditRolesForm: React.FC<EditRolesFormProps> = ({ onSubmit, onCancel, onDeactivate, initialRoleIds }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RolesFormData>({
    resolver: zodResolver(rolesSchema) as unknown as Resolver<RolesFormData>,
    defaultValues: { roleIds: initialRoleIds },
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as RolesFormData))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roles</label>
        <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            {[ { id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 3, name: 'Member' }, { id: 4, name: 'Viewer' } ].map(role => (
                <label key={role.id} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        value={role.id} 
                        {...register('roleIds')} 
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{role.name}</span>
                </label>
            ))}
        </div>
        {errors.roleIds && <span className="text-red-500 text-xs">{errors.roleIds.message}</span>}
      </div>
      <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
        <button type="button" onClick={onDeactivate} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-semibold text-sm">Deactivate User</button>
        <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm">Update Roles</button>
        </div>
      </div>
    </form>
  );
};
