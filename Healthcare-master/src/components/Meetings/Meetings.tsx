import React, { useState } from 'react';
import { Calendar, Plus, Clock, Users, Video } from 'lucide-react';
import { User, Meeting, AIDecision } from '../../types';
import MeetingCalendar from './MeetingCalendar';
import MeetingScheduler from './MeetingScheduler';
import MeetingDetail from './MeetingDetail';

interface MeetingsProps {
  user: User | null;
  onAIDecision: (decision: AIDecision) => void;
}

export default function Meetings({ user, onAIDecision }: MeetingsProps) {
  const [currentView, setCurrentView] = useState<'calendar' | 'schedule' | 'detail'>('calendar');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      organizerId: 'doc1',
      patientId: 'pat1',
      participants: ['doc1', 'pat1'],
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      type: 'followup',
      status: 'scheduled',
      joinLink: 'https://meet.intellihealth.com/room/abc123',
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
      recurrence: {
        freq: 'WEEKLY',
        interval: 1,
      },
    },
    {
      id: '3',
      organizerId: 'doc1',
      patientId: 'pat1',
      participants: ['doc1', 'pat1'],
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      type: 'consult',
      status: 'completed',
      transcriptId: 'transcript123',
    },
  ]);

  const handleScheduleMeeting = (meetingData: Partial<Meeting>) => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      organizerId: user?.id || 'doc1',
      patientId: meetingData.patientId || 'pat1',
      participants: meetingData.participants || [user?.id || 'doc1'],
      startTime: meetingData.startTime || new Date().toISOString(),
      duration: meetingData.duration || 30,
      type: meetingData.type || 'followup',
      status: 'scheduled',
      joinLink: `https://meet.intellihealth.com/room/${Date.now()}`,
      recurrence: meetingData.recurrence,
    };

    setMeetings(prev => [...prev, newMeeting]);
    setCurrentView('calendar');
  };

  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('detail');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar':
        return (
          <MeetingCalendar
            meetings={meetings}
            user={user}
            onMeetingSelect={handleMeetingSelect}
            onScheduleNew={() => setCurrentView('schedule')}
          />
        );
      case 'schedule':
        return (
          <MeetingScheduler
            user={user}
            onSchedule={handleScheduleMeeting}
            onCancel={() => setCurrentView('calendar')}
          />
        );
      case 'detail':
        return (
          <MeetingDetail
            meeting={selectedMeeting}
            user={user}
            onBack={() => setCurrentView('calendar')}
            onAIDecision={onAIDecision}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Manage appointments and consultations</p>
        </div>
        
        {currentView === 'calendar' && (
          <button
            onClick={() => setCurrentView('schedule')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Meeting</span>
          </button>
        )}
      </div>

      {renderCurrentView()}
    </div>
  );
}