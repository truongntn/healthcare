export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'clinician' | 'admin';
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  emergencyContact?: string;
  medicalRecordNumber: string;
}

export interface Meeting {
  id: string;
  organizerId: string;
  patientId: string;
  participants: string[];
  startTime: string;
  duration: number;
  type: 'televisit' | 'followup' | 'consult';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  joinLink?: string;
  transcriptId?: string;
  recurrence?: {
    freq: string;
    interval: number;
    until?: string;
  };
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  isRedacted: boolean;
  replyToMessageId?: string;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reaction: string;
  createdAt: string;
}

export interface ChatChannel {
  id: string;
  type: 'one-to-one' | 'group';
  participants: string[];
  name?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mime: string;
  size: number;
  storageUrl: string;
  createdAt: string;
}

export interface Observation {
  id: string;
  patientId: string;
  type: 'heart_rate' | 'blood_pressure' | 'oxygen_saturation' | 'temperature' | 'weight' | 'glucose';
  value: number;
  unit: string;
  timestamp: string;
  deviceId?: string;
}

export interface Alert {
  id: string;
  patientId: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  observationId: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'meeting_reminder' | 'message' | 'alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AIResponse {
  text: string;
  confidence: number;
  provenance: string[];
  payload?: any;
}

export interface TriageResponse extends AIResponse {
  disposition: 'emergency' | 'urgent' | 'routine' | 'self-care';
  explanation: string;
  recommendations: string[];
}

export interface SOAPNote extends AIResponse {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  actionItems: string[];
}

export interface AIDecision {
  id: string;
  type: 'triage' | 'meeting_summary' | 'chat_summary' | 'rpm_alert';
  content: AIResponse;
  timestamp: string;
}