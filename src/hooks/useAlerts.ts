import { useState, useCallback } from 'react';
import type { AlertContact, AlertLog } from '../types';
import { generateId } from '../utils/expenses';

const CONTACT_KEY = 'finwise_alert_contact';
const LOG_KEY     = 'finwise_alert_log';

const DEFAULT_CONTACT: AlertContact = { name: '', email: '', whatsapp: '', phone: '' };

const loadContact = (): AlertContact => {
  try { return JSON.parse(localStorage.getItem(CONTACT_KEY) || 'null') ?? DEFAULT_CONTACT; }
  catch { return DEFAULT_CONTACT; }
};

const loadLog = (): AlertLog[] => {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
};

export const useAlerts = () => {
  const [contact, setContactState] = useState<AlertContact>(loadContact);
  const [log, setLog]              = useState<AlertLog[]>(loadLog);

  const saveContact = useCallback((updated: AlertContact) => {
    setContactState(updated);
    localStorage.setItem(CONTACT_KEY, JSON.stringify(updated));
  }, []);

  const recordAlert = useCallback((channel: AlertLog['channel'], snapshot: string) => {
    const entry: AlertLog = {
      id: generateId(),
      channel,
      timestamp: new Date().toISOString(),
      snapshot,
    };
    const updated = [entry, ...log].slice(0, 30);
    setLog(updated);
    localStorage.setItem(LOG_KEY, JSON.stringify(updated));
  }, [log]);

  const clearLog = useCallback(() => {
    setLog([]);
    localStorage.removeItem(LOG_KEY);
  }, []);

  const hasContact = !!(contact.email || contact.whatsapp || contact.phone);

  return { contact, saveContact, log, recordAlert, clearLog, hasContact };
};
