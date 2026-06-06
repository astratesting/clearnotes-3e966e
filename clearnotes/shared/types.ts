// Shared types between frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transcript {
  id: string;
  meetingId: string;
  content: string;
  actionItems: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  transcriptId: string;
  text: string;
  assignee?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}