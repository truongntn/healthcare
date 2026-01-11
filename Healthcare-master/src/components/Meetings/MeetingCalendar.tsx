import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, Video, FileText } from 'lucide-react';
import { Meeting, User } from '../../types';

interface MeetingCalendarProps {
  meetings: Meeting[];
  user: User | null;
  onMeetingSelect: (meeting: Meeting) => void;
  onScheduleNew: () => void;
}

export default function MeetingCalendar({ meetings, user, onMeetingSelect, onScheduleNew }: MeetingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getMeetingsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'televisit':
        return Video;
      case 'followup':
        return Users;
      case 'consult':
        return FileText;
      default:
        return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {days.map((date, index) => {
            const dayMeetings = getMeetingsForDate(date);
            const isToday = date && 
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded-lg ${
                  date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                } ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayMeetings.slice(0, 2).map((meeting) => {
                        const TypeIcon = getTypeIcon(meeting.type);
                        return (
                          <button
                            key={meeting.id}
                            onClick={() => onMeetingSelect(meeting)}
                            className={`w-full text-left p-1 rounded text-xs border ${getStatusColor(meeting.status)} hover:shadow-sm transition-shadow`}
                          >
                            <div className="flex items-center space-x-1">
                              <TypeIcon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {formatTime(meeting.startTime)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      {dayMeetings.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayMeetings.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
        <div className="space-y-3">
          {meetings
            .filter(meeting => new Date(meeting.startTime) > new Date() && meeting.status === 'scheduled')
            .slice(0, 3)
            .map((meeting) => {
              const TypeIcon = getTypeIcon(meeting.type);
              return (
                <div
                  key={meeting.id}
                  onClick={() => onMeetingSelect(meeting)}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
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
                          {new Date(meeting.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}