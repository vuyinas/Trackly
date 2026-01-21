
import React from 'react';
import { Event } from '../types';
import { CheckCircle2, Zap, ClipboardList, FileText, ShoppingCart, Ticket, ArrowRight, Share2, Printer } from 'lucide-react';

interface EventSummaryProps {
  event: Event;
  onViewModule: (tab: string) => void;
  onFinish: () => void;
}

const EventSummary: React.FC<EventSummaryProps> = ({ event, onViewModule, onFinish }) => {
  const modules = [
    { id: 'execution', label: 'Checklists', icon: ClipboardList, count: event.checklists.length, desc: 'Actionable department tasks' },
    { id: 'execution', label: 'Briefing Sheets', icon: FileText, count: 4, desc: 'Role-specific guidance' },
    { id: 'deliveries', label: 'Supply Chain', icon: ShoppingCart, count: 1, desc: 'Auto-scaled replenishment' },
    { id: 'ticketing', label: 'Ticketing Hub', icon: Ticket, count: event.ticketing?.tickets.length || 0, desc: 'Live sales tracking' },
  ];

  return (
    <div className="p-12 max-w-5xl mx-auto animate-in zoom-in-95 duration-500">
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 size={48} strokeWidth={3} />
        </div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Architecture Finalized</h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Your event has been woven into all Trackly modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {modules.map(mod => (
          <div 
            key={mod.label}
            onClick={() => onViewModule(mod.id)}
            className="bg-white p-10 rounded-[50px] border border-white/50 shadow-xl shadow-black/5 group hover:shadow-2xl transition-all cursor-pointer flex items-center gap-8"
          >
             <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/5 transition-all">
                <mod.icon size={28} />
             </div>
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <h4 className="text-lg font-black text-slate-800 tracking-tight">{mod.label}</h4>
                   <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black px-2 py-0.5 rounded-lg">{mod.count} Elements</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mod.desc}</p>
             </div>
             <ArrowRight size={20} className="text-slate-200 group-hover:text-brand-primary transition-all" />
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
         <button className="px-10 py-5 bg-white border border-slate-200 text-slate-500 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Share2 size={16} /> Share Overview
         </button>
         <button className="px-10 py-5 bg-white border border-slate-200 text-slate-500 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Printer size={16} /> Print Full Pack
         </button>
         <button 
          onClick={onFinish}
          className="px-16 py-5 bg-brand-primary text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3"
         >
            Finish & Return <Zap size={16} fill="currentColor" />
         </button>
      </div>
    </div>
  );
};

export default EventSummary;
