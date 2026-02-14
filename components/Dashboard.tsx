
import React, { useMemo } from 'react';
import { Task, Email, TeamMember, TaskStatus, PresenceStatus, Event, ProcurementOrder, UserRole, DeliveryCategory, Business } from '../types';
import { Activity, CheckCircle, TrendingUp, Layout, Mail, MessageSquare, ShieldAlert, AlertTriangle, Zap, Truck, Lock, Radio } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  emails: Email[];
  team: TeamMember[];
  events?: Event[];
  procurement?: ProcurementOrder[];
  user?: TeamMember;
  businesses: Business[];
  onViewEmails?: () => void;
  onUpdatePresence?: (status: PresenceStatus, expiry?: string) => void;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, emails, team, events = [], procurement = [], user, businesses, onViewEmails, onUpdatePresence, setActiveTab }) => {
  const isAuthorized = user?.role === UserRole.OWNER || user?.role === UserRole.MANAGER;

  const stats = useMemo(() => {
    const total = tasks.length || 1;
    const done = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const progressAvg = tasks.reduce((s, t) => s + t.progress, 0) / total;
    
    return [
      { id: 'fulfillment', label: 'Service Velocity', value: `${Math.round(progressAvg)}%`, icon: Activity, color: 'text-brand-primary' },
      { id: 'archived', label: 'Resolved Traces', value: done.toString(), icon: CheckCircle, color: 'text-emerald-500' },
      { id: 'active', label: 'Active Objectives', value: (total - done).toString(), icon: Layout, color: 'text-indigo-500' },
    ];
  }, [tasks]);

  const getBiz = (id: string) => businesses.find(b => b.id === id);

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Pulse</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time brand synchronization and operational health.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-[20px] shadow-xl border border-slate-100">
           <TrendingUp className="text-brand-primary" size={20} />
           <span className="text-xs font-black text-slate-800 uppercase tracking-widest">+12% Velocity</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((s) => (
          <button key={s.id} onClick={() => setActiveTab('tasks')} className="bg-white p-8 rounded-[40px] shadow-xl border border-white/50 hover:scale-102 transition-transform text-left group">
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors`}>
              <s.icon size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">{s.label}</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic">{s.value}</h3>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Priority Action Registry</h3>
            <div className="space-y-4">
              {tasks.filter(t => t.priority === 'critical' && t.status !== TaskStatus.DONE).map(task => {
                 const biz = getBiz(task.context);
                 return (
                  <div key={task.id} className="p-6 rounded-[35px] border-2 bg-white border-red-100 shadow-xl flex items-center justify-between group hover:border-red-500 transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 animate-pulse"><ShieldAlert size={24} /></div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Critical Objective</span>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200" style={{ borderColor: biz?.primaryColor + '40' }}>
                                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: biz?.primaryColor }} />
                                 <span className="text-[7px] font-black uppercase" style={{ color: biz?.primaryColor }}>{biz?.prefix} Protocol</span>
                              </div>
                           </div>
                           <h4 className="text-lg font-black text-slate-800 uppercase italic tracking-tight leading-none">{task.title}</h4>
                        </div>
                     </div>
                     <button onClick={() => setActiveTab('tasks')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest">Resolve</button>
                  </div>
              )})}
              
              {tasks.filter(t => t.priority === 'critical' && t.status !== TaskStatus.DONE).length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[50px] opacity-30 flex flex-col items-center justify-center gap-4">
                   <CheckCircle size={60} strokeWidth={1} />
                   <p className="font-black uppercase tracking-[0.3em] text-xs italic">Registry Synchronized</p>
                </div>
              )}
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px]">
               <div className="absolute top-0 right-0 p-8 text-white/5"><MessageSquare size={120} /></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter italic uppercase leading-tight mb-6">Insight AI</h3>
                  <div className="p-6 bg-white/5 rounded-[35px] border border-white/10">
                     <p className="text-xs font-bold text-white/80 leading-relaxed italic">
                       "Aggregate data shows a synergy window between The Yard and Sunday Theory on Friday nights. Recommended cross-brand staffing efficiency: 15% increase."
                     </p>
                  </div>
               </div>
               <button onClick={() => setActiveTab('insights')} className="relative z-10 w-full py-5 bg-white text-slate-900 rounded-[25px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">Audit Scaling Logic</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
