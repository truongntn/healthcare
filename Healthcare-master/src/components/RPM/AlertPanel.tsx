import React from 'react';
import { AlertTriangle, Bell, CheckCircle, Clock, Brain } from 'lucide-react';
import { Alert, AIDecision } from '../../types';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onAIDecision: (decision: AIDecision) => void;
}

export default function AlertPanel({ alerts, onAcknowledge, onAIDecision }: AlertPanelProps) {
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return Bell;
      default:
        return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleAnalyzeAlerts = () => {
    // Simulate AI analysis of alerts
    const mockAnalysis = {
      text: 'Analysis of patient alerts indicates elevated cardiovascular stress. Heart rate and oxygen saturation patterns suggest potential respiratory or cardiac issues requiring immediate attention.',
      recommendations: [
        'Schedule urgent cardiology consultation',
        'Consider continuous monitoring',
        'Review current medications',
        'Patient education on symptom recognition',
      ],
      confidence: 0.87,
      provenance: [
        'Patient vital signs history',
        'Clinical alert correlation analysis',
        'Evidence-based triage protocols',
      ],
    };

    const decision: AIDecision = {
      id: `alert-analysis-${Date.now()}`,
      type: 'rpm_alert',
      content: mockAnalysis,
      timestamp: new Date().toISOString(),
    };

    onAIDecision(decision);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          <p className="text-sm text-gray-600">
            {alerts.filter(a => !a.acknowledged).length} unacknowledged
          </p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={handleAnalyzeAlerts}
            className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            title="AI Analysis"
          >
            <Brain className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const colorClasses = getAlertColor(alert.type);
          
          return (
            <div
              key={alert.id}
              className={`p-4 border rounded-lg ${colorClasses} ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-1">
                      {alert.type.toUpperCase()} ALERT
                    </p>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-2 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {!alert.acknowledged && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="p-1 text-current hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                    title="Acknowledge"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {alert.acknowledged && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <div className="flex items-center space-x-2 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    <span>Acknowledged</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">No active alerts</p>
            <p className="text-sm text-gray-400 mt-1">All metrics within normal ranges</p>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Alert Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.type === 'critical').length}
              </p>
              <p className="text-xs text-gray-600">Critical</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.type === 'warning').length}
              </p>
              <p className="text-xs text-gray-600">Warning</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">
                {alerts.filter(a => a.acknowledged).length}
              </p>
              <p className="text-xs text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}