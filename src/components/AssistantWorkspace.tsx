import React from 'react';
import { motion } from 'motion/react';
import { Info, Lightbulb, TrendingUp, AlertCircle, ExternalLink, ChevronRight, BookOpen, Clock, Target } from 'lucide-react';

interface AssistantWorkspaceProps {
  syllabus: any;
  plan: any;
  memory: any;
  suggestions: any[];
  onUpdateMemory: (newWeakTopics: string[]) => void;
}

export default function AssistantWorkspace({ syllabus, plan, memory, suggestions }: AssistantWorkspaceProps) {
  const studyTips = [
    { title: 'The Ebbinghaus Curve', text: 'Review new material within 24 hours to increase retention by up to 80%.', icon: Clock, color: 'text-blue-500' },
    { title: 'Active Recall', text: 'Instead of re-reading, try to explain a topic from memory. It builds stronger neural paths.', icon: Target, color: 'text-purple-500' },
    { title: 'Interleaved Practice', text: 'Switching between different topics helps your brain distinguish between similar concepts.', icon: BookOpen, color: 'text-teal-500' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white font-display">Study Assistant</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">Your logic-driven guide to academic excellence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Smart Suggestions */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Live Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.length > 0 ? suggestions.map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-6 border-l-4 border-l-blue-500"
                >
                  <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">{suggestion.type}</p>
                  <h4 className="text-lg font-black mb-1">{suggestion.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{suggestion.text}</p>
                </motion.div>
              )) : (
                <div className="glass-card p-6 col-span-2 text-center py-12">
                  <Lightbulb className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Start your curriculum to see smart insights.</p>
                </div>
              )}
            </div>
          </section>

          {/* About Section - Finora Style */}
          <section className="glass-card p-8 md:p-12 bg-blue-600/5 border-blue-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-600/20 transition-all duration-500" />
            <div className="relative space-y-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Info className="w-6 h-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black tracking-tight">The Examora Engine</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                  Examora is now powered by a deterministic rule-based planning engine. It analyzes your curriculum structure, 
                  time constraints, and difficulty levels to produce an optimal study strategy without relying on cloud APIs.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="flex items-center gap-2 text-blue-500 font-bold hover:underline">
                    Learn more about Examora <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Expert Tips</h3>
            <div className="space-y-6">
              {studyTips.map((tip, idx) => (
                <div key={idx} className="flex gap-4 group cursor-default">
                  <div className={`mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${tip.color} transition-colors group-hover:bg-blue-500 group-hover:text-white`}>
                    <tip.icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black">{tip.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 bg-amber-500/5 border-amber-500/10">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500/70">Performance Alert</h3>
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 italic">
              "Consistency beats intensity. 30 minutes every day is better than a 10-hour marathon once a week."
            </p>
            <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-1/3" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
