import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService, type User } from '../services/userService';
import { Calendar, Plus, Edit2 } from 'lucide-react';
import { TaskForm } from '../components/TaskForm';
import { useAuthStore } from '../store/useAuthStore';

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
  const { user: currentUser } = useAuthStore();
  const canCreateTask = currentUser?.permissions?.includes('tasks:create');
  const canUpdateTask = currentUser?.permissions?.includes('tasks:update');
  const canDeleteTask = currentUser?.permissions?.includes('tasks:delete');

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        {canCreateTask && (
          <button 
              onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
              <Plus size={18} />
              <span>Add Task</span>
          </button>
        )}
      </div>

      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
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
            {editingTask && canDeleteTask && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => deleteMutation.mutate(editingTask.id)}
                        className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm transition-colors"
                    >
                        Delete Task
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <div key={column} className="flex flex-col gap-3 min-w-[200px]">
            <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              {column.replace('_', ' ')}
            </h2>
            <div className="flex flex-col gap-3">
              {tasks?.filter(t => t.status === column).map((task) => (
                <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{task.title}</h3>
                        {canUpdateTask && (
                          <button onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsTaskModalOpen(true); }} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                            <Edit2 size={14} />
                          </button>
                        )}
                    </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mb-3">#PRJ-{task.project_id}</p>
                  
                  {task.assigneeId && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-[8px] font-bold">
                        {users.find((u: User) => u.id === task.assigneeId)?.firstName?.[0] || 'U'}
                        {users.find((u: User) => u.id === task.assigneeId)?.lastName?.[0] || ''}
                      </div>
                      <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                        {users.find((u: User) => u.id === task.assigneeId)?.firstName} {users.find((u: User) => u.id === task.assigneeId)?.lastName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                        task.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                        task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Calendar size={12} />
                      <span>{task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {tasks?.filter(t => t.status === column).length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
                      <p className="text-xs text-gray-400 dark:text-gray-600">No tasks</p>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskListPage;
