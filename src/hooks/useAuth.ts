import { useState, useCallback } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile, SubscriptionTier } from '../types';

const SESSION_KEY = 'finwise_session';
const PROFILE_KEY = 'finwise_auth_profile';

const hashPin = (pin: string): string => {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) h = (h * 33) ^ pin.charCodeAt(i);
  return (h >>> 0).toString(36);
};

const loadLocalProfile = (): UserProfile | null => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
  catch { return null; }
};

export const useAuth = () => {
  const [profile, setProfile]       = useState<UserProfile | null>(loadLocalProfile);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(localStorage.getItem(SESSION_KEY) === 'true');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Use phone number (sanitized) as the Firestore document ID
  const phoneToId = (phone: string) => phone.replace(/\s+/g, '');

  const createProfile = useCallback(async (name: string, phone: string, pin: string, tier: SubscriptionTier = 'free') => {
    setLoading(true);
    setError(null);
    try {
      const p: UserProfile = { name, phone, pin: hashPin(pin), createdAt: new Date().toISOString(), tier };
      const uid = phoneToId(phone);
      await setDoc(doc(db, 'users', uid), p);
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...p, uid }));
      localStorage.setItem(SESSION_KEY, 'true');
      setProfile(p);
      setIsUnlocked(true);
    } catch (e) {
      setError('Failed to create account. Check your connection.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const unlock = useCallback(async (phone: string, pin: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const uid = phoneToId(phone);
      const snap = await getDocs(query(collection(db, 'users'), where('phone', '==', phone)));
      if (snap.empty) {
        setError('No account found for this phone number.');
        return false;
      }
      const data = snap.docs[0].data() as UserProfile;
      if (data.pin !== hashPin(pin)) {
        setError('Wrong PIN.');
        return false;
      }
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...data, uid }));
      localStorage.setItem(SESSION_KEY, 'true');
      setProfile(data);
      setIsUnlocked(true);
      return true;
    } catch (e) {
      setError('Login failed. Check your connection.');
      console.error(e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const lock = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsUnlocked(false);
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const local = loadLocalProfile();
      if (local?.phone) await deleteDoc(doc(db, 'users', phoneToId(local.phone)));
    } catch { /* best effort */ }
    [SESSION_KEY, PROFILE_KEY, 'finwise_expenses', 'finwise_investments',
     'finwise_goals', 'finwise_bills', 'finwise_networth']
      .forEach(k => localStorage.removeItem(k));
    setProfile(null);
    setIsUnlocked(false);
  }, []);

  return { profile, isUnlocked, loading, error, createProfile, unlock, lock, deleteAccount };
};
