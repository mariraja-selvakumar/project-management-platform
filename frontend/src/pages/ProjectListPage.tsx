import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, type Project } from '../services/projectService';
import { Plus, Search, Filter, MoreVertical, Clock } from 'lucide-react';
import { ProjectForm } from '../components/ProjectForm';
import { useAuthStore } from '../store/useAuthStore';

const ProjectListPage: React.FC = () => {
  const { user } = useAuthStore();
  const canCreateProject = user?.permissions?.includes('projects:create');
  const canUpdateProject = user?.permissions?.includes('projects:update');
  const canDeleteProject = user?.permissions?.includes('projects:delete');

  const [filters, setFilters] = useState({ status: 'active', page: 1, limit: 10 });
  const [activeProject, setActiveProject] = useState<Project | 'create' | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => {
      const activeFilters = { ...filters } as { status?: string, page: number, limit: number };
      if (!activeFilters.status) delete activeFilters.status;
      return projectService.getProjects(activeFilters);
    },
  });

  const createMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActiveProject(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Project> }) => projectService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActiveProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActiveProject(null);
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-600">Loading projects...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error loading projects</div>;

  const projects: Project[] = data.data || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        {canCreateProject && (
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm" onClick={() => setActiveProject('create')}>
            <Plus size={18} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {activeProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
            <ProjectForm
              initialData={activeProject !== 'create' ? activeProject : undefined}
              onSubmit={(data) => {
                if (activeProject === 'create') {
                  createMutation.mutate(data);
                } else {
                  updateMutation.mutate({ id: activeProject.id, data });
                }
              }}
              onCancel={() => setActiveProject(null)}
              onDelete={activeProject !== 'create' && canDeleteProject ? () => deleteMutation.mutate(activeProject.id) : undefined}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search projects..." className="flex-1 outline-none bg-transparent dark:text-white" />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="outline-none bg-transparent dark:text-white cursor-pointer"
          >
            <option value="" className="dark:bg-gray-800">All Statuses</option>
            <option value="active" className="dark:bg-gray-800">Active</option>
            <option value="on_hold" className="dark:bg-gray-800">On Hold</option>
            <option value="completed" className="dark:bg-gray-800">Completed</option>
          </select>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No projects found.</p>
          {canCreateProject && (
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm" onClick={() => setActiveProject('create')}>
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                    project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {project.status.replace('_', ' ')}
                </span>
                {(canUpdateProject || canDeleteProject) && (
                  <button 
                    className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    onClick={() => setActiveProject(project)}
                  >
                    <MoreVertical size={18} />
                  </button>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{project.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 h-10">{project.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Clock size={14} />
                <span>Due: {project.due_date ? new Date(project.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No date'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProjectListPage;
