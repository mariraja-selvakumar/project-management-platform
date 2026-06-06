import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'on_hold', 'completed', 'archived']),
  dueDate: z.string().optional().nullable(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel }) => {
  const today = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'active',
      dueDate: today
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Create Project</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input {...register('name')} className="w-full p-2 border border-gray-300 rounded-lg" />
        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea {...register('description')} className="w-full p-2 border border-gray-300 rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input type="date" {...register('dueDate')} defaultValue={today} className="w-full p-2 border border-gray-300 rounded-lg" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Create Project</button>
      </div>
    </form>
  );
};
