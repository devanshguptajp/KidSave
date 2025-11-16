export type Currency = 'INR' | 'USD';

export interface Notification {
  id: string;
  type: 'money_added' | 'money_subtracted' | 'allowance' | 'goal_completed' | 'password_changed' | 'failed_login' | 'category_split' | 'withdrawal_request' | 'withdrawal_approved' | 'withdrawal_declined';
  message: string;
  timestamp: number;
  childId?: string;
  childName?: string;
  amount?: number;
  read: boolean;
  requestId?: string;
}

export interface WithdrawalRequest {
  id: string;
  childId: string;
  childName: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: number;
  respondedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  balance: number;
  percentage?: number;
  fixedAmount?: number;
  autoSplit: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  completed: boolean;
  completedDate?: number;
}

export interface Child {
  id: string;
  name: string;
  pinHash?: string;
  balance: number;
  categories: Category[];
  goals: Goal[];
  piggyBank: number;
  notifications: string[];
  createdAt: number;
  allowanceAmount?: number;
  allowanceFrequency?: 'daily' | 'weekly' | 'custom';
  allowanceInterval?: number;
  lastAllowanceDate?: number;
}

export interface AppState {
  parentPinHash?: string;
  children: Child[];
  currency: Currency;
  parentNotifications: Notification[];
  setupComplete: boolean;
}

export interface AllowanceLog {
  childId: string;
  amount: number;
  date: number;
}
