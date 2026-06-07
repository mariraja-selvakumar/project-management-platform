import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

  if (isLoading) return <div className="p-8 text-center text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error loading dashboard data</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Projects', value: data?.kpis.projects.total, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Active Projects', value: data?.kpis.projects.active, icon: Clock, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Completed Tasks', value: data?.kpis.tasks.completed, icon: CheckCircle, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Total Tasks', value: data?.kpis.tasks.total, icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${kpi.bgColor} ${kpi.color}`}><kpi.icon size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recent Activity</h2>
          <div className="space-y-4">
            {data?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start pb-4 border-b border-gray-50 dark:border-gray-700 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-purple-500 dark:bg-purple-400"></div>
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200"><strong>{activity.action}</strong> on {activity.resource_type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Task Status Distribution</h2>
          <div className="space-y-4">
            {Object.entries(data?.charts.tasksByStatus || {}).map(([status, count]) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{status.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full"
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
