import React from 'react';
import { Users, Calendar, MessageSquare, Activity, AlertTriangle } from 'lucide-react';
import { User } from '../../types';

interface DashboardStatsProps {
  user: User | null;
}

export default function DashboardStats({ user }: DashboardStatsProps) {
  const stats = user?.role === 'clinician' ? [
    {
      name: 'Active Patients',
      value: '24',
      change: '+2 this week',
      icon: Users,
      color: 'blue',
    },
    {
      name: 'Appointments Today',
      value: '8',
      change: '3 completed',
      icon: Calendar,
      color: 'green',
    },
    {
      name: 'Unread Messages',
      value: '12',
      change: '5 urgent',
      icon: MessageSquare,
      color: 'yellow',
    },
    {
      name: 'Active Alerts',
      value: '3',
      change: '1 critical',
      icon: AlertTriangle,
      color: 'red',
    },
  ] : [
    {
      name: 'Upcoming Appointments',
      value: '2',
      change: 'Next: Today 2:00 PM',
      icon: Calendar,
      color: 'green',
    },
    {
      name: 'Health Readings',
      value: '45',
      change: 'Last: 2 hours ago',
      icon: Activity,
      color: 'blue',
    },
    {
      name: 'Messages',
      value: '3',
      change: '1 unread',
      icon: MessageSquare,
      color: 'yellow',
    },
    {
      name: 'Care Plan Items',
      value: '6',
      change: '2 completed',
      icon: Users,
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-900' };
      case 'green':
        return { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-900' };
      case 'yellow':
        return { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-900' };
      case 'red':
        return { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-900' };
      case 'purple':
        return { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-900' };
      default:
        return { bg: 'bg-gray-50', icon: 'text-gray-600', text: 'text-gray-900' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colors = getColorClasses(stat.color);
        
        return (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className={`text-2xl font-bold ${colors.text}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}