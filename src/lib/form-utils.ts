// Honeypot and rate limiting utilities for form abuse protection

const SUBMIT_COOLDOWN_MS = 3000; // 3 seconds between submissions

export function checkHoneypot(honeypotValue: string): boolean {
  // If honeypot field is filled, it's likely a bot
  return honeypotValue === '';
}

export function checkRateLimit(key: string): { allowed: boolean; waitTime?: number } {
  const lastSubmitKey = `lastSubmit_${key}`;
  const lastSubmit = localStorage.getItem(lastSubmitKey);
  
  if (lastSubmit) {
    const timeSinceLastSubmit = Date.now() - parseInt(lastSubmit, 10);
    if (timeSinceLastSubmit < SUBMIT_COOLDOWN_MS) {
      const waitTime = Math.ceil((SUBMIT_COOLDOWN_MS - timeSinceLastSubmit) / 1000);
      return { allowed: false, waitTime };
    }
  }
  
  localStorage.setItem(lastSubmitKey, Date.now().toString());
  return { allowed: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateMessageLength(message: string, maxLength = 2000): boolean {
  return message.length > 0 && message.length <= maxLength;
}
