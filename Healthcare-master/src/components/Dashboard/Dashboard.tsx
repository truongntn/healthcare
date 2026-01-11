import React from 'react';
import { User } from '../../types';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import UpcomingMeetings from './UpcomingMeetings';
import QuickActions from './QuickActions';

interface DashboardProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Role: <span className="capitalize font-medium">{user?.role}</span>
        </div>
      </div>

      <DashboardStats user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions user={user} onNavigate={onNavigate} />
        </div>

        <div className="lg:col-span-1">
          <UpcomingMeetings user={user} onNavigate={onNavigate} />
        </div>

        <div className="lg:col-span-1">
          <RecentActivity user={user} />
        </div>
      </div>
    </div>
  );
}