import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, type Project } from '../services/projectService';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { ProjectForm } from '../components/ProjectForm';

const ProjectListPage: React.FC = () => {
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
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700" onClick={() => setActiveProject('create')}>
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {activeProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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
              onDelete={activeProject !== 'create' ? () => deleteMutation.mutate(activeProject.id) : undefined}
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search projects..." className="flex-1 outline-none" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No projects found.</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700" onClick={() => setActiveProject('create')}>
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <button 
                  className="text-gray-400 hover:text-purple-600"
                  onClick={() => setActiveProject(project)}
                >
                  <MoreVertical size={18} />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{project.description}</p>
              <div className="text-xs text-gray-500">
                Due: {project.due_date ? new Date(project.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No date'}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProjectListPage;
