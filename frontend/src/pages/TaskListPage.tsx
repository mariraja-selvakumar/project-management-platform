import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { Calendar, Plus, Edit2 } from 'lucide-react';
import { TaskForm } from '../components/TaskForm';

interface Task {
  id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  project_id: number;
  due_date: string | null;
  description: string;
  assigneeId: number | null;
}

// Helper to map backend task to frontend Task
const mapTask = (task: any): Task => ({
  id: task.id,
  title: task.title,
  status: task.status,
  priority: task.priority,
  project_id: task.project_id,
  due_date: task.due_date,
  description: task.description,
  assigneeId: task.assignee_id,
});

const COLUMNS: Task['status'][] = ['todo', 'in_progress', 'in_review', 'done', 'cancelled'];

const TaskListPage: React.FC = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tasks');
      return data.data.map(mapTask);
    },
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects({ status: 'active' }),
  });
  
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers({}),
  });

  const createMutation = useMutation({
    mutationFn: ({ project_id, taskData }: { project_id: number, taskData: any }) => 
        taskService.createTask(project_id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsTaskModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, taskData }: { id: number, taskData: any }) => {
        const { due_date, project_id, ...cleanData } = taskData;
        return taskService.updateTask(id, { 
            ...cleanData, 
            due_date: due_date,
            assigneeId: cleanData.assigneeId ? Number(cleanData.assigneeId) : null
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
  });

  if (isLoading) return <div className="p-4 text-center">Loading tasks...</div>;
  if (error) return <div className="p-4 text-red-600 text-center">Error loading tasks</div>;

  const projects = projectsData?.data || [];
  const users = usersData || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
        <button 
            onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
            <Plus size={18} />
            <span>Add Task</span>
        </button>
      </div>

      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <TaskForm 
                projects={projects}
                users={users}
                initialData={editingTask ? { 
                    ...editingTask, 
                    due_date: editingTask.due_date ? new Date(editingTask.due_date).toISOString().split('T')[0] : undefined 
                } : undefined}
                onSubmit={(project_id, { project_id: _removed, ...taskData }) => {
                    if (editingTask) updateMutation.mutate({ id: editingTask.id, taskData });
                    else createMutation.mutate({ project_id, taskData });
                }}
                onCancel={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
                submitLabel={editingTask ? 'Update Task' : 'Create Task'}
            />
            {editingTask && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button 
                        onClick={() => deleteMutation.mutate(editingTask.id)}
                        className="w-full text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                        Delete Task
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((column) => (
          <div key={column} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider bg-gray-100 p-2 rounded">
              {column.replace('_', ' ')}
            </h2>
            <div className="flex flex-col gap-3">
              {tasks?.filter(t => t.status === column).map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm text-gray-900">{task.title}</h3>
                        <button onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }} className="text-gray-400 hover:text-blue-600">
                          <Edit2 size={14} />
                        </button>
                    </div>
                  <p className="text-xs text-gray-500">Project ID: {task.project_id}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${task.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No date'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskListPage;
