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
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
        <div className="grid grid-cols-2 gap-2">
            {[ { id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 3, name: 'Member' }, { id: 4, name: 'Viewer' } ].map(role => (
                <label key={role.id} className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        value={role.id} 
                        {...register('roleIds')} 
                    />
                    {role.name}
                </label>
            ))}
        </div>
        {errors.roleIds && <span className="text-red-500 text-xs">{errors.roleIds.message}</span>}
      </div>
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onDeactivate} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Deactivate User</button>
        <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Roles</button>
        </div>
      </div>
    </form>
  );
};
