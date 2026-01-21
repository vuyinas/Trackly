
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, ShieldAlert, Coffee, Timer, Target, Zap, Activity, Brain, TrendingUp, AlertCircle, Calendar, Heart, ArrowRight, Stars, Sparkles } from 'lucide-react';
import { Meeting } from '../types';

interface BreakLockoutProps {
  workTimeInMinutes: number;
  maxWorkTime: number; 
  showDashboard?: boolean;
  onPlanWellness?: (meeting: Omit<Meeting, 'id'>) => void;
}

const WELLNESS_ACTIVITIES = [
  // Fix: changed 'stars' to 'Stars' to match imported component name
  { title: "Team Coastal Hike", desc: "A scenic walk along the Sea Point promenade or Lion's Head.", icon: Stars, color: "text-emerald-500", duration: "120m" },
  { title: "Studio Yoga Session", desc: "Guided relaxation and stretching to reset operational stress.", icon: Heart, color: "text-rose-500", duration: "60m" },
  { title: "Team Breakfast Brunch", desc: "Non-work meal at a partner venue to boost social morale.", icon: Coffee, color: "text-amber-500", duration: "90m" },
  { title: "Art & Mural Tour", desc: "Exploring local creativity to spark inspiration for events.", icon: Activity, color: "text-indigo-500", duration: "120m" }
];

const BreakLockout: React.FC<BreakLockoutProps> = ({ workTimeInMinutes, maxWorkTime, showDashboard = true, onPlanWellness }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [breakTimer, setBreakTimer] = useState(0);

  const timeLeft = maxWorkTime - workTimeInMinutes;
  const isWarning = timeLeft <= 15 && timeLeft > 0;

  useEffect(() => {
    if (workTimeInMinutes >= maxWorkTime) {
      setIsLocked(true);
      setBreakTimer(15 * 60); 
    }
  }, [workTimeInMinutes, maxWorkTime]);

  useEffect(() => {
    let interval: any;
    if (isLocked && breakTimer > 0) {
      interval = setInterval(() => setBreakTimer(prev => prev - 1), 1000);
    } else if (breakTimer === 0 && isLocked) {
      setIsLocked(false);
    }
    return () => clearInterval(interval);
  }, [isLocked, breakTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const recoveryScore = useMemo(() => {
    const ratio = (workTimeInMinutes / maxWorkTime) * 100;
    return Math.max(0, 100 - ratio);
  }, [workTimeInMinutes, maxWorkTime]);

  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-slate-950/95 z-[9999] flex items-center justify-center p-6 backdrop-blur-md">
        <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-300">
          <div className="relative mx-auto w-32 h-32 flex items-center justify-center bg-brand-primary rounded-full shadow-[0_0_50px_rgba(175,67,29,0.3)]">
            <Coffee size={64} className="text-white animate-bounce" />
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase italic leading-none">System Locked</h1>
          <p className="text-slate-400 text-lg font-medium italic">Mandatory 15-minute replenishment period active.</p>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Time Remaining</p>
            <div className="text-6xl font-mono font-bold text-brand-accent tabular-nums italic">{formatTime(breakTimer)}</div>
          </div>
        </div>
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="p-12 space-y-12 animate-in fade-in duration-500">
         <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Wellness Intelligence</h2>
              <div className="flex items-center gap-3">
                 <div className="h-1 w-20 bg-brand-primary rounded-full" />
                 <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Strategic workforce health monitoring and cognitive analytics.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-10 rounded-[50px] border border-white/50 shadow-xl">
                <Clock size={28} className="text-brand-primary mb-6" />
                <h3 className="font-black text-slate-800 uppercase italic text-xl mb-2">Session Time</h3>
                <div className="text-6xl font-black text-slate-900 italic tracking-tighter">{workTimeInMinutes}m</div>
              </div>
              <div className="bg-white p-10 rounded-[50px] border border-white/50 shadow-xl">
                <Activity size={28} className="text-emerald-500 mb-6" />
                <h3 className="font-black text-slate-800 uppercase italic text-xl mb-2">Recovery Score</h3>
                <div className="text-6xl font-black text-emerald-500 italic tracking-tighter">{Math.round(recoveryScore)}%</div>
              </div>
              <div className="bg-[#1A1A1A] p-10 rounded-[50px] shadow-2xl text-white">
                <Timer size={28} className="text-brand-primary mb-6" />
                <h3 className="font-black text-white uppercase italic text-xl mb-2">Cycle Threshold</h3>
                <div className="text-6xl font-black text-brand-primary italic tracking-tighter">240m</div>
              </div>
            </div>

            {/* Team Wellness Section */}
            <div className="space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-800 flex items-center gap-4">
                     <Stars className="text-brand-primary" size={32} /> Team Wellness Architect
                  </h3>
                  <div className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
                     <Sparkles size={14} fill="currentColor" /> Recommended Cycle: Every 45 Days
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {WELLNESS_ACTIVITIES.map((act, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border-2 border-slate-50 hover:border-brand-primary/20 shadow-xl shadow-black/5 transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <div className={`p-4 rounded-2xl bg-slate-50 ${act.color} group-hover:scale-110 transition-transform`}>
                             <act.icon size={28} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{act.duration} Window</span>
                       </div>
                       <h4 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter mb-2">{act.title}</h4>
                       <p className="text-sm font-bold text-slate-500 italic leading-relaxed mb-8">"{act.desc}"</p>
                       <button 
                        onClick={() => onPlanWellness?.({
                          title: act.title,
                          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          startTime: "09:00",
                          endTime: "11:00",
                          attendees: [],
                          type: 'wellness',
                          notes: `Planned via Wellness Architect: ${act.desc}`
                        })}
                        className="w-full py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-primary transition-all shadow-lg"
                       >
                         Authorize Wellness Day <ArrowRight size={14} />
                       </button>
                    </div>
                  ))}
               </div>

               <div className="bg-brand-primary/5 border border-brand-primary/10 p-10 rounded-[50px] flex items-center gap-10">
                  <div className="w-20 h-20 bg-brand-primary rounded-[30px] flex items-center justify-center text-white shadow-xl shrink-0">
                     <Calendar size={36} />
                  </div>
                  <div>
                     <h4 className="text-2xl font-black text-brand-primary uppercase italic tracking-tighter mb-2">Strategic Planning Advice</h4>
                     <p className="text-sm font-bold text-slate-600 italic leading-relaxed max-w-2xl">
                        "System analysis suggests the next Wellness Day should be scheduled within 12 days to mitigate peak shift exhaustion from recent high-attendance events. Focus on a low-impact social activity."
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return null;
};

export default BreakLockout;
