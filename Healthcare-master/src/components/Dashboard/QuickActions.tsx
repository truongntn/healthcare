import React from 'react';
import { MessageSquare, Calendar, Plus, Activity, Users, FileText } from 'lucide-react';
import { User } from '../../types';

interface QuickActionsProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

export default function QuickActions({ user, onNavigate }: QuickActionsProps) {
  const clinicianActions = [
    {
      name: 'Start Triage',
      description: 'Begin patient symptom assessment',
      icon: MessageSquare,
      action: () => onNavigate('triage'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Schedule Meeting',
      description: 'Book new patient appointment',
      icon: Calendar,
      action: () => onNavigate('meetings'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'View RPM Data',
      description: 'Check patient monitoring',
      icon: Activity,
      action: () => onNavigate('rpm'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Send Message',
      description: 'Contact patient or team',
      icon: MessageSquare,
      action: () => onNavigate('chat'),
      color: 'bg-teal-600 hover:bg-teal-700',
    },
  ];

  const patientActions = [
    {
      name: 'Health Check',
      description: 'Assess symptoms with AI',
      icon: MessageSquare,
      action: () => onNavigate('triage'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'My Appointments',
      description: 'View upcoming visits',
      icon: Calendar,
      action: () => onNavigate('meetings'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Health Data',
      description: 'View my readings',
      icon: Activity,
      action: () => onNavigate('rpm'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Messages',
      description: 'Chat with care team',
      icon: MessageSquare,
      action: () => onNavigate('chat'),
      color: 'bg-teal-600 hover:bg-teal-700',
    },
  ];

  const actions = user?.role === 'clinician' ? clinicianActions : patientActions;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              onClick={action.action}
              className={`w-full text-left p-4 rounded-lg text-white transition-colors ${action.color}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{action.name}</p>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}