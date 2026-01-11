import React from 'react';
import { Calendar, Clock, Video, Users } from 'lucide-react';
import { User, Meeting } from '../../types';

interface UpcomingMeetingsProps {
  user: User | null;
  onNavigate: (view: string) => void;
}

export default function UpcomingMeetings({ user, onNavigate }: UpcomingMeetingsProps) {
  // Mock upcoming meetings data
  const meetings: Meeting[] = [
    {
      id: '1',
      organizerId: 'doc1',
      patientId: 'pat1',
      participants: ['doc1', 'pat1'],
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      type: 'followup',
      status: 'scheduled',
    },
    {
      id: '2',
      organizerId: 'doc1',
      patientId: 'pat2',
      participants: ['doc1', 'pat2'],
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      type: 'televisit',
      status: 'scheduled',
    },
  ];

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'televisit':
        return Video;
      case 'followup':
        return Users;
      default:
        return Calendar;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
        <button
          onClick={() => onNavigate('meetings')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {meetings.slice(0, 3).map((meeting) => {
          const TypeIcon = getTypeIcon(meeting.type);
          
          return (
            <div
              key={meeting.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => onNavigate('meetings')}
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <TypeIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {meeting.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'clinician' ? 'with Patient' : 'with Dr. Johnson'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(meeting.startTime)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(meeting.startTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {meetings.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming appointments</p>
            <button
              onClick={() => onNavigate('meetings')}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Schedule Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}