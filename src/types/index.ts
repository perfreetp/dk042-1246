export type BedStatus = 'empty' | 'reserved' | 'occupied' | 'discharged';

export type CareLevel = 'self-care' | 'semi-care' | 'full-care' | 'special-care';

export type ShiftType = 'morning' | 'afternoon' | 'night';

export type EventType = 'fall' | 'outing' | 'leave' | 'visit';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface CustomTask {
  id: string;
  name: string;
  description: string;
  scheduledTime: string;
  frequency: 'daily' | 'specific';
}

export interface Floor {
  id: string;
  name: string;
  floorNumber: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  floorId: string;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
}

export interface Bed {
  id: string;
  bedNumber: string;
  roomId: string;
  status: BedStatus;
  elderId?: string;
  dailyRate: number;
}

export interface Elder {
  id: string;
  name: string;
  gender: 'male' | 'female';
  idCard: string;
  birthDate: string;
  age: number;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  careLevel: CareLevel;
  checkInDate: string;
  deposit: number;
  status: 'active' | 'discharged' | 'reserved';
  medicalHistory?: string;
  allergies?: string;
}

export interface CarePlan {
  id: string;
  elderId: string;
  careLevel: CareLevel;
  turnOverHours: number;
  measureFrequency: 'daily' | 'bidaily' | 'weekly';
  morningCare: boolean;
  eveningCare: boolean;
  mealAssist: boolean;
  bathingSchedule: 'daily' | 'every2days' | 'weekly';
  mealRounds: number;
  nightRounds: number;
  customTasks: CustomTask[];
}

export interface CareTask {
  id: string;
  carePlanId: string;
  elderId: string;
  type: string;
  name: string;
  scheduledDate: string;
  scheduledTime: string;
  caregiverId?: string;
  status: TaskStatus;
  completedAt?: string;
  notes?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  gender: 'male' | 'female';
  phone: string;
  certification: string;
  hireDate: string;
  status: 'active' | 'leave' | 'inactive';
}

export interface Schedule {
  id: string;
  caregiverId: string;
  date: string;
  shift: ShiftType;
  assignedBeds?: string[];
  notes?: string;
}

export interface EventRecord {
  id: string;
  type: EventType;
  elderId: string;
  caregiverId?: string;
  occurredAt: string;
  location: string;
  description: string;
  handledBy?: string;
  status: 'pending' | 'processing' | 'resolved';
  attachments?: string[];
}

export interface BillItem {
  id: string;
  serviceName: string;
  category: 'room' | 'care' | 'meal' | 'medical' | 'other';
  quantity: number;
  unitPrice: number;
  subtotal: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface Bill {
  id: string;
  elderId: string;
  period: string;
  items: BillItem[];
  totalAmount: number;
  depositUsed: number;
  payableAmount: number;
  generatedAt: string;
  status: 'pending' | 'paid' | 'settled';
}

export interface BedTransfer {
  id: string;
  elderId: string;
  fromBedId: string;
  toBedId: string;
  transferDate: string;
  reason: string;
  rateDifference: number;
  approvedBy: string;
}

export interface MonthlyWorkload {
  caregiverId: string;
  caregiverName: string;
  yearMonth: string;
  totalShifts: number;
  morningShifts: number;
  afternoonShifts: number;
  nightShifts: number;
  tasksCompleted: number;
  overtimeHours: number;
}
