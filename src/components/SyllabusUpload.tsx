import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Calendar as CalendarIcon, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { parseSyllabus, generateStudyPlan } from '../lib/gemini';
import { db, auth } from '../lib/firebase';
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
      
      // 2. Parse syllabus with Gemini (Frontend)
      setLoadingStep('Analyzing syllabus structure...');
      const structuredSyllabus = await parseSyllabus(syllabusContent, settings);

      // 3. Generate study plan with Gemini (Frontend)
      setLoadingStep('Creating your adaptive study plan...');
      const studyPlan = await generateStudyPlan(structuredSyllabus, {
        examDate,
        hoursPerDay,
        difficulty,
      }, settings);

      setLoadingStep('Saving your plan...');
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
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'studyPlans'), {
          ...planData,
          createdAt: serverTimestamp()
        });

        onComplete(docRef.id, { ...syllabusData, plan: planData });
      }
    } catch (err: any) {
      console.error('Processing failed:', err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 lg:pb-0">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-display">Build Your Examora Path</h2>
        <p className="text-slate-500 dark:text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium">Upload your syllabus and let Examora build your intelligent study strategy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-8">
          <div className="glass-card p-6 md:p-10 space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-3 font-display">
              <FileText className="w-8 h-8 text-blue-500" />
              Syllabus Input
            </h3>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-10 md:p-16 text-center transition-all cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/50'
              } ${file ? 'border-blue-500/50 bg-blue-500/5' : 'bg-slate-500/5 dark:bg-white/5'}`}
            >
              <input {...getInputProps()} />
              <Upload className={`w-12 h-12 mx-auto mb-4 ${file ? 'text-blue-500 dark:text-blue-400' : 'text-slate-300 dark:text-white/20'}`} />
              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">{file.name}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 font-bold uppercase tracking-widest">Click to change file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-600 dark:text-white/80">Drag & drop PDF or click to browse</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 font-medium">Max file size: 5MB</p>
                </div>
              )}
            </div>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Or paste your syllabus text here..."
                className="w-full h-64 bg-slate-500/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 md:p-10 space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-3 font-display">
              <CalendarIcon className="w-8 h-8 text-purple-500" />
              Study Constraints
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-500/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 md:p-5 focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Daily Study Hours</label>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-black text-sm">{hoursPerDay}h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-3 md:py-4 rounded-2xl text-sm font-black capitalize transition-all border ${
                        difficulty === level 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-500/5 dark:bg-white/5 text-slate-500 dark:text-white/60 hover:bg-slate-500/10 dark:hover:bg-white/10 border-slate-200 dark:border-white/10'
                      }`}
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
            className="w-full py-5 md:py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 group"
          >
            {loading ? (
              <div className="flex items-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg">{loadingStep || 'Processing...'}</span>
              </div>
            ) : (
              <>
                <span className="text-lg">Build Examora Plan</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
