import React, { useState } from 'react';
import { Activity, Heart, Thermometer, Droplets, Weight, TrendingUp, AlertTriangle } from 'lucide-react';
import { User, Observation, Alert, AIDecision } from '../../types';
import ObservationChart from './ObservationChart';
import AlertPanel from './AlertPanel';
import PatientOverview from './PatientOverview';

interface RPMProps {
  user: User | null;
  onAIDecision: (decision: AIDecision) => void;
}

export default function RPM({ user, onAIDecision }: RPMProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('heart_rate');
  
  // Mock observations data
  const observations: Observation[] = [
    {
      id: '1',
      patientId: 'pat1',
      type: 'heart_rate',
      value: 110,
      unit: 'bpm',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      patientId: 'pat1',
      type: 'oxygen_saturation',
      value: 92,
      unit: '%',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      patientId: 'pat1',
      type: 'blood_pressure',
      value: 125,
      unit: 'mmHg',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      patientId: 'pat1',
      type: 'temperature',
      value: 98.6,
      unit: '°F',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Mock alerts data
  const alerts: Alert[] = [
    {
      id: '1',
      patientId: 'pat1',
      type: 'critical',
      message: 'Heart rate elevated above threshold (110 bpm)',
      observationId: '1',
      acknowledged: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      patientId: 'pat1',
      type: 'warning',
      message: 'Oxygen saturation below normal range (92%)',
      observationId: '2',
      acknowledged: false,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ];

  const metrics = [
    {
      id: 'heart_rate',
      name: 'Heart Rate',
      icon: Heart,
      color: 'red',
      value: '110',
      unit: 'bpm',
      status: 'critical' as const,
      trend: 'up',
    },
    {
      id: 'oxygen_saturation',
      name: 'Oxygen Saturation',
      icon: Droplets,
      color: 'blue',
      value: '92',
      unit: '%',
      status: 'warning' as const,
      trend: 'down',
    },
    {
      id: 'blood_pressure',
      name: 'Blood Pressure',
      icon: Activity,
      color: 'purple',
      value: '125/80',
      unit: 'mmHg',
      status: 'normal' as const,
      trend: 'stable',
    },
    {
      id: 'temperature',
      name: 'Temperature',
      icon: Thermometer,
      color: 'orange',
      value: '98.6',
      unit: '°F',
      status: 'normal' as const,
      trend: 'stable',
    },
  ];

  const getMetricColorClasses = (color: string, status: string) => {
    const baseColors = {
      red: 'text-red-600 bg-red-50 border-red-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
    };

    if (status === 'critical') {
      return 'text-red-700 bg-red-100 border-red-300';
    } else if (status === 'warning') {
      return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    }

    return baseColors[color as keyof typeof baseColors] || baseColors.blue;
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    console.log('Acknowledging alert:', alertId);
    // Update alert status
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Remote Patient Monitoring</h1>
          <p className="text-gray-600">Real-time health data and alerts</p>
        </div>
      </div>

      {user?.role === 'clinician' && (
        <PatientOverview 
          patientId="pat1" 
          observations={observations}
          alerts={alerts}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const colorClasses = getMetricColorClasses(metric.color, metric.status);
          
          return (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-6 border rounded-lg text-left transition-all hover:shadow-md ${
                selectedMetric === metric.id 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-200'
              }`}
            >
              <div className={`p-3 rounded-lg w-fit mb-4 ${colorClasses.split(' ')[1]} ${colorClasses.split(' ')[2]}`}>
                <Icon className={`h-6 w-6 ${colorClasses.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {metric.value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
                </p>
                <div className="flex items-center mt-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    metric.status === 'critical' 
                      ? 'bg-red-100 text-red-800'
                      : metric.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {metric.status === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {metric.status.toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→'} 
                    {metric.trend}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ObservationChart 
            observations={observations.filter(obs => obs.type === selectedMetric)}
            metricName={metrics.find(m => m.id === selectedMetric)?.name || 'Unknown'}
          />
        </div>

        <div className="lg:col-span-1">
          <AlertPanel 
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onAIDecision={onAIDecision}
          />
        </div>
      </div>
    </div>
  );
}