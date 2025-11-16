import { AppState, Child, Notification, Currency } from '@shared/types';
import { hashPin } from './pinValidation';

const STORAGE_KEY = 'piggybank_app_state';

const defaultState: AppState = {
  parentPinHash: undefined,
  children: [],
  currency: 'INR',
  parentNotifications: [],
  withdrawalRequests: [],
  setupComplete: false,
};

export function getAppState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultState };
    return JSON.parse(stored) as AppState;
  } catch {
    return { ...defaultState };
  }
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function setParentPin(pin: string): void {
  const state = getAppState();
  state.parentPinHash = hashPin(pin);
  state.setupComplete = true;
  saveAppState(state);
}

export function setCurrency(currency: Currency): void {
  const state = getAppState();
  state.currency = currency;
  saveAppState(state);
}

export function addChild(child: Child): void {
  const state = getAppState();
  state.children.push(child);
  saveAppState(state);
}

export function updateChild(id: string, updates: Partial<Child>): void {
  const state = getAppState();
  const index = state.children.findIndex(c => c.id === id);
  if (index !== -1) {
    state.children[index] = { ...state.children[index], ...updates };
    saveAppState(state);
  }
}

export function deleteChild(id: string): void {
  const state = getAppState();
  state.children = state.children.filter(c => c.id !== id);
  saveAppState(state);
}

export function getChild(id: string): Child | undefined {
  const state = getAppState();
  return state.children.find(c => c.id === id);
}

export function addParentNotification(notification: Notification): void {
  const state = getAppState();
  state.parentNotifications.push(notification);
  saveAppState(state);
}

export function addChildNotification(childId: string, notification: Notification): void {
  const state = getAppState();
  const child = state.children.find(c => c.id === childId);
  if (child) {
    child.notifications.push(notification.id);
    saveAppState(state);
  }
}

export function getNotification(id: string): Notification | undefined {
  // Notifications are stored as IDs in children, we need a separate storage
  try {
    const stored = localStorage.getItem(`notification_${id}`);
    if (!stored) return undefined;
    return JSON.parse(stored) as Notification;
  } catch {
    return undefined;
  }
}

export function saveNotification(notification: Notification): void {
  localStorage.setItem(`notification_${notification.id}`, JSON.stringify(notification));
}

export function getChildNotifications(childId: string): Notification[] {
  const state = getAppState();
  const child = state.children.find(c => c.id === childId);
  if (!child) return [];
  
  return child.notifications
    .map(id => getNotification(id))
    .filter((n): n is Notification => n !== undefined)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function markNotificationAsRead(notificationId: string): void {
  const notification = getNotification(notificationId);
  if (notification) {
    notification.read = true;
    saveNotification(notification);
  }
}

export function getUnreadNotificationCount(childId: string): number {
  return getChildNotifications(childId).filter(n => !n.read).length;
}

export function resetAppState(): void {
  localStorage.removeItem(STORAGE_KEY);
  // Clear all notifications
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('notification_')) {
      localStorage.removeItem(key);
    }
  });
}

export function createWithdrawalRequest(childId: string, childName: string, amount: number, reason?: string): { id: string } {
  const state = getAppState();
  const id = Date.now().toString();

  const request = {
    id,
    childId,
    childName,
    amount,
    reason,
    status: 'pending' as const,
    requestedAt: Date.now(),
  };

  state.withdrawalRequests.push(request);
  saveAppState(state);

  return { id };
}

export function getPendingWithdrawalRequests(): any[] {
  const state = getAppState();
  return state.withdrawalRequests.filter(r => r.status === 'pending');
}

export function getWithdrawalRequest(id: string): any | undefined {
  const state = getAppState();
  return state.withdrawalRequests.find(r => r.id === id);
}

export function approveWithdrawalRequest(requestId: string): void {
  const state = getAppState();
  const request = state.withdrawalRequests.find(r => r.id === requestId);

  if (request && request.status === 'pending') {
    const child = state.children.find(c => c.id === request.childId);
    if (child && child.balance >= request.amount) {
      child.balance -= request.amount;
      request.status = 'approved';
      request.respondedAt = Date.now();
      saveAppState(state);
    }
  }
}

export function declineWithdrawalRequest(requestId: string): void {
  const state = getAppState();
  const request = state.withdrawalRequests.find(r => r.id === requestId);

  if (request && request.status === 'pending') {
    request.status = 'declined';
    request.respondedAt = Date.now();
    saveAppState(state);
  }
}
