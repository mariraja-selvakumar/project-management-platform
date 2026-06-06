import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './DashboardPage.css';

interface DashboardData {
  kpis: {
    projects: { total: number; active: number };
    tasks: { total: number; completed: number };
  };
  charts: {
    tasksByStatus: Record<string, number>;
    projectsByStatus: Record<string, number>;
  };
  recentActivity: Array<{
    id: number;
    action: string;
    resource_type: string;
    created_at: string;
    user_id: number;
  }>;
}

const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard');
      return data.data;
    },
  });

  if (isLoading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error loading dashboard data</div>;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon projects"><Briefcase size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Total Projects</span>
            <span className="kpi-value">{data?.kpis.projects.total}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon active"><Clock size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Active Projects</span>
            <span className="kpi-value">{data?.kpis.projects.active}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon tasks"><CheckCircle size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Completed Tasks</span>
            <span className="kpi-value">{data?.kpis.tasks.completed}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon pending"><AlertCircle size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Total Tasks</span>
            <span className="kpi-value">{data?.kpis.tasks.total}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {data?.recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-details">
                  <p><strong>{activity.action}</strong> on {activity.resource_type}</p>
                  <span>{new Date(activity.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="dashboard-section task-summary">
          <h2>Task Status Distribution</h2>
          <div className="status-bars">
            {Object.entries(data?.charts.tasksByStatus || {}).map(([status, count]) => (
              <div key={status} className="status-bar-item">
                <div className="status-label">
                  <span>{status.replace('_', ' ')}</span>
                  <span>{count}</span>
                </div>
                <div className="progress-bg">
                  <div 
                    className={`progress-fill ${status}`} 
                    style={{ width: `${(count / (data?.kpis.tasks.total || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
