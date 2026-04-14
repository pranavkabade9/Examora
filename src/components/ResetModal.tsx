import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, RefreshCcw, Trash2 } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ResetModal({ isOpen, onClose, onConfirm, isLoading }: ResetModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card bg-white dark:bg-[#0a0a0a] border-red-500/30 overflow-hidden shadow-2xl"
          >
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 shadow-xl shadow-red-500/5">
                  <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display">Reset Examora Data?</h3>
                  <p className="text-slate-500 dark:text-white/60 text-sm font-medium leading-relaxed">
                    Are you sure you want to reset your syllabus? This will clear your current Examora path and progress.
                  </p>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete current study plan</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                  <Trash2 className="w-4 h-4" />
                  <span>Remove all progress tracking</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                  <Trash2 className="w-4 h-4" />
                  <span>Clear identified weak topics</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 hover:bg-slate-500/10 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black transition-all border border-slate-200 dark:border-white/10 uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  {isLoading ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <RefreshCcw className="w-5 h-5" />
                      Confirm Reset
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
