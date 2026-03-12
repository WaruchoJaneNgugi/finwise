import { useState, useCallback } from 'react';
import type { UserProfile } from '../types';

const AUTH_KEY    = 'finwise_auth_profile';
const SESSION_KEY = 'finwise_session';

/** Simple numeric hash – replace with bcrypt in a real backend */
const hashPin = (pin: string): string => {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) h = (h * 33) ^ pin.charCodeAt(i);
  return (h >>> 0).toString(36);
};

const loadProfile = (): UserProfile | null => {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
  catch { return null; }
};

const loadSession = (): boolean =>
  localStorage.getItem(SESSION_KEY) === 'true';

export const useAuth = () => {
  const [profile, setProfile]     = useState<UserProfile | null>(loadProfile);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(loadSession);

  const createProfile = useCallback((name: string, email: string, pin: string) => {
    const p: UserProfile = { name, email, pin: hashPin(pin), createdAt: new Date().toISOString() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(p));
    localStorage.setItem(SESSION_KEY, 'true');
    setProfile(p);
    setIsUnlocked(true);
  }, []);

  const unlock = useCallback((pin: string): boolean => {
    if (!profile) return false;
    if (profile.pin === hashPin(pin)) {
      localStorage.setItem(SESSION_KEY, 'true');
      setIsUnlocked(true);
      return true;
    }
    return false;
  }, [profile]);

  const lock = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsUnlocked(false);
  }, []);

  const deleteAccount = useCallback(() => {
    [AUTH_KEY, SESSION_KEY, 'finwise_expenses', 'finwise_profile',
     'finwise_investments', 'finwise_goals', 'finwise_bills', 'finwise_networth']
      .forEach((k) => localStorage.removeItem(k));
    setProfile(null);
    setIsUnlocked(false);
  }, []);

  return { profile, isUnlocked, createProfile, unlock, lock, deleteAccount };
};
