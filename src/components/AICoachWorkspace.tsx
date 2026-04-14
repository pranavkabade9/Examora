import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Send, Sparkles, BookOpen, Target, 
  History, Brain, Zap, HelpCircle, RefreshCcw,
  ChevronRight, MessageSquare, AlertCircle,
  Lightbulb, CheckCircle2, Info, ArrowRight,
  Loader2, User, Menu, X, LayoutGrid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { askAI } from '../lib/gemini';
import SuggestionCard, { Suggestion } from './SuggestionCard';

interface AICoachWorkspaceProps {
  syllabus?: any;
  plan?: any;
  memory?: any;
  suggestions?: Suggestion[];
  onUpdateMemory?: (newWeakTopics: string[]) => void;
}

interface AIResponse {
  title?: string;
  explanation: string;
  examples?: string[];
  keyPoints?: string[];
  commonMistakes?: string[];
  tips?: string;
  followUpQuestion?: string;
  nextActions?: { label: string; action: string }[];
}

import { useSettingsStore } from '../store/useSettingsStore';

export default function AICoachWorkspace({ syllabus, plan, memory, suggestions, onUpdateMemory }: AICoachWorkspaceProps) {
  const { settings } = useSettingsStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'learn' | 'practice' | 'test' | 'revise'>('learn');
  const [history, setHistory] = useState<{ role: 'user' | 'ai', content: string, structured?: AIResponse }[]>([]);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);
  
  const handleAction = async (actionText: string, customMode?: any) => {
    if (loading) return;
    setLoading(true);
    setShowLeftPanel(false);
    setShowRightPanel(false);
    
    const currentMode = customMode || mode;
    
    try {
      const context = {
        syllabus,
        plan,
        memory,
        history: history.slice(-5).map(h => ({ role: h.role, content: h.content })),
        mode: currentMode,
        settings
      };

      const response = await askAI(actionText, context);
      
      if (response.updatedWeakTopics && onUpdateMemory) {
        onUpdateMemory(response.updatedWeakTopics);
      }

      setHistory(prev => [...prev, { 
        role: 'ai', 
        content: response.explanation,
        structured: response
      }]);
    } catch (error) {
      console.error('AI Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    handleAction(userMsg);
  };

  const LeftPanel = () => (
    <div className="flex flex-col gap-6 h-full">
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
          <Target className="w-5 h-5" />
          <h3 className="font-bold uppercase tracking-wider text-xs">Current Focus</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900 dark:text-white/90">
            {syllabus?.title || "No Syllabus Loaded"}
          </p>
          <div className="h-1.5 w-full bg-slate-500/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-1/3 rounded-full glow-blue" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-white/40">33% of syllabus covered</p>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-orange-400">
          <Brain className="w-5 h-5" />
          <h3 className="font-bold uppercase tracking-wider text-xs">Weak Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {memory?.weakTopics?.length > 0 ? (
            memory.weakTopics.map((topic: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[10px] text-orange-200">
                {topic}
              </span>
            ))
          ) : (
            <p className="text-xs text-white/30 italic">No weak topics identified yet.</p>
          )}
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
          <History className="w-5 h-5" />
          <h3 className="font-bold uppercase tracking-wider text-xs">Recent Questions</h3>
        </div>
        <div className="space-y-3">
          {history.filter(h => h.role === 'user').slice(-3).map((h, i) => (
            <button 
              key={i}
              onClick={() => handleAction(h.content)}
              className="w-full text-left text-xs text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white/90 transition-colors line-clamp-1 flex items-center gap-2"
            >
              <ChevronRight className="w-3 h-3 shrink-0" />
              {h.content}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const RightPanel = () => (
    <div className="flex flex-col gap-6 h-full">
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Zap className="w-5 h-5" />
          <h3 className="font-bold uppercase tracking-wider text-xs">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: "Explain Again", icon: RefreshCcw, action: "Can you explain the last topic again but simpler?" },
            { label: "Give Examples", icon: Sparkles, action: "Give me 3 more real-world examples for this." },
            { label: "Test Me", icon: HelpCircle, action: "Ask me a challenging question on this topic.", mode: 'test' },
            { label: "Generate Quiz", icon: MessageSquare, action: "Generate a 5-question quiz for today's plan.", mode: 'practice' },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() => handleAction(btn.action, btn.mode)}
              className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all group"
            >
              <btn.icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
              <div className="flex items-center gap-2 text-yellow-400 px-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Examora Suggestions</h3>
              </div>
        <div className="space-y-3">
          {suggestions?.map((s, i) => (
            <SuggestionCard key={i} suggestion={s} />
          ))}
          {(!suggestions || suggestions.length === 0) && (
            <div className="glass-card p-5 text-center space-y-2 opacity-40">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              <p className="text-[10px] uppercase tracking-widest">Analyzing performance...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 overflow-hidden relative">
      {/* Mobile Headers */}
      <div className="lg:hidden flex items-center justify-between px-2 mb-2">
        <button 
          onClick={() => setShowLeftPanel(true)}
          className="p-3 glass-card rounded-xl text-blue-400"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-white">Examora AI Coach</span>
        </div>
        <button 
          onClick={() => setShowRightPanel(true)}
          className="p-3 glass-card rounded-xl text-yellow-400"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>

      {/* LEFT PANEL: Context Sidebar (Desktop) */}
      <div className="hidden lg:block w-80 overflow-y-auto pr-2 custom-scrollbar">
        <LeftPanel />
      </div>

      {/* LEFT PANEL: Context Sidebar (Mobile Drawer) */}
      <AnimatePresence>
        {showLeftPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeftPanel(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="lg:hidden fixed top-0 left-0 h-full w-[80%] bg-white dark:bg-[#0a0a0a] z-[101] p-6 overflow-y-auto border-r border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Study Context</h2>
                <button onClick={() => setShowLeftPanel(false)}><X className="text-slate-400 dark:text-white/40" /></button>
              </div>
              <LeftPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CENTER PANEL: Main AI Interface */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden glass-card lg:bg-transparent lg:border-none">
        <div className="flex items-center justify-between px-4 pt-4 lg:pt-0">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {(['learn', 'practice', 'test', 'revise'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  mode === m 
                    ? "bg-blue-500 text-white glow-blue" 
                    : "bg-slate-500/5 dark:bg-white/5 text-slate-400 dark:text-white/40 hover:bg-slate-500/10 dark:hover:bg-white/10"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-400 dark:text-white/40 text-[10px] uppercase tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Examora Online
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar"
        >
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60 px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center glow-blue">
                <Bot className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-bold">Ready to Learn?</h2>
                <p className="max-w-md text-xs md:text-sm text-slate-500 dark:text-white/60">
                  Select a mode above and ask Examora anything about your syllabus. 
                  I'll guide you through concepts, practice problems, and exam strategies.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button 
                  onClick={() => handleAction("Explain the most important topic for my exam")}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs transition-all"
                >
                  Important Topics
                </button>
                <button 
                  onClick={() => handleAction("Test my knowledge on today's plan", 'test')}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs transition-all"
                >
                  Quick Test
                </button>
              </div>
            </div>
          )}

          {history.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 md:gap-4",
                item.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border",
                item.role === 'ai' ? "bg-blue-500/20 border-blue-500/30 text-blue-500 dark:text-blue-400" : "bg-slate-500/10 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-600 dark:text-white"
              )}>
                {item.role === 'ai' ? <Bot className="w-5 h-5 md:w-6 h-6" /> : <User className="w-5 h-5 md:w-6 h-6" />}
              </div>

              <div className={cn(
                "max-w-[85%] md:max-w-2xl space-y-4",
                item.role === 'user' ? "text-right" : "text-left"
              )}>
                {item.role === 'user' ? (
                  <div className="bg-blue-600 text-white p-3 md:p-4 rounded-2xl inline-block text-xs md:text-sm shadow-lg">
                    {item.content}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {item.structured ? (
                      <div className="glass-card p-4 md:p-6 space-y-6 border-blue-500/20">
                        {item.structured.title && (
                          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <BookOpen className="w-5 h-5 md:w-6 h-6 text-blue-400" />
                            <h2 className="text-lg md:text-xl font-bold text-white/90">{item.structured.title}</h2>
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 md:w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-1" />
                            <p className="text-xs md:text-sm text-slate-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap">
                              {item.structured.explanation}
                            </p>
                          </div>

                          {item.structured.examples && item.structured.examples.length > 0 && (
                            <div className="space-y-3 p-3 md:p-4 bg-slate-500/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                                <Sparkles className="w-3 h-3" />
                                Examples
                              </div>
                              <ul className="space-y-2">
                                {item.structured.examples.map((ex, idx) => (
                                  <li key={idx} className="text-xs md:text-sm text-slate-600 dark:text-white/70 italic flex gap-2">
                                    <span className="text-blue-500 dark:text-blue-400">•</span>
                                    {ex}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {item.structured.keyPoints && item.structured.keyPoints.length > 0 && (
                              <div className="space-y-3 p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-400/60">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Key Points
                                </div>
                                <ul className="space-y-1">
                                  {item.structured.keyPoints.map((p, idx) => (
                                    <li key={idx} className="text-[10px] md:text-xs text-white/60">{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.structured.commonMistakes && item.structured.commonMistakes.length > 0 && (
                              <div className="space-y-3 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400/60">
                                  <AlertCircle className="w-3 h-3" />
                                  Common Mistakes
                                </div>
                                <ul className="space-y-1">
                                  {item.structured.commonMistakes.map((m, idx) => (
                                    <li key={idx} className="text-[10px] md:text-xs text-white/60">{m}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {item.structured.tips && (
                            <div className="p-3 md:p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 flex gap-3">
                              <Lightbulb className="w-4 h-4 md:w-5 h-5 text-yellow-400 shrink-0" />
                              <p className="text-xs md:text-sm text-yellow-200/70 italic">{item.structured.tips}</p>
                            </div>
                          )}

                          {item.structured.followUpQuestion && (
                            <div className="p-4 md:p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                                <HelpCircle className="w-3 h-3" />
                                Challenge
                              </div>
                              <p className="text-xs md:text-sm font-medium text-white/90">{item.structured.followUpQuestion}</p>
                              <button 
                                onClick={() => handleAction("Answer the challenge question")}
                                className="text-[10px] md:text-xs text-blue-400 hover:underline flex items-center gap-1"
                              >
                                I'm ready to answer <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {item.structured.nextActions && (
                            <div className="flex flex-wrap gap-2 pt-4">
                              {item.structured.nextActions.map((action, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleAction(action.label)}
                                  className="px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] md:text-xs font-medium transition-all flex items-center gap-2"
                                >
                                  {action.label}
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="glass-card p-3 md:p-4 text-xs md:text-sm text-white/80 leading-relaxed">
                        {item.content}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Loader2 className="w-5 h-5 md:w-6 h-6 animate-spin" />
              </div>
              <div className="glass-card p-3 md:p-4 flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-400 rounded-full animate-bounce" />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-white/40 font-medium uppercase tracking-widest">Examora is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-4 bg-slate-500/5 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 rounded-b-3xl">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 md:py-4 pl-4 md:pl-6 pr-14 md:pr-16 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 text-slate-900 dark:text-white"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg glow-blue"
            >
              <Send className="w-4 h-4 md:w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Quick Actions & Suggestions (Desktop) */}
      <div className="hidden lg:block w-80 overflow-y-auto pr-2 custom-scrollbar">
        <RightPanel />
      </div>

      {/* RIGHT PANEL: Quick Actions & Suggestions (Mobile Drawer) */}
      <AnimatePresence>
        {showRightPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRightPanel(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="lg:hidden fixed top-0 right-0 h-full w-[80%] bg-white dark:bg-[#0a0a0a] z-[101] p-6 overflow-y-auto border-l border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Quick Actions</h2>
                <button onClick={() => setShowRightPanel(false)}><X className="text-slate-400 dark:text-white/40" /></button>
              </div>
              <RightPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
