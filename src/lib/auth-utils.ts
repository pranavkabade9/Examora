import { db, handleFirestoreError, OperationType } from './firebase';
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

  console.log('Starting migration for user:', userId);

  try {
    let syllabusId = '';
    
    // Migrate Syllabus
    if (guestData.syllabus) {
      console.log('Migrating syllabus...');
      try {
        const syllabusDoc = await addDoc(collection(db, 'syllabi'), {
          userId,
          title: guestData.syllabus.title || 'My Syllabus',
          content: guestData.syllabus.content,
          examDate: guestData.syllabus.examDate || '',
          hoursPerDay: guestData.syllabus.hoursPerDay || 4,
          difficulty: guestData.syllabus.difficulty || 'medium',
          createdAt: serverTimestamp(),
          migratedFromGuest: true
        });
        syllabusId = syllabusDoc.id;
        console.log('Syllabus migrated:', syllabusId);
      } catch (e) {
        console.error('Syllabus migration failed:', e);
        throw e;
      }
    }

    // Migrate Study Plan
    let planId = '';
    if (guestData.plan && (syllabusId || guestData.plan.syllabusId)) {
      console.log('Migrating study plan...');
      try {
        const planDoc = await addDoc(collection(db, 'studyPlans'), {
          userId,
          syllabusId: syllabusId || guestData.plan.syllabusId,
          days: guestData.plan.days || [],
          examDate: guestData.syllabus?.examDate || guestData.plan.examDate || '',
          hoursPerDay: guestData.syllabus?.hoursPerDay || guestData.plan.hoursPerDay || 4,
          difficulty: guestData.syllabus?.difficulty || guestData.plan.difficulty || 'medium',
          createdAt: serverTimestamp(),
          migratedFromGuest: true
        });
        planId = planDoc.id;
        console.log('Study plan migrated:', planId);
      } catch (e) {
        console.error('Study plan migration failed:', e);
        throw e;
      }
    }

    // Migrate Progress
    if (guestData.progress && guestData.progress.length > 0 && planId) {
      console.log(`Migrating ${guestData.progress.length} progress records...`);
      try {
        for (const p of guestData.progress) {
          await addDoc(collection(db, 'progress'), {
            ...p,
            userId,
            planId,
            date: p.date || new Date().toISOString().split('T')[0],
            migratedFromGuest: true
          });
        }
        console.log('Progress migrated');
      } catch (e) {
        console.error('Progress migration failed:', e);
        throw e;
      }
    }

    clearGuestData();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed overall:', error);
    handleFirestoreError(error, OperationType.WRITE, 'migration');
  }
};
