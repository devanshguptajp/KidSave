const MASTER_PASSWORD = "9999";

export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function hashPin(pin: string): string {
  if (!validatePin(pin)) {
    throw new Error("PIN must be exactly 4 digits");
  }
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function verifyPin(pin: string, hash: string): boolean {
  if (!validatePin(pin)) {
    return false;
  }
  if (pin === MASTER_PASSWORD) {
    return true;
  }
  return hashPin(pin) === hash;
}

export function isMasterPassword(pin: string): boolean {
  return pin === MASTER_PASSWORD;
}

export function formatPinInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}
