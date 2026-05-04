import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Calendar as CalendarIcon, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { parseSyllabusLocally, generateStudyPlanLocally } from '../lib/studyLogic';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SyllabusUploadProps {
  onComplete: (syllabusId: string, data?: any) => void;
  isGuest?: boolean;
}

import { useSettingsStore } from '../store/useSettingsStore';

export default function SyllabusUpload({ onComplete, isGuest }: SyllabusUploadProps) {
  const { settings } = useSettingsStore();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [difficulty, setDifficulty] = useState('medium');
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  } as any);
  
  const handleProcess = async () => {
    if ((!text && !file) || !examDate) {
      setError("Please provide a syllabus (PDF or text) and an exam date.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let syllabusContent = text;

      // 1. If PDF, parse it on the backend
      if (file) {
        setLoadingStep('Extracting text from PDF...');
        const formData = new FormData();
        formData.append('file', file);
        
        const parseResponse = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        });

        const parseResult = await parseResponse.json();
        if (!parseResponse.ok) {
          throw new Error(parseResult.error || 'Failed to parse PDF');
        }
        syllabusContent = parseResult.text;
      }
      
      // 2. Smart Syllabus Organizer
      setLoadingStep('Organizing your syllabus topics...');
      const structuredSyllabus = parseSyllabusLocally(syllabusContent);

      // 3. Auto Study Planner
      setLoadingStep('Building your study roadmap...');
      const studyPlan = generateStudyPlanLocally(structuredSyllabus, {
        examDate,
        hoursPerDay,
        difficulty,
      });

      setLoadingStep('Finalizing your plan...');
      const syllabusData = {
        userId: isGuest ? 'guest' : auth.currentUser?.uid,
        title: structuredSyllabus.title || 'My Syllabus',
        content: structuredSyllabus,
        createdAt: new Date().toISOString(),
        examDate,
        hoursPerDay,
        difficulty,
      };

      if (isGuest) {
        onComplete('guest-syllabus', { ...syllabusData, plan: { days: studyPlan } });
      } else {
        const docRef = await addDoc(collection(db, 'syllabi'), {
          ...syllabusData,
          createdAt: serverTimestamp()
        });

        // Also save the plan to studyPlans collection
        const planData = {
          userId: auth.currentUser?.uid,
          syllabusId: docRef.id,
          days: studyPlan,
          examDate,
          hoursPerDay,
          difficulty,
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'studyPlans'), {
          ...planData,
          createdAt: serverTimestamp()
        });

        onComplete(docRef.id, { ...syllabusData, plan: planData });
    }
  } catch (err: any) {
    if (err.message?.includes('permission')) {
      handleFirestoreError(err, OperationType.WRITE, 'syllabi/studyPlans');
    }
    console.error('Processing failed:', err);
    setError(err.message || "Something went wrong. Please try again.");
  } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 lg:pb-0 px-1">
      <div className="text-center lg:text-left space-y-6">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white font-display leading-none uppercase">
          Build <br/> <span className="text-blue-600 underline decoration-blue-500/20 underline-offset-8">Curriculum</span>
        </h2>
        <p className="text-white/40 text-sm md:text-xl font-bold uppercase tracking-[0.3em] max-w-3xl">
          Automated Study Logic Engine • v4.0.2
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14">
        <div className="space-y-10">
          <div className="glass-card p-8 md:p-14 space-y-10 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/[0.02] blur-[100px] rounded-full pointer-events-none" />
            <div className="space-y-4 text-left">
              <h3 className="text-2xl md:text-3xl font-black flex items-center gap-4 font-display">
                <FileText className="w-8 h-8 text-blue-600" />
                Input Node
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-12">Binary or Text Format</p>
            </div>

            <div 
              {...getRootProps()} 
              className={cn(
                "border-4 border-dashed rounded-[2.5rem] p-10 md:p-20 text-center transition-all cursor-pointer group",
                isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/[0.02] hover:border-blue-500/50',
                file && 'border-blue-600 bg-blue-600/[0.01]'
              )}
            >
              <input {...getInputProps()} />
              <div className={cn(
                "w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all duration-500",
                file ? "bg-blue-600 text-white shadow-2xl shadow-blue-500/30" : "bg-white/5 text-slate-300 group-hover:scale-110"
              )}>
                <Upload className="w-10 h-10" />
              </div>
              {file ? (
                <div className="space-y-2">
                  <p className="text-xl font-black text-blue-600 tracking-tight uppercase">{file.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Node Connected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-lg font-black text-white font-display">PDF DROP</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Automated Parsing Required <br/> (Maximum 5MB)</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 px-4">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Manual Entry</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste Raw Curriculum Data..."
                className="w-full h-48 bg-white/[0.01] border border-white/5 rounded-3xl p-8 text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all resize-none font-medium text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="glass-card p-8 md:p-14 space-y-12 rounded-[3rem] text-left">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-black flex items-center gap-4 font-display uppercase tracking-tight">
                <CalendarIcon className="w-8 h-8 text-purple-600" />
                Weights
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-12">Temporal & Cognitive Constraints</p>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Target Assessment Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 focus:outline-none focus:ring-4 focus:ring-blue-600/10 text-white font-black text-xl [color-scheme:dark]"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <Clock className="w-6 h-6 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chronological Bandwidth</label>
                  <span className="text-2xl font-black text-blue-600 font-display">{hoursPerDay}h <span className="text-xs text-slate-400 not-italic uppercase tracking-widest ml-1">Daily</span></span>
                </div>
                <div className="relative p-2">
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                    className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Density Level</label>
                <div className="grid grid-cols-3 gap-4">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={cn(
                        "py-5 rounded-3xl text-sm font-black uppercase tracking-widest transition-all border",
                        difficulty === level 
                          ? 'bg-blue-600 text-white border-blue-500 shadow-2xl shadow-blue-600/30 -translate-y-1' 
                          : 'bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/10'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleProcess}
            disabled={loading || (!text && !file) || !examDate}
            className="w-full py-8 md:py-10 bg-white hover:bg-slate-100 disabled:opacity-20 text-black font-black rounded-[2.5rem] flex items-center justify-center gap-6 transition-all shadow-2xl active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 opacity-10" />
            
            {loading ? (
              <div className="flex items-center gap-6 z-10 transition-all">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xl md:text-2xl tracking-tight uppercase">{loadingStep || 'Processing Data Stream...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-6 z-10">
                <span className="text-xl md:text-2xl font-black uppercase tracking-tight">Generate Logic RoadMap</span>
                <ChevronRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
