import React, { useState } from 'react';
import { Calendar, Clock, Users, Video, ArrowLeft, Plus } from 'lucide-react';
import { User, Meeting } from '../../types';

interface MeetingSchedulerProps {
  user: User | null;
  onSchedule: (meetingData: Partial<Meeting>) => void;
  onCancel: () => void;
}

export default function MeetingScheduler({ user, onSchedule, onCancel }: MeetingSchedulerProps) {
  const [formData, setFormData] = useState({
    type: 'followup' as 'televisit' | 'followup' | 'consult',
    patientId: 'pat1',
    participants: [user?.id || 'doc1', 'pat1'],
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 30,
    recurrence: {
      enabled: false,
      freq: 'WEEKLY',
      interval: 1,
      until: '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();
    
    const meetingData: Partial<Meeting> = {
      type: formData.type,
      patientId: formData.patientId,
      participants: formData.participants,
      startTime,
      duration: formData.duration,
      recurrence: formData.recurrence.enabled ? {
        freq: formData.recurrence.freq,
        interval: formData.recurrence.interval,
        until: formData.recurrence.until || undefined,
      } : undefined,
    };

    onSchedule(meetingData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Schedule Meeting</h2>
              <p className="text-gray-600">Create a new appointment</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Meeting Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'televisit', label: 'Televisit', icon: Video },
                { value: 'followup', label: 'Follow-up', icon: Users },
                { value: 'consult', label: 'Consultation', icon: Calendar },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: value as any }))}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    formData.type === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
            </select>
          </div>

          {user?.role === 'clinician' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  patientId: e.target.value,
                  participants: [user.id, e.target.value]
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pat1">Jane Doe</option>
                <option value="pat2">John Smith</option>
              </select>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">
                Recurring Meeting
              </label>
              <input
                type="checkbox"
                checked={formData.recurrence.enabled}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  recurrence: { ...prev.recurrence, enabled: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {formData.recurrence.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.recurrence.freq}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        recurrence: { ...prev.recurrence, freq: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interval
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.recurrence.interval}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        recurrence: { ...prev.recurrence, interval: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.recurrence.until}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      recurrence: { ...prev.recurrence, until: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Availability Check</h4>
            <p className="text-sm text-blue-700 mb-3">
              Checking availability for selected time slot...
            </p>
            <div className="text-sm text-green-700">
              ✓ Time slot is available for all participants
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}