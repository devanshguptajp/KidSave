import { Child, Notification } from "@shared/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function shouldApplyAllowance(child: Child): boolean {
  if (
    !child.allowanceAmount ||
    !child.allowanceFrequency ||
    !child.lastAllowanceDate
  ) {
    return false;
  }

  const now = Date.now();
  const lastDate = child.lastAllowanceDate;
  const timeDifference = now - lastDate;

  switch (child.allowanceFrequency) {
    case "daily":
      return timeDifference >= 24 * 60 * 60 * 1000;
    case "weekly":
      return timeDifference >= 7 * 24 * 60 * 60 * 1000;
    case "custom":
      if (!child.allowanceInterval) return false;
      return timeDifference >= child.allowanceInterval * 1000;
    default:
      return false;
  }
}

export function applyAllowance(child: Child): {
  updatedChild: Child;
  notification: Notification;
} {
  const notification: Notification = {
    id: generateId(),
    type: "allowance",
    message: `You received ${child.allowanceAmount} as allowance!`,
    timestamp: Date.now(),
    amount: child.allowanceAmount,
    read: false,
  };

  const updatedChild = {
    ...child,
    balance: child.balance + (child.allowanceAmount || 0),
    lastAllowanceDate: Date.now(),
  };

  return { updatedChild, notification };
}

export function getNextAllowanceDate(child: Child): Date | null {
  if (!child.allowanceFrequency || !child.lastAllowanceDate) {
    return null;
  }

  const lastDate = new Date(child.lastAllowanceDate);

  switch (child.allowanceFrequency) {
    case "daily":
      lastDate.setDate(lastDate.getDate() + 1);
      return lastDate;
    case "weekly":
      lastDate.setDate(lastDate.getDate() + 7);
      return lastDate;
    case "custom":
      if (!child.allowanceInterval) return null;
      lastDate.setSeconds(lastDate.getSeconds() + child.allowanceInterval);
      return lastDate;
    default:
      return null;
  }
}

export function getTimeUntilAllowance(child: Child): number | null {
  const nextDate = getNextAllowanceDate(child);
  if (!nextDate) return null;

  const remaining = nextDate.getTime() - Date.now();
  return Math.max(0, remaining);
}

export function formatTimeUntilAllowance(milliseconds: number): string {
  if (milliseconds <= 0) return "Ready now!";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
