import React from 'react';
import { User, Calendar, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { Observation, Alert } from '../../types';

interface PatientOverviewProps {
  patientId: string;
  observations: Observation[];
  alerts: Alert[];
}

export default function PatientOverview({ patientId, observations, alerts }: PatientOverviewProps) {
  // Mock patient data
  const patient = {
    id: patientId,
    name: 'Jane Doe',
    age: 45,
    gender: 'Female',
    condition: 'Hypertension, Type 2 Diabetes',
    lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  };

  const formatLastContact = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  const getOverallStatus = () => {
    const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;
    const warningAlerts = alerts.filter(a => a.type === 'warning' && !a.acknowledged).length;
    
    if (criticalAlerts > 0) return { status: 'Critical', color: 'red' };
    if (warningAlerts > 0) return { status: 'Warning', color: 'yellow' };
    return { status: 'Stable', color: 'green' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{patient.name}</h2>
            <p className="text-gray-600">{patient.age} years old • {patient.gender}</p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          overallStatus.color === 'critical' || overallStatus.color === 'red'
            ? 'bg-red-100 text-red-800'
            : overallStatus.color === 'yellow'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {overallStatus.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Medical Conditions</h4>
          <p className="text-sm text-gray-900 mb-4">{patient.condition}</p>
          
          <h4 className="text-sm font-medium text-gray-700 mb-2">Last Contact</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatLastContact(patient.lastContact)}</span>
          </div>
        </div>

        <div className="col-span-1">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Latest Readings</h4>
          <div className="space-y-2">
            {observations.slice(0, 3).map((obs) => (
              <div key={obs.id} className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600 capitalize">
                  {obs.type.replace('_', ' ')}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {obs.value} {obs.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Alert Summary</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Critical:</span>
              <span className="text-sm font-medium text-gray-900">
                {alerts.filter(a => a.type === 'critical' && !a.acknowledged).length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Warning:</span>
              <span className="text-sm font-medium text-gray-900">
                {alerts.filter(a => a.type === 'warning' && !a.acknowledged).length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Resolved:</span>
              <span className="text-sm font-medium text-gray-900">
                {alerts.filter(a => a.acknowledged).length}
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              Contact Patient
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              Schedule Visit
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              View Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}