import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService, Project } from '../services/projectService';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import './ProjectListPage.css';

const ProjectListPage: React.FC = () => {
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 10 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
  });

  if (isLoading) return <div className="loading">Loading projects...</div>;
  if (error) return <div className="error">Error loading projects</div>;

  const projects: Project[] = data.data;

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-primary">
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search projects..." />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-card-header">
              <span className={`status-badge ${project.status}`}>
                {project.status.replace('_', ' ')}
              </span>
              <button className="btn-icon">
                <MoreVertical size={18} />
              </button>
            </div>
            <h3 className="project-name">{project.name}</h3>
            <p className="project-desc">{project.description}</p>
            
            <div className="project-footer">
              <div className="project-dates">
                <span>Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}</span>
              </div>
              <div className="project-stats">
                {/* Task counts or progress could go here */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectListPage;
