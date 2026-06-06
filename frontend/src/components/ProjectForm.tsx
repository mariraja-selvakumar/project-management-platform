import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Project } from '../services/projectService';

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
  onDelete?: () => void;
  initialData?: Project;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, onDelete, initialData }) => {
  const today = new Date().toISOString().split('T')[0];
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData ? {
        name: initialData.name,
        description: initialData.description || '',
        status: initialData.status,
        dueDate: initialData.due_date ? initialData.due_date.split('T')[0] : today
    } : {
      status: 'active',
      dueDate: today
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">{initialData ? 'Update Project' : 'Create Project'}</h2>
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
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select {...register('status')} className="w-full p-2 border border-gray-300 rounded-lg">
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
        {errors.status && <span className="text-red-500 text-xs">{errors.status.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input type="date" {...register('dueDate')} defaultValue={initialData?.due_date ? initialData.due_date.split('T')[0] : today} className="w-full p-2 border border-gray-300 rounded-lg" />
      </div>
      <div className="flex justify-between pt-4">
        {onDelete && (
          <button type="button" onClick={onDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        )}
        <div className="flex gap-2 ml-auto">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{initialData ? 'Update' : 'Create'}</button>
        </div>
      </div>
    </form>
  );
};
