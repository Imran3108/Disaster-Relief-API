
export enum UserRole {
  CITIZEN = 'citizen',
  VOLUNTEER = 'volunteer',
  ADMIN = 'admin'
}

export enum Urgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RequestStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RescueRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: string;
  message: string;
  urgency: Urgency;
  location: Location;
  peopleCount: number;
  status: RequestStatus;
  createdAt: number;
  synced: boolean;
  smsSent: boolean;
}

export interface VolunteerTask {
  id: string;
  requestId: string;
  volunteerId: string;
  assignedAt: number;
  completedAt?: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  otpVerified: boolean;
}

export interface SyncQueueItem {
  id: string;
  action: 'CREATE_REQUEST' | 'UPDATE_STATUS' | 'ASSIGN_TASK';
  payload: any;
  timestamp: number;
}
