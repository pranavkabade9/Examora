import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Calendar as CalendarIcon, Clock, ChevronRight, Loader2 } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Build Your Examora Path</h2>
        <p className="text-slate-500 dark:text-white/60 text-lg">Upload your syllabus and let Examora build your intelligent study strategy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Syllabus Input
            </h3>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              } ${file ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-blue-500 dark:text-blue-400' : 'text-slate-300 dark:text-white/40'}`} />
              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-500 dark:text-blue-400">{file.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/40">Click to change file</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-white/60">Drag & drop PDF or click to browse</p>
              )}
            </div>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                <p>{error}</p>
              </div>
            )}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Or paste your syllabus text here..."
                className="w-full h-48 bg-slate-500/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              Study Constraints
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-500 dark:text-white/60">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-500/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 dark:text-white/60">Daily Study Hours: {hoursPerDay}h</label>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500 dark:text-white/60">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-2 rounded-lg text-sm capitalize transition-all ${
                        difficulty === level 
                          ? 'bg-blue-500 text-white glow-blue' 
                          : 'bg-slate-500/5 dark:bg-white/5 text-slate-500 dark:text-white/60 hover:bg-slate-500/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
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
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all glow-blue"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{loadingStep || 'Processing...'}</span>
              </div>
            ) : (
              <>
                Build Examora Plan 🚀
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
