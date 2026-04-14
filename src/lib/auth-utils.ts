import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const GUEST_SESSION_KEY = 'exam_killer_guest_session';

export interface GuestData {
  syllabus?: any;
  plan?: any;
  progress?: any[];
}

export const getGuestData = (): GuestData | null => {
  const data = localStorage.getItem(GUEST_SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveGuestData = (data: Partial<GuestData>) => {
  const current = getGuestData() || {};
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({ ...current, ...data }));
};

export const clearGuestData = () => {
  localStorage.removeItem(GUEST_SESSION_KEY);
};

export const migrateGuestData = async (userId: string) => {
  const guestData = getGuestData();
  if (!guestData) return;

  try {
    // Migrate Syllabus
    if (guestData.syllabus) {
      await addDoc(collection(db, 'syllabi'), {
        ...guestData.syllabus,
        userId,
        createdAt: serverTimestamp(),
        migratedFromGuest: true
      });
    }

    // Migrate Study Plan
    if (guestData.plan) {
      await addDoc(collection(db, 'studyPlans'), {
        ...guestData.plan,
        userId,
        createdAt: serverTimestamp(),
        migratedFromGuest: true
      });
    }

    // Migrate Progress
    if (guestData.progress && guestData.progress.length > 0) {
      for (const p of guestData.progress) {
        await addDoc(collection(db, 'progress'), {
          ...p,
          userId,
          migratedFromGuest: true
        });
      }
    }

    clearGuestData();
    console.log('Migration successful');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
