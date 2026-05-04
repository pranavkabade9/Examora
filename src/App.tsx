import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SyllabusUpload from './components/SyllabusUpload';
import StudyPlan from './components/StudyPlan';
import Analytics from './components/Analytics';
import ResetModal from './components/ResetModal';
import StudySystemOverview from './components/StudySystemOverview';
import { generateStudyPlanLocally } from './lib/studyLogic';
import { getGuestData, saveGuestData, migrateGuestData } from './lib/auth-utils';
import { Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { setDoc, doc, getDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { clearGuestData } from './lib/auth-utils';
import { DEMO_SYLLABUS, DEMO_PLAN, DEMO_PROGRESS } from './lib/demoData';

import { useSettingsStore } from './store/useSettingsStore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const { loadSettings, settings } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [syllabus, setSyllabus] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (!syllabus) {
      setShowUpload(false);
    }
  }, [syllabus]);

  const handleToggleTask = async (dayIndex: number, taskIndex: number) => {
    if (!plan) return;

    // Deep copy to ensure React detects changes
    const updatedPlan = JSON.parse(JSON.stringify(plan));
    const task = updatedPlan.days[dayIndex].tasks[taskIndex];
    task.completed = !task.completed;

    setPlan(updatedPlan);

    // Update Progress State
    const taskId = `${dayIndex}-${taskIndex}-${task.topic}`;
    let updatedProgress = [...progress];
    
    if (task.completed) {
      const newProgressRecord = {
        taskId,
        dayIndex,
        taskIndex,
        topic: task.topic,
        date: updatedPlan.days[dayIndex].date,
        planId: plan.id,
        completedAt: new Date().toISOString()
      };
      updatedProgress.push(newProgressRecord);
      
      // Persist Progress to DB
      if (user) {
        try {
          await addDoc(collection(db, 'progress'), {
            userId: user.uid,
            ...newProgressRecord
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'progress');
        }
      }
    } else {
      updatedProgress = updatedProgress.filter(p => p.taskId !== taskId);
      
      // Remove Progress from DB
      if (user) {
        try {
          const q = query(collection(db, 'progress'), where('userId', '==', user.uid), where('taskId', '==', taskId));
          const snap = await getDocs(q);
          const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'progress', d.id)));
          await Promise.all(deletePromises);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, 'progress');
        }
      }
    }

    setProgress(updatedProgress);

    // Persist Plan
    if (isGuest) {
      saveGuestData({ plan: updatedPlan, progress: updatedProgress });
    } else if (user) {
      try {
        await setDoc(doc(db, 'studyPlans', plan.id), updatedPlan);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `studyPlans/${plan.id}`);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        // Session Check Logic:
        // 1. Check if Firebase user exists
        // 2. Check if Guest user exists in localStorage
        const storedUser = localStorage.getItem('user');
        const isGuestSession = storedUser && JSON.parse(storedUser).type === 'guest';

        if (user) {
          // Google Authenticated User exists
          await loadSettings(user.uid);
          setUser(user);
          setIsGuest(false);
          
          const guestData = getGuestData();
          if (guestData && Object.keys(guestData).length > 0) {
            await migrateGuestData(user.uid);
          }
        } else {
          // Always show login screen if no Firebase user
          setUser(null);
          setIsGuest(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        setIsGuest(false);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || isGuest) return;

    // Fetch latest syllabus
    const syllabusQuery = query(
      collection(db, 'syllabi'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeSyllabus = onSnapshot(syllabusQuery, (snapshot) => {
      if (!snapshot.empty) {
        const syllabusData = snapshot.docs[0].data();
        setSyllabus({ id: snapshot.docs[0].id, ...syllabusData });
        
        // If syllabus exists but no plan, generate one
        if (syllabusData.content && !plan && !generatingPlan) {
          handleGeneratePlan(snapshot.docs[0].id, syllabusData);
        }
      }
    });

    // Fetch latest plan
    const planQuery = query(
      collection(db, 'studyPlans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribePlan = onSnapshot(planQuery, (snapshot) => {
      if (!snapshot.empty) {
        setPlan({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });

    // Fetch progress
    const progressQuery = query(
      collection(db, 'progress'),
      where('userId', '==', user.uid)
    );

    const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
      const progressData = snapshot.docs.map(d => d.data());
      setProgress(progressData);
    });

    return () => {
      unsubscribeSyllabus();
      unsubscribePlan();
      unsubscribeProgress();
    };
  }, [user, isGuest]);

  const handleGeneratePlan = async (syllabusId: string, syllabusData: any) => {
    setGeneratingPlan(true);
    try {
      const generatedPlan = generateStudyPlanLocally(syllabusData.content, {
        examDate: syllabusData.examDate,
        hoursPerDay: syllabusData.hoursPerDay,
        difficulty: syllabusData.difficulty
      });
      
      const planData = {
        userId: user?.uid || 'guest',
        syllabusId,
        days: generatedPlan,
        examDate: syllabusData.examDate,
        hoursPerDay: syllabusData.hoursPerDay,
        difficulty: syllabusData.difficulty,
        createdAt: new Date().toISOString()
      };

      if (isGuest) {
        setPlan(planData);
        saveGuestData({ plan: planData });
      } else if (user) {
        try {
          const docRef = await addDoc(collection(db, 'studyPlans'), {
            ...planData,
            createdAt: serverTimestamp()
          });
          setPlan({ id: docRef.id, ...planData });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'studyPlans');
        }
      }
      setActiveTab('plan');
    } catch (error) {
      console.error('Plan generation failed:', error);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleSyllabusComplete = (id: string, data?: any) => {
    if (data) {
      setSyllabus(id === 'guest-syllabus' ? data : { id, ...data });
      if (data.plan) {
        setPlan(data.plan);
        if (isGuest) {
          saveGuestData({ syllabus: data, plan: data.plan });
        }
      } else if (isGuest) {
        saveGuestData({ syllabus: data });
      }
    }
    setActiveTab('dashboard');
  };

  const handleGuestLogin = () => {
    // Selection logic: Create guest session
    localStorage.setItem('user', JSON.stringify({ type: 'guest' }));
    setIsGuest(true);
    
    // 2. Load demo data
    const existingGuestData = getGuestData();
    if (!existingGuestData || Object.keys(existingGuestData).length === 0) {
      // Initialize with Demo Data if first time
      setSyllabus(DEMO_SYLLABUS);
      setPlan(DEMO_PLAN);
      setProgress(DEMO_PROGRESS);
      
      saveGuestData({ 
        syllabus: DEMO_SYLLABUS, 
        plan: DEMO_PLAN, 
        progress: DEMO_PROGRESS 
      });
    } else {
      // 3. Load existing guest data
      setSyllabus(existingGuestData.syllabus);
      setPlan(existingGuestData.plan);
      setProgress(existingGuestData.progress || []);
    }
    
    // 4. Redirect to dashboard
    setActiveTab('dashboard');
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // 1. Call Backend API
      await fetch('/api/reset-data', { method: 'POST' });

      // 2. Clear Local State
      setSyllabus(null);
      setPlan(null);
      setProgress([]);

      // 3. Clear Storage
      if (isGuest) {
        clearGuestData();
      } else if (user) {
        // Delete from Firestore
        const collectionsToDelete = ['syllabi', 'studyPlans', 'progress'];
        for (const colName of collectionsToDelete) {
          const q = query(collection(db, colName), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          for (const docSnap of snapshot.docs) {
            await deleteDoc(doc(db, colName, docSnap.id));
          }
        }
      }

      // 4. Redirect and Feedback
      setIsResetModalOpen(false);
      setActiveTab('syllabus');
      
      // We could use a toast here, but for now console log is fine
      console.log("Study data reset successfully.");
    } catch (error) {
      console.error('Reset failed:', error);
      alert("Failed to reset study data. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('exam_killer_guest_session');
    
    if (user) {
      await auth.signOut();
    }
    
    setUser(null);
    setIsGuest(false);
    setSyllabus(null);
    setPlan(null);
    setProgress([]);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Auth onGuestLogin={handleGuestLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      isGuest={isGuest}
      onResetRequest={() => setIsResetModalOpen(true)}
      onLogout={handleLogout}
      hasSyllabus={!!syllabus}
    >
      {isGuest && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 glass-card bg-blue-500/10 border-blue-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-blue-100">
              You're in <strong>Guest Mode</strong>. Sign in to save your progress permanently across devices.
            </p>
          </div>
          <button 
            onClick={() => {
              setIsGuest(false);
              setUser(null);
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all glow-blue"
          >
            Upgrade to Google
          </button>
        </motion.div>
      )}

      {generatingPlan ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Generating Your Master Plan...</h2>
            <p className="text-white/40">Analyzing your syllabus and optimizing your schedule.</p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <Dashboard 
              user={user}
              syllabus={syllabus}
              plan={plan} 
              progress={progress} 
              onAction={(action) => setActiveTab(action)} 
              onResetRequest={() => setIsResetModalOpen(true)}
              onToggleTask={handleToggleTask}
              isGuest={isGuest}
            />
          )}
          {activeTab === 'syllabus' && (
            showUpload || !syllabus ? (
              <SyllabusUpload 
                onComplete={(id, data) => {
                  handleSyllabusComplete(id, data);
                  setShowUpload(false);
                }} 
                isGuest={isGuest} 
              />
            ) : (
              <StudySystemOverview onStart={() => setShowUpload(true)} />
            )
          )}
          {activeTab === 'plan' && (
            <StudyPlan plan={plan} onToggleTask={handleToggleTask} />
          )}
          {activeTab === 'analytics' && (
            <Analytics plan={plan} progress={progress} />
          )}
        </>
      )}
      <ResetModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleReset}
        isLoading={isResetting}
      />
    </Layout>
  );
}
