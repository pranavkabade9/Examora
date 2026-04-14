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
            className="relative w-full max-w-md glass-card bg-zinc-900 border-red-500/30 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Reset Examora Data?</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Are you sure you want to reset your syllabus? This will clear your current Examora path and progress.
                  </p>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3 text-sm text-red-400">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete current study plan</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-red-400">
                  <Trash2 className="w-4 h-4" />
                  <span>Remove all progress tracking</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-red-400">
                  <Trash2 className="w-4 h-4" />
                  <span>Clear identified weak topics</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
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
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
