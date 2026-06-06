import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Task } from '../services/taskService';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import './TaskListPage.css';

const TaskListPage: React.FC = () => {
  // For a general task list, we might need a separate endpoint or just list for a specific project
  // For now, I'll assume we are listing tasks for a dummy project or all tasks if backend supports it
  // Given the backend has /api/v1/tasks (global) and /api/v1/projects/:id/tasks (scoped)
  
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      // If the backend doesn't have a global tasks list, we might need to fetch per project
      // But looking at app.js, we have app.use('/api/v1/tasks', taskRouter);
      const { data } = await (await import('../services/apiClient')).default.get('/tasks');
      return data.data;
    },
  });

  if (isLoading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">Error loading tasks</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Circle size={18} className="todo-icon" />;
      case 'in_progress': return <Clock size={18} className="progress-icon" />;
      case 'done': return <CheckCircle2 size={18} className="done-icon" />;
      case 'cancelled': return <XCircle size={18} className="cancelled-icon" />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
      </div>

      <div className="tasks-list">
        {tasks?.map((task) => (
          <div key={task.id} className="task-row">
            <div className="task-status">
              {getStatusIcon(task.status)}
            </div>
            <div className="task-info">
              <span className="task-title">{task.title}</span>
              <span className="task-project">Project ID: {task.projectId}</span>
            </div>
            <div className="task-meta">
              <span className={`priority-tag ${task.priority}`}>
                {task.priority}
              </span>
              <span className="task-date">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskListPage;
