
import React, { useState, useMemo, useEffect } from 'react';
import { Event, ChecklistCategory, ProjectContext, UserRole, ChecklistItem, BriefSignature, EventBriefs } from '../types';
import { ClipboardList, CheckCircle2, Circle, Clock, ChefHat, Wine, Users, ShieldCheck, Zap, Info, AlertTriangle, ArrowRight, Flag, Headphones, Briefcase, Fingerprint, Cake, Star, Shield, ListChecks, Smartphone, Lightbulb } from 'lucide-react';

interface EventExecutionModuleProps {
  events: Event[];
  context: ProjectContext;
  currentUser: { id: string, name: string, email: string };
  onUpdateChecklist: (eventId: string, itemId: string, status: 'todo' | 'in-progress' | 'done') => void;
  onSignBrief: (eventId: string, briefType: 'kitchen' | 'bar' | 'office' | 'management', signature: BriefSignature) => void;
}

const EventExecutionModule: React.FC<EventExecutionModuleProps> = ({ 
  events, context, currentUser, onUpdateChecklist, onSignBrief
}) => {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'checklist' | 'briefing' | 'tactical'>('checklist');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const sectorEvents = useMemo(() => events.filter(e => e.context === context), [events, context]);
  const activeEvent = sectorEvents[activeEventIndex];

  // Auto-select the latest event if not set or if new events are added
  useEffect(() => {
    if (sectorEvents.length > 0 && !activeEvent) {
      setActiveEventIndex(0);
    }
  }, [sectorEvents, activeEvent]);

  const filteredChecklist = useMemo(() => {
    if (!activeEvent) return [];
    if (roleFilter === 'all') return activeEvent.checklists || [];
    return (activeEvent.checklists || []).filter(i => i.assignedRole === roleFilter || i.assignedRole === 'all');
  }, [activeEvent, roleFilter]);

  const categories = [
    { id: ChecklistCategory.PRE_EVENT, label: 'Pre-Event Setup' },
    { id: ChecklistCategory.DURING_EVENT, label: 'Live Operations' },
    { id: ChecklistCategory.POST_EVENT, label: 'Wrap & Security' }
  ];

  const handleSign = (type: 'kitchen' | 'bar' | 'office' | 'management') => {
    if (!activeEvent) return;
    const signature: BriefSignature = {
      userId: currentUser.id,
      userName: currentUser.name,
      signedAt: new Date().toISOString()
    };
    onSignBrief(activeEvent.id, type, signature);
  };

  if (!activeEvent) return (
    <div className="p-20 text-center opacity-30 flex flex-col items-center justify-center gap-6 h-full">
      <ShieldCheck size={80} strokeWidth={1} />
      <div className="space-y-2">
        <p className="font-black uppercase tracking-[0.4em] text-xs">Awaiting Activity Registry</p>
        <p className="text-[10px] font-bold uppercase tracking-widest italic text-slate-400">Add an event to generate operational briefs</p>
      </div>
    </div>
  );

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Live Execution Hub</p></div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">{activeEvent.name.split('-')[0]}</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
            {['checklist', 'briefing', 'tactical'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="flex bg-white p-2 rounded-[30px] border border-slate-100 shadow-xl shadow-black/5 max-w-md overflow-x-auto">
            {sectorEvents.map((e, idx) => (
                <button key={e.id} onClick={() => setActiveEventIndex(idx)}
                className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeEventIndex === idx ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >{e.name.split('-')[0]}</button>
            ))}
        </div>
      </div>

      {activeTab === 'checklist' && (
        <div className="space-y-12 animate-in fade-in duration-300">
          {categories.map(cat => {
            const tasks = filteredChecklist.filter(i => i.category === cat.id);
            if (tasks.length === 0) return null;
            return (
              <div key={cat.id} className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest italic text-slate-800">{cat.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map(item => (
                    <div key={item.id} onClick={() => onUpdateChecklist(activeEvent.id, item.id, item.status === 'done' ? 'todo' : 'done')}
                      className={`p-6 rounded-[35px] border-2 transition-all cursor-pointer flex items-center gap-6 ${item.status === 'done' ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-white border-slate-50 shadow-xl'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-200'}`}>{item.status === 'done' ? <CheckCircle2 size={24} /> : <Circle size={24} />}</div>
                      <div className="flex-1"><p className={`text-sm font-black tracking-tight ${item.status === 'done' ? 'text-emerald-900 line-through' : 'text-slate-800'}`}>{item.task}</p><span className="px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest mt-2 block w-fit bg-slate-100 text-slate-400">{item.assignedRole}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'briefing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           {[
             { id: 'management', title: 'Management Brief', icon: ShieldCheck, content: activeEvent.briefs?.management },
             { id: 'kitchen', title: 'Kitchen Brief', icon: ChefHat, content: activeEvent.briefs?.kitchen },
             { id: 'bar', title: 'Bar Brief', icon: Wine, content: activeEvent.briefs?.bar },
             { id: 'office', title: 'Admin Brief', icon: Briefcase, content: activeEvent.briefs?.office }
           ].map(brief => {
             const sig = activeEvent.briefs?.signatures?.[brief.id as keyof EventBriefs['signatures']];
             return (
              <div key={brief.id} className="bg-white p-10 rounded-[60px] border border-white/50 shadow-xl group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8"><div className="flex items-center gap-4"><div className="p-4 bg-slate-900 text-brand-accent rounded-2xl shadow-lg"><brief.icon size={28} /></div><div><h4 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">{brief.title}</h4><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Manifest</p></div></div>{sig && <div className="p-2 bg-emerald-100 rounded-full text-emerald-500"><Shield size={24} /></div>}</div>
                    <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 min-h-[250px]"><p className="text-sm font-bold text-slate-600 leading-loose italic whitespace-pre-wrap">{brief.content || 'AI Synthesis Pending... Ensure event date and attendance were set during creation.'}</p></div>
                  </div>
                  {sig ? (
                    <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><ShieldCheck size={28} /></div><div><p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Signed</p><p className="text-sm font-black text-slate-800">{sig.userName}</p></div></div>
                  ) : (
                    <button onClick={() => handleSign(brief.id as any)} className="w-full mt-8 py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-brand-primary transition-all"><Fingerprint size={18} /> Sign Brief</button>
                  )}
              </div>
             );
           })}
        </div>
      )}

      {activeTab === 'tactical' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in zoom-in-95 duration-500">
           <div className="space-y-8">
              <h3 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-3"><Clock size={24} className="text-brand-primary" /> Timeline</h3>
              <div className="bg-white p-10 rounded-[50px] border border-white/50 shadow-2xl relative overflow-hidden">
                 <div className="space-y-12">
                    <div className="flex gap-8"><div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xl"><Flag size={18} /></div><div><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Start</p><h4 className="text-xl font-black text-slate-800 italic">{activeEvent.startTime}</h4></div></div>
                    {(activeEvent.performers || []).map((p, i) => (
                       <div key={i} className="flex gap-8"><div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-xl"><Headphones size={18} /></div><div><p className="text-[9px] font-black uppercase text-brand-primary mb-1">Talent: {p.name}</p><h4 className="text-xl font-black text-slate-800 italic">{p.performanceStartTime} — {p.performanceEndTime}</h4></div></div>
                    ))}
                 </div>
              </div>
           </div>
           {activeEvent.suggestions && activeEvent.suggestions.length > 0 && (
              <div className="space-y-8">
                 <h3 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-3"><Lightbulb size={24} className="text-brand-accent" /> Proactive Insights</h3>
                 <div className="space-y-4">
                    {activeEvent.suggestions.map((s, i) => (
                       <div key={i} className="bg-brand-primary p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Lightbulb size={80} /></div>
                          <p className="text-sm font-bold italic leading-relaxed relative z-10">"{s}"</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default EventExecutionModule;
