import React, { useState } from 'react';
import { 
  Rocket, 
  ChevronDown,
  Sparkles,
  Zap,
  LogIn,
  FileText,
  Calendar,
  RefreshCcw,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Monitor,
  BarChart3,
  ListChecks,
  Repeat
} from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'motion/react';

interface AuthProps {
  onGuestLogin: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1],
      delay: 0.4
    }
  }
};

export default function Auth({ onGuestLogin }: AuthProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10 py-12"
        >
          {/* Left Content */}
          <div className="space-y-10 text-center lg:text-left">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5">
              <Rocket className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Pure Study Logic</span>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white font-display leading-[1.1] md:leading-[0.95]">
                Plan Your <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 dark:to-pink-400">Success</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-400 font-medium font-display leading-relaxed max-w-xl mx-auto lg:mx-0">
                A minimalist study architect designed for verified progress and consistent deep-work sessions.
              </p>
            </motion.div>

            <motion.ul variants={itemVariants} className="space-y-4 text-slate-500 text-base md:text-lg font-medium hidden sm:block">
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                No distractions, no fake AI, purely data-driven.
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                Verified completion tracking and syllabus management.
              </li>
            </motion.ul>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 px-4 sm:px-0">
              <button 
                onClick={() => document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 text-xs uppercase tracking-widest"
              >
                START PLANNING 🚀
              </button>
              <button 
                onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-white/10 active:scale-95 text-xs uppercase tracking-widest backdrop-blur-md"
              >
                Learn More
              </button>
            </motion.div>
          </div>

          {/* Right Content - Auth Card */}
          <motion.div 
            id="auth-card"
            variants={cardVariants}
            className="relative px-2 sm:px-0"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-20" />
            <div className="relative glass-card bg-[#0f172a]/80 p-8 sm:p-14 border-slate-800/50 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl flex flex-col items-center">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-white font-display uppercase">Examora</span>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-white font-display mb-2">Get Started</h2>
                <p className="text-slate-400 font-medium tracking-wide">Continue to your workspace</p>
              </div>

              <div className="w-full space-y-4">
                <motion.button 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={handleGoogleSignIn}
                   disabled={isLoggingIn}
                   className="w-full py-5 bg-white hover:bg-slate-50 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-black/5 disabled:opacity-50"
                >
                  <LogIn className="w-5 h-5 text-blue-600" />
                  <span className="uppercase tracking-[0.2em] text-[11px]">Continue with Google</span>
                </motion.button>

                <div className="relative py-4 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-slate-800" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">OR</span>
                  <div className="h-[1px] flex-1 bg-slate-800" />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGuestLogin}
                  className="w-full py-5 bg-slate-900 border border-blue-500/30 hover:border-blue-500/60 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all group shadow-sm"
                >
                  <Zap className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="uppercase tracking-[0.2em] text-[11px]">Continue as Guest ⚡</span>
                </motion.button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">
                  No Sign-up needed • Start Instantly
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-6 space-y-48 pb-48">
        
        {/* 🧠 WHAT IS EXAMORA? */}
        <motion.section 
          id="vision"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="space-y-16 text-center"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">The Vision</span>
            <h2 className="text-5xl md:text-7xl font-black text-white font-display tracking-tight">What is Examora?</h2>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="glass-card max-w-5xl mx-auto p-12 md:p-20 border-slate-800 bg-[#0f172a]/30 rounded-[3rem] relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <p className="text-2xl md:text-3xl text-slate-300 font-medium leading-relaxed font-display mb-16">
              Examora helps you convert your syllabus into a structured study plan so you always know what to study and when. It takes the guesswork out of preparation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8">
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto text-blue-500">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Convert Syllabus to Structure</p>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto text-blue-500">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Track Every Topic's Progress</p>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto text-blue-500">
                  <RefreshCcw className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Build Lifelong Consistency</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* ⚙️ HOW IT WORKS */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="space-y-20"
        >
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Step-By-Step</span>
            <h2 className="text-5xl md:text-7xl font-black text-white font-display tracking-tight">How it Works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard number="01" icon={FileText} title="Upload Syllabus" desc="Upload your PDF or enter your syllabus topics manually." />
            <StepCard number="02" icon={Calendar} title="Get a Plan" desc="Receive a high-structure study roadmap tailored to your time." />
            <StepCard number="03" icon={ListChecks} title="Daily Tasks" desc="Complete specific topics every day and mark them as done." />
            <StepCard number="04" icon={Repeat} title="Stay Consistent" desc="Built-in revision intervals help you retain knowledge longer." />
          </div>
        </motion.section>

        {/* 🚀 KEY FEATURES */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="space-y-20"
        >
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Core Tools</span>
            <h2 className="text-5xl md:text-7xl font-black text-white font-display tracking-tight">Everything you need</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FileText} 
              title="Smart Syllabus Breakdown" 
              desc="Automatically organizes your syllabus into clear topics and sections for easier management." 
            />
            <FeatureCard 
              icon={Calendar} 
              title="Auto Study Planner" 
              desc="Distributes topics across days based on your available time and exam date." 
            />
            <FeatureCard 
              icon={RefreshCcw} 
              title="Built-in Revision System" 
              desc="Adds strategic revision sessions to your calendar to improve long-term retention." 
            />
          </div>
        </motion.section>

        {/* 🎯 WHY CHOOSE EXAMORA & ACCESSIBILITY */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <motion.div 
            variants={itemVariants}
            className="space-y-10 glass-card p-10 md:p-14 border-slate-800 bg-[#0f172a]/30 rounded-[3rem] shadow-xl"
          >
            <h3 className="text-4xl font-black font-display text-white">Why use Examora?</h3>
            <ul className="space-y-8">
              <BenefitItem icon={CheckCircle2} title="STAY ORGANIZED" desc="Keep all your subjects and topics in one structured place." />
              <BenefitItem icon={ShieldCheck} title="AVOID LAST-MINUTE STRESS" desc="Planned progress prevents the panic of 'cramming' before exams." />
              <BenefitItem icon={Zap} title="BUILD CONSISTENCY" desc="Small daily wins lead to massive exam day success." />
              <BenefitItem icon={Rocket} title="FOCUS ON IMPORTANT TOPICS" desc="Identify what needs your attention most and prioritize it." />
              <BenefitItem icon={BookOpen} title="STUDY WITH CLARITY" desc="Clear direction every time you open your desk." />
            </ul>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col justify-center p-10 md:p-14 glass-card border-slate-800 bg-[#0f172a]/30 rounded-[3rem] space-y-8 shadow-xl"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <Monitor className="w-8 h-8" />
            </div>
            <h3 className="text-4xl font-black font-display text-white">Simple & Accessible</h3>
            <p className="text-slate-400 text-xl leading-relaxed font-medium">
              Experience a clean and easy-to-use interface that adapts to your device. Whether you're on a mobile, tablet, or desktop, your plan is always with you.
            </p>
            <div className="flex gap-4">
              <div className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Responsive</div>
              <div className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Clean UI</div>
            </div>
          </motion.div>
        </motion.div>

        {/* ⚡ ZERO SETUP */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center space-y-8"
        >
          <motion.span variants={itemVariants} className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Starting</motion.span>
          <motion.h2 variants={itemVariants} className="text-6xl md:text-8xl font-black text-white font-display tracking-tight leading-none uppercase">Zero Setup Required</motion.h2>
          <motion.p variants={itemVariants} className="text-slate-400 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
            Start your journey instantly. No login or complicated setup required to begin—just use Guest Mode and upgrade later if you want to sync across devices.
          </motion.p>
          <motion.div variants={itemVariants} className="w-32 h-1 bg-blue-600/50 mx-auto rounded-full blur-[1px]" />
        </motion.section>

        {/* 🚀 FINAL CTA */}
        <motion.section 
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="relative glass-card p-20 md:p-32 rounded-[4rem] overflow-hidden text-center group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 opacity-90 transition-transform duration-1000 group-hover:scale-105" />
          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl md:text-8xl font-black text-white font-display tracking-tight leading-[0.9]">
              Start your study journey <br/> with Examora today
            </h2>
            <p className="text-white/80 text-xl font-medium">Ready to stop procrastinating and start dominating your exams?</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGuestLogin}
              className="px-12 py-6 bg-white text-blue-600 font-black rounded-3xl text-xs uppercase tracking-widest shadow-2xl transition-all"
            >
              Build My Plan 🚀
            </motion.button>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row justify-between items-center gap-8">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">© 2026 EXAMORA • MADE FOR STUDENTS</p>
          <div className="flex gap-10">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <button key={link} className="text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">{link}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, desc }: { number: string; icon: any; title: string; desc: string }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="glass-card p-10 bg-[#0f172a]/20 border-slate-800 rounded-[2.5rem] relative group hover:bg-[#0f172a]/40 transition-all cursor-default"
    >
      <div className="absolute -top-4 -right-4 text-3xl font-black text-slate-800 font-display group-hover:text-blue-500/20 transition-colors">{number}</div>
      <div className="w-14 h-14 bg-blue-500/5 rounded-2xl flex items-center justify-center border border-slate-800/50 mb-8 group-hover:scale-110 group-hover:bg-blue-600 transition-all">
        <Icon className="w-6 h-6 text-blue-400 group-hover:text-white" />
      </div>
      <h3 className="text-2xl font-black text-white mb-4 font-display">{title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="glass-card p-10 bg-[#0f172a]/20 border-slate-800 rounded-[2.5rem] space-y-8 hover:translate-y-[-8px] transition-all group"
    >
      <div className="w-12 h-12 bg-blue-500/5 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-black text-white font-display uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function BenefitItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <motion.li 
      variants={itemVariants}
      className="flex gap-6"
    >
      <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
        <Icon className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-white uppercase tracking-widest">{title}</h4>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.li>
  );
}


