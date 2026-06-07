import React from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Project } from '../services/projectService';
import { type User } from '../services/userService';

const taskSchema = z.object({
  project_id: z.coerce.number().min(1, 'Project is required'),
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  due_date: z.string().optional().nullable(),
  assigneeId: z.coerce.number().optional().nullable(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  projects: Project[];
  users: User[];
  onSubmit: (project_id: number, data: TaskFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TaskFormData>;
  submitLabel?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ projects, users, onSubmit, onCancel, initialData, submitLabel = 'Create Task' }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as unknown as Resolver<TaskFormData>,
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit((data as TaskFormData).project_id, data as TaskFormData))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Project</label>
        <select {...register('project_id')} className="w-full p-2 border border-gray-300 rounded-lg">
          <option value="">Select a project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {errors.project_id && <span className="text-red-500 text-xs">{errors.project_id.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input {...register('title')} className="w-full p-2 border border-gray-300 rounded-lg" />
        {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea {...register('description')} className="w-full p-2 border border-gray-300 rounded-lg" rows={3} />
        {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select {...register('status')} className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select {...register('priority')} className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
            </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Assignee</label>
        <select {...register('assigneeId')} className="w-full p-2 border border-gray-300 rounded-lg">
          <option value="">Unassigned</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
        </select>
        {errors.assigneeId && <span className="text-red-500 text-xs">{errors.assigneeId.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input type="date" {...register('due_date')} className="w-full p-2 border border-gray-300 rounded-lg" />
        {errors.due_date && <span className="text-red-500 text-xs">{errors.due_date.message}</span>}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{submitLabel}</button>
      </div>
    </form>
  );
};
