import React, { useState } from 'react';
import { ArrowLeft, Video, Calendar, Clock, Users, Upload, FileText, Play, Square, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Meeting, User, AIDecision, SOAPNote } from '../../types';

interface MeetingDetailProps {
  meeting: Meeting | null;
  user: User | null;
  onBack: () => void;
  onAIDecision: (decision: AIDecision) => void;
}

export default function MeetingDetail({ meeting, user, onBack, onAIDecision }: MeetingDetailProps) {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  if (!meeting) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No meeting selected</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
          Back to Calendar
        </button>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Simulate transcript extraction
      setTimeout(() => {
        setTranscript(`[Simulated transcript from ${file.name}]\n\nDr. Johnson: Good afternoon, Jane. How are you feeling today?\n\nPatient: I've been experiencing some fatigue and occasional headaches over the past week.\n\nDr. Johnson: I see. Can you tell me more about when these symptoms started and how severe they are?\n\nPatient: It started about 7 days ago. The fatigue is pretty constant, but the headaches come and go. They're not severe, maybe a 4 out of 10.\n\nDr. Johnson: Have you had any changes in sleep patterns, appetite, or stress levels recently?\n\nPatient: Actually, yes. I've been having trouble sleeping, and I've been under more stress at work.\n\nDr. Johnson: That could definitely be contributing factors. Let's discuss some strategies to help manage your symptoms...`);
      }, 2000);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript) return;

    setIsGeneratingSummary(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockSOAP: SOAPNote = {
        subjective: 'Patient reports fatigue and occasional headaches for the past 7 days. Symptoms started gradually with fatigue being constant and headaches intermittent (rated 4/10). Patient also reports sleep difficulties and increased work stress.',
        objective: 'Patient appears alert and oriented. Vital signs within normal limits. No acute distress noted during consultation.',
        assessment: 'Likely stress-related fatigue and tension headaches secondary to work stress and poor sleep hygiene. No red flag symptoms present.',
        plan: 'Recommend sleep hygiene improvements, stress management techniques, and follow-up in 2 weeks. Consider further evaluation if symptoms persist or worsen.',
        actionItems: [
          'Patient to maintain sleep diary for 1 week',
          'Implement stress reduction techniques (deep breathing, meditation)',
          'Schedule follow-up appointment in 2 weeks',
          'Return earlier if symptoms worsen or new symptoms develop'
        ],
        text: 'Generated SOAP note based on patient consultation.',
        confidence: 0.89,
        provenance: [
          'Patient transcript analysis',
          'Clinical decision support database',
          'Evidence-based medicine guidelines'
        ]
      };

      setIsGeneratingSummary(false);

      // Trigger AI decision modal
      const decision: AIDecision = {
        id: `summary-${Date.now()}`,
        type: 'meeting_summary',
        content: mockSOAP,
        timestamp: new Date().toISOString(),
      };

      onAIDecision(decision);
    }, 3000);
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {meeting.type.replace('_', ' ')} Meeting
            </h1>
            <p className="text-gray-600">
              {formatDateTime(meeting.startTime)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
              {meeting.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <p className="text-gray-900">{meeting.duration} minutes</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
            <p className="text-gray-900">{meeting.participants.length} participants</p>
          </div>
        </div>

        {meeting.joinLink && meeting.status === 'scheduled' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Join Meeting</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recording & Transcript</h2>
          {meeting.status === 'scheduled' || meeting.status === 'in_progress' ? (
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
            </button>
          ) : null}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <label htmlFor="consent" className="font-medium text-yellow-900">
                Consent to Store Transcript
              </label>
              <p className="text-sm text-yellow-700 mt-1">
                By checking this box, you consent to storing the meeting transcript for medical records. 
                Transcripts are not saved by default for privacy protection.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Audio/Video File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".mp3,.wav,.mp4,.webm,.m4a"
              onChange={handleFileUpload}
              className="hidden"
              id="transcript-upload"
            />
            <label htmlFor="transcript-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                MP3, WAV, MP4, WebM up to 100MB
              </p>
            </label>
          </div>
          {uploadedFile && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Uploaded: {uploadedFile.name}</span>
            </div>
          )}
        </div>

        {transcript && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transcript
            </label>
            <div className="border border-gray-300 rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                <span className="text-sm text-gray-600">Auto-generated transcript</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full p-4 border-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={8}
                placeholder="Transcript will appear here after recording or upload..."
              />
            </div>
          </div>
        )}

        {transcript && consentGiven && (
          <div className="flex justify-end">
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>
                {isGeneratingSummary ? 'Generating Summary...' : 'Generate SOAP Note'}
              </span>
            </button>
          </div>
        )}

        {!consentGiven && transcript && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                Consent required to save transcript and generate summary
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Notes</h2>
        <textarea
          placeholder="Add meeting notes..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={6}
        />
      </div>
    </div>
  );
}