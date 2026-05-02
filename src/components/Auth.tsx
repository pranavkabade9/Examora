import React, { useState, useRef } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion, useScroll, useSpring } from 'motion/react';
import { 
  LogIn, Zap, AlertCircle, Loader2, Sparkles, BookOpen, 
  ShieldCheck, CheckCircle, Repeat, Layout, FileText, 
  Calendar, ListChecks, BarChart, ChevronDown, Monitor, Rocket
} from 'lucide-react';
import Logo from './Logo';

interface AuthProps {
  onGuestLogin: () => void;
}

export default function Auth({ onGuestLogin }: AuthProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed before completion. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Only one sign-in popup can be open at a time.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 selection:text-blue-200">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-[100]" style={{ scaleX }} />

      {/* 1. 🧠 HERO SECTION / LOGIN */}
      <section className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden pt-20">
        {/* Background Gradients */}
        <div className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] font-display">
              <Rocket className="w-3 h-3" />
              Build for consistency
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white font-display leading-[0.9]">
                Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Examora</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-medium font-display leading-relaxed max-w-xl">
                A smart study planner designed to help you stay organized, consistent, and exam-ready.
              </p>
              <div className="space-y-2 text-slate-500 text-base leading-relaxed max-w-lg font-medium">
                <p>• Turn your syllabus into a clear daily plan</p>
                <p>• Keep your study on track every single day</p>
                <p>• Make exam preparation simple and structured</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={scrollToAbout}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                Start Planning 🚀
              </button>
              <button 
                onClick={scrollToAbout}
                className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/10 active:scale-95 flex items-center gap-2"
              >
                Learn More <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 md:p-14 border-slate-800 bg-[#0f172a]/30 backdrop-blur-3xl rounded-[3rem] space-y-10 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="space-y-8 relative">
              <div className="flex justify-center mb-4">
                <Logo size="lg" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white font-display">Get Started</h2>
                <p className="text-slate-500 font-medium">Continue to your workspace</p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-100/70 leading-relaxed font-bold">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-5 px-6 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> Continue with Google</>}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]"><span className="px-4 bg-[#0f172a] text-slate-600">OR</span></div>
                </div>

                <button
                  onClick={onGuestLogin}
                  disabled={loading}
                  className="w-full py-5 px-6 bg-slate-900 border border-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all active:scale-[0.98] group"
                >
                  <Sparkles className="w-5 h-5 text-blue-400 group-hover:animate-pulse" />
                  Continue as Guest ⚡
                </button>
              </div>

              <p className="text-center text-[10px] font-black text-slate-700 uppercase tracking-widest">
                No sign-up needed • Start instantly
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT CONTENT */}
      <div ref={aboutRef} className="max-w-7xl mx-auto px-4 py-32 space-y-40">
        
        {/* 2. 💡 WHAT IS EXAMORA? */}
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <SectionHeading subtitle="The Vision" title="What is Examora?" />
          <div className="glass-card p-12 border-slate-800 bg-[#0f172a]/30 rounded-[3rem] space-y-8 text-left md:text-center relative overflow-hidden shadow-xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
             <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed font-display">
                Examora helps you convert your syllabus into a structured study plan so you always know what to study and when. It takes the guesswork out of preparation.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                <SimpleFeature icon={FileText} text="Convert syllabus to structure" />
                <SimpleFeature icon={BarChart} text="Track every topic's progress" />
                <SimpleFeature icon={Repeat} text="Build lifelong consistency" />
             </div>
          </div>
        </div>

        {/* 3. ⚙️ HOW IT WORKS */}
        <div className="space-y-20">
          <SectionHeading subtitle="Step-by-Step" title="How it Works" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard number="01" icon={FileText} title="Upload Syllabus" desc="Upload your PDF or enter your syllabus topics manually." />
            <StepCard number="02" icon={Calendar} title="Get a Plan" desc="Receive a high-structure study roadmap tailored to your time." />
            <StepCard number="03" icon={ListChecks} title="Daily Tasks" desc="Complete specific topics every day and mark them as done." />
            <StepCard number="04" icon={Repeat} title="Stay Consistent" desc="Built-in revision intervals help you retain knowledge longer." />
          </div>
        </div>

        {/* 4. 🚀 KEY FEATURES */}
        <div className="space-y-20">
          <SectionHeading subtitle="Core Tools" title="Everything you need" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FileText} 
              title="Smart Syllabus Breakdown" 
              desc="Automatically organizes your syllabus into clear topics and sections for easier management." 
              color="bg-blue-500/10 text-blue-500"
            />
            <FeatureCard 
              icon={Calendar} 
              title="Auto Study Planner" 
              desc="Distributes topics across days based on your available time and exam date." 
              color="bg-purple-500/10 text-purple-500"
            />
            <FeatureCard 
              icon={Repeat} 
              title="Built-in Revision System" 
              desc="Adds strategic revision sessions to your calendar to improve long-term retention." 
              color="bg-emerald-500/10 text-emerald-500"
            />
            <FeatureCard 
              icon={ListChecks} 
              title="Task Tracking" 
              desc="Mark tasks as completed and stay on track with your study goals." 
              color="bg-amber-500/10 text-amber-500"
            />
            <FeatureCard 
              icon={BarChart} 
              title="Progress Tracking" 
              desc="Monitor your study progress with simple, motivating visuals and charts." 
              color="bg-rose-500/10 text-rose-500"
            />
            <FeatureCard 
              icon={Layout} 
              title="Custom Study Preferences" 
              desc="Adjust your plan based on your unique study style, difficulty levels, and schedule." 
              color="bg-indigo-500/10 text-indigo-500"
            />
          </div>
        </div>

        {/* 5. 🎯 WHY USE EXAMORA? + 6. 📱 EXPERIENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-8 glass-card p-10 md:p-14 border-slate-800 bg-[#0f172a]/30 rounded-[3rem]">
              <h3 className="text-3xl font-black font-display text-white">Why use Examora?</h3>
              <ul className="space-y-6">
                <BenefitItem icon={CheckCircle} title="Stay organized" desc="Keep all your subjects and topics in one structured place." />
                <BenefitItem icon={ShieldCheck} title="Avoid last-minute stress" desc="Planned progress prevents the panic of 'cramming' before exams." />
                <BenefitItem icon={Zap} title="Build consistency" desc="Small daily wins lead to massive exam day success." />
                <BenefitItem icon={Rocket} title="Focus on important topics" desc="Identify what needs your attention most and prioritize it." />
                <BenefitItem icon={BookOpen} title="Study with clarity" desc="Clear direction every time you open your desk." />
              </ul>
           </div>

           <div className="space-y-8 glass-card p-10 md:p-14 border-slate-800 bg-blue-600/5 rounded-[3rem] flex flex-col justify-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black font-display text-white">Simple & Accessible</h3>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Experience a clean and easy-to-use interface that adapts to your device. Whether you're on a mobile, tablet, or desktop, your plan is always with you.
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Responsive</div>
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Clean UI</div>
              </div>
           </div>
        </div>

        {/* 7. 🔐 EASY TO START */}
        <div className="text-center space-y-8 py-20 border-y border-slate-900/50">
           <SectionHeading title="Zero Setup Required" subtitle="Starting" />
           <p className="max-w-2xl mx-auto text-slate-400 text-lg font-medium leading-relaxed">
             Start your journey instantly. No login or complicated setup required to begin—just use Guest Mode and upgrade later if you want to sync across devices.
           </p>
           <div className="w-20 h-1 bg-blue-600/20 mx-auto rounded-full" />
        </div>

        {/* 8. 🚀 CALL TO ACTION */}
        <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-blue-600 to-purple-800 p-16 md:p-24 text-center space-y-10 group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 blur-[100px] -ml-48 -mb-48 transition-transform group-hover:scale-110" />
           
           <div className="relative z-10 space-y-6">
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white font-display leading-tight">
               Start your study journey<br />with Examora today
             </h2>
             <p className="text-white/70 text-xl font-medium max-w-xl mx-auto leading-relaxed">
               Ready to stop procrastinating and start dominating your exams?
             </p>
           </div>
           
           <div className="relative z-10 pt-6">
             <button 
                onClick={scrollToTop}
                className="px-14 py-6 bg-white text-blue-700 font-black text-sm uppercase tracking-[0.3em] rounded-[2rem] hover:shadow-2xl hover:shadow-white/20 transition-all active:scale-95 group"
             >
                Build My Plan 🚀
             </button>
           </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 py-20 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">© 2026 EXAMORA LABS</span>
        </div>
        <div className="flex gap-8">
           <FooterLink href="#">Privacy</FooterLink>
           <FooterLink href="#">Terms</FooterLink>
           <FooterLink href="#">Docs</FooterLink>
           <FooterLink href="#">Support</FooterLink>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="space-y-4 text-center">
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 font-display">{subtitle}</h4>
      <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white font-display">{title}</h2>
    </div>
  );
}

function SimpleFeature({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{text}</p>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, desc }: { number: string, icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="glass-card p-10 border-slate-800 bg-[#0f172a]/30 rounded-[2.5rem] space-y-6 relative group overflow-hidden"
    >
      <div className="absolute top-4 right-6 text-2xl font-black text-slate-800 font-display group-hover:text-blue-500/20 transition-colors">{number}</div>
      <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-black text-white font-display">{title}</h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="glass-card p-10 border-slate-800 bg-[#0f172a]/30 rounded-[2.5rem] space-y-6"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-black text-white font-display">{title}</h4>
        <p className="text-sm text-slate-400 font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function BenefitItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <li className="flex items-start gap-5">
      <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h5 className="font-black text-white text-sm uppercase tracking-widest leading-none">{title}</h5>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <a href={href} className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">
      {children}
    </a>
  );
}

