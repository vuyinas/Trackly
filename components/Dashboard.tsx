
import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Task, Email, TeamMember, TaskStatus, PresenceStatus } from '../types';
import { Activity, Users, Mail, CheckCircle, TrendingUp, AlertCircle, Clock, ArrowRight, Repeat, MessageSquare, Zap, Target, BellOff, X, Layout } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  emails: Email[];
  team: TeamMember[];
  user?: TeamMember;
  onViewEmails?: () => void;
  onUpdatePresence?: (status: PresenceStatus, expiry?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, emails, team, user, onViewEmails, onUpdatePresence }) => {
  const [focusTimeRemaining, setFocusTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (user?.status === PresenceStatus.FOCUS && user.statusExpiresAt) {
      const expiry = new Date(user.statusExpiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setFocusTimeRemaining(diff);

      const timer = setInterval(() => {
        setFocusTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setFocusTimeRemaining(null);
    }
  }, [user?.status, user?.statusExpiresAt]);

  const stats = useMemo(() => {
    const total = tasks.length || 1;
    const done = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const progressAvg = tasks.reduce((s, t) => s + t.progress, 0) / total;
    
    return [
      { label: 'Overall Fulfillment', value: `${Math.round(progressAvg)}%`, icon: Activity, color: 'text-brand-primary' },
      { label: 'Archived Objectives', value: done.toString(), icon: CheckCircle, color: 'text-emerald-500' },
      { label: 'Live Active Traces', value: (total - done).toString(), icon: Layout, color: 'text-indigo-500' },
    ];
  }, [tasks]);

  const missedEmails = useMemo(() => emails.filter(e => !e.isResponded && (new Date().getTime() - new Date(e.receivedAt).getTime() > 24 * 60 * 60 * 1000)), [emails]);
  const urgentTasks = useMemo(() => tasks.filter(t => {
    if (t.status === TaskStatus.DONE) return false;
    const hoursLeft = (new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft < 12;
  }), [tasks]);
  const recurringToday = useMemo(() => tasks.filter(t => t.isRecurring && t.status !== TaskStatus.DONE), [tasks]);

  const handleStartFocus = (minutes: number) => {
    if (onUpdatePresence) {
      const expiry = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      onUpdatePresence(PresenceStatus.FOCUS, expiry);
    }
  };

  const handleCancelFocus = () => {
    if (onUpdatePresence) {
      onUpdatePresence(PresenceStatus.AT_DESK);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Strategic Pulse</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time operational trace analytics.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-[20px] shadow-xl shadow-black/5 border border-white/40">
           <TrendingUp className="text-brand-primary" size={20} />
           <span className="text-xs font-black text-slate-800 uppercase tracking-widest">+12% Velocity</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-white/50 hover:scale-[1.02] transition-transform cursor-pointer group">
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors`}>
              <s.icon size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">{s.label}</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[50px] shadow-2xl border-2 border-brand-primary/10 overflow-hidden relative group">
               {user?.status === PresenceStatus.FOCUS ? (
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                       <div className="w-20 h-20 bg-brand-primary rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-brand-primary/30 animate-pulse">
                          <Target size={40} />
                       </div>
                       <div>
                          <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">Deep Focus Active</h3>
                          <div className="flex items-center gap-3">
                             <div className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-red-100">
                                <BellOff size={10} /> DND Port Locked
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">• No disruptions allowed</p>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Remaining</p>
                       <p className="text-5xl font-mono font-black text-slate-800 tabular-nums italic">
                          {focusTimeRemaining !== null ? formatTime(focusTimeRemaining) : '00:00'}
                       </p>
                       <button onClick={handleCancelFocus} className="mt-4 text-[9px] font-black uppercase text-red-400 hover:text-red-500 flex items-center gap-1 ml-auto">
                          <X size={10} /> Exit Session
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-md">
                       <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-4">Focus Command</h3>
                       <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                         Enter deep work mode to complete complex spatial objectives without disturbances.
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                       {[
                         { m: 30, label: '30m Burst' },
                         { m: 60, label: '1h Session' },
                         { m: 90, label: '1.5h Focus' },
                         { m: 120, label: '2h Deep Work' }
                       ].map(btn => (
                         <button 
                           key={btn.m}
                           onClick={() => handleStartFocus(btn.m)}
                           className="bg-slate-50 hover:bg-brand-primary hover:text-white px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border border-slate-100"
                         >
                           {btn.label}
                         </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Critical Trace Priority</h3>
              <div className="bg-red-50 text-red-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-red-100">
                <AlertCircle size={12} /> Velocity Alerts Enabled
              </div>
            </div>

            <div className="space-y-4">
              {urgentTasks.map(task => (
                <div key={task.id} className="bg-white p-6 rounded-[35px] border-2 border-amber-50 shadow-xl shadow-red-500/5 flex items-center justify-between group hover:border-amber-200 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm animate-pulse">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Due within 12h</p>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black text-indigo-500 uppercase italic">Location: {task.context.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>
              ))}

              {recurringToday.map(task => (
                <div key={task.id} className="bg-white p-6 rounded-[35px] border-2 border-slate-50 shadow-xl shadow-black/5 flex items-center justify-between group hover:border-brand-primary/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm">
                      <Repeat size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Standard Protocol</p>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{task.title}</h4>
                    </div>
                  </div>
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="bg-brand-primary h-full transition-all duration-1000" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>
              ))}

              {urgentTasks.length === 0 && recurringToday.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[50px] opacity-30 flex flex-col items-center justify-center gap-4">
                   <CheckCircle size={60} strokeWidth={1} />
                   <p className="font-black uppercase tracking-[0.3em] text-xs italic">Trace Synchronized</p>
                </div>
              )}
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
               <div className="absolute top-0 right-0 p-8 text-white/5">
                 <MessageSquare size={120} />
               </div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter italic uppercase leading-tight mb-6">Trace Insight AI</h3>
                  <div className="space-y-6">
                     <div className="p-6 bg-brand-primary/20 rounded-[35px] border border-brand-primary/30">
                        <p className="text-xs font-bold text-white/80 leading-relaxed italic">
                          "System detects a 20% faster completion rate in The Yard compared to Sunday Theory. Analysis suggests clearer task definitions are boosting fulfillment speed."
                        </p>
                     </div>
                  </div>
               </div>
               <button className="relative z-10 w-full py-5 bg-white text-slate-900 rounded-[25px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-transform">
                  Process Productivity Pack
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
