
import React, { useState, useMemo, useEffect } from 'react';
import { Event, ChecklistCategory, DeliveryCategory, ProjectContext, UserRole } from '../types';
import { 
  ClipboardList, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChefHat, 
  Wine, 
  Users, 
  ShieldCheck, 
  Zap, 
  Printer, 
  Smartphone,
  Info,
  Mic2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  History,
  Lock,
  Flag,
  Timer
} from 'lucide-react';

interface EventExecutionModuleProps {
  events: Event[];
  context: ProjectContext;
  memberId: string;
  onUpdateChecklist: (eventId: string, itemId: string, status: 'todo' | 'in-progress' | 'done') => void;
  onAcknowledgeBriefing: (eventId: string, memberId: string) => void;
}

const EventExecutionModule: React.FC<EventExecutionModuleProps> = ({ 
  events, 
  context, 
  memberId,
  onUpdateChecklist,
  onAcknowledgeBriefing
}) => {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'checklist' | 'briefing' | 'tactical'>('checklist');
  const [briefingRole, setBriefingRole] = useState<'kitchen' | 'bar' | 'host' | 'mgmt'>('mgmt');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeEvent = events[activeEventIndex];

  const categories = [
    { id: ChecklistCategory.PRE_EVENT, label: 'Pre-Event Setup' },
    { id: ChecklistCategory.EVENT_DAY_BEFORE, label: 'Launch Prep' },
    { id: ChecklistCategory.DURING_EVENT, label: 'Live Operations' },
    { id: ChecklistCategory.POST_EVENT, label: 'Wrap & Security' }
  ];

  const hasAcknowledged = activeEvent?.acknowledgedBy?.includes(memberId);

  // Tactical Insight Logic
  const tacticalTips = useMemo(() => {
    if (!activeEvent) return [];
    return [
      {
        category: 'Entry',
        tip: 'Redirect flow to North Corridor if queue exceeds 12 persons. Doors+45m wave is critical.',
        trigger: 'Expected High Volume',
        icon: Users
      },
      {
        category: 'Drinks',
        tip: 'Ensure Bar Runners are pre-staging glassware for the 21:00 cocktail rush.',
        trigger: 'Service Peak Projection',
        icon: Wine
      },
      {
        category: 'Stage',
        tip: `Confirm ${activeEvent.performers[0]?.name || 'Talent'} has arrived in the green room 15m prior to set.`,
        trigger: 'Performer Sync',
        icon: Mic2
      },
      {
        category: 'Post-Wrap',
        tip: 'Final Cash-up requires dual manager sign-off. Ensure equipment lockout is logged.',
        trigger: 'Closing Integrity',
        icon: Lock
      }
    ];
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-6 opacity-30">
        <ShieldCheck size={80} />
        <p className="font-black uppercase tracking-[0.4em] text-xs">No Active Campaigns Found</p>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Execution Hub</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
            <button 
              onClick={() => setActiveTab('checklist')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'checklist' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Checklists
            </button>
            <button 
              onClick={() => setActiveTab('briefing')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'briefing' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Briefings
            </button>
            <button 
              onClick={() => setActiveTab('tactical')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'tactical' ? 'bg-slate-900 text-brand-accent shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Zap size={14} fill="currentColor" /> Tactical Monitor
            </button>
          </div>
        </div>

        <div className="flex bg-white p-2 rounded-[30px] border border-slate-100 shadow-xl shadow-black/5">
           {events.map((e, idx) => (
             <button 
              key={e.id}
              onClick={() => setActiveEventIndex(idx)}
              className={`px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeEventIndex === idx ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {e.name.split('#')[0]}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-12">
            {categories.map(cat => (
              <div key={cat.id} className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black uppercase tracking-widest italic text-slate-800">{cat.label}</h3>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeEvent.checklists.filter(i => i.category === cat.id).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => onUpdateChecklist(activeEvent.id, item.id, item.status === 'done' ? 'todo' : 'done')}
                      className={`p-6 rounded-[35px] border-2 transition-all cursor-pointer flex items-center gap-6 group ${item.status === 'done' ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-white border-slate-50 hover:border-brand-primary/20 shadow-xl shadow-black/5'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${item.status === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-200 group-hover:bg-brand-primary/10 group-hover:text-brand-primary'}`}>
                        {item.status === 'done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-black tracking-tight ${item.status === 'done' ? 'text-emerald-900 line-through' : 'text-slate-800'}`}>{item.task}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{item.department}</span>
                          {item.timeAnchor && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1">
                              <Clock size={10} /> {item.timeAnchor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-8">
             <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-8 text-white/5">
                  <ClipboardList size={120} />
                </div>
                <div className="relative z-10">
                   <h4 className="text-lg font-bold uppercase tracking-tighter mb-8 italic text-brand-accent">Integrity Tracker</h4>
                   <div className="space-y-8">
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-white/40">
                          <span>Overall Sync</span>
                          <span>{Math.round((activeEvent.checklists.filter(i => i.status === 'done').length / activeEvent.checklists.length) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                           <div 
                            className="h-full bg-brand-primary transition-all duration-1000 shadow-[0_0_10px_var(--brand-primary)]" 
                            style={{ width: `${(activeEvent.checklists.filter(i => i.status === 'done').length / activeEvent.checklists.length) * 100}%` }} 
                           />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                           <p className="text-2xl font-black italic">{activeEvent.checklists.filter(i => i.status === 'todo').length}</p>
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Active</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                           <p className="text-2xl font-black italic text-emerald-400">{activeEvent.checklists.filter(i => i.status === 'done').length}</p>
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Logged</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'briefing' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4 italic">Personnel Allocation</p>
            {[
              { id: 'kitchen', label: 'Kitchen Force', icon: ChefHat },
              { id: 'bar', label: 'Mixology Hub', icon: Wine },
              { id: 'host', label: 'Front of House', icon: Users },
              { id: 'mgmt', label: 'Command Hub', icon: ShieldCheck }
            ].map(role => (
              <button 
                key={role.id}
                onClick={() => setBriefingRole(role.id as any)}
                className={`w-full text-left px-8 py-5 rounded-[30px] flex items-center gap-4 transition-all border-2 ${briefingRole === role.id ? 'bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20' : 'bg-white text-slate-400 hover:bg-slate-50 border-transparent'}`}
              >
                <role.icon size={18} />
                <span className="text-xs font-black uppercase tracking-widest">{role.label}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-12 rounded-[60px] shadow-2xl shadow-black/5 border border-white/50 space-y-12">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 border border-slate-100">
                      {briefingRole === 'kitchen' && <ChefHat size={40} />}
                      {briefingRole === 'bar' && <Wine size={40} />}
                      {briefingRole === 'host' && <Users size={40} />}
                      {briefingRole === 'mgmt' && <ShieldCheck size={40} />}
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">{activeEvent.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Tactical Directive: {briefingRole.toUpperCase()}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"><Printer size={18} /></button>
                   <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"><Smartphone size={18} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Info size={14} className="text-brand-primary" /> Active Service Parameters
                       </h4>
                       <ul className="space-y-6">
                          <li className="flex items-start gap-4 text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-brand-primary pl-6 py-1 bg-brand-primary/5 rounded-r-2xl">
                             Operational capacity set for {activeEvent.expectedAttendance} guest units.
                          </li>
                          <li className="flex items-start gap-4 text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-slate-200 pl-6 py-1">
                             Critical engagement window: {activeEvent.startTime} — {activeEvent.endTime}
                          </li>
                          <li className="flex items-start gap-4 text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-slate-200 pl-6 py-1">
                             Focus: Zero-latency drinks service in the Upper Deck region.
                          </li>
                       </ul>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Mic2 size={14} className="text-brand-primary" /> Talent & Performer Rider
                       </h4>
                       <div className="space-y-6">
                          {activeEvent.performers.map(p => (
                             <div key={p.id} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                   <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{p.name}</p>
                                   <span className="text-[9px] font-black uppercase text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded italic">{p.performanceTime}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                   {p.rider.map((r, i) => (
                                      <span key={i} className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                                        {r}
                                      </span>
                                   ))}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-12 border-t border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${hasAcknowledged ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                       <CheckCircle2 size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compliance Logic</p>
                       <p className="text-sm font-bold text-slate-700">{hasAcknowledged ? 'Directive Acknowledged' : 'Awaiting Final Signal Acknowledgement'}</p>
                    </div>
                 </div>
                 {!hasAcknowledged && (
                   <button 
                    onClick={() => onAcknowledgeBriefing(activeEvent.id, memberId)}
                    className="bg-brand-primary text-white px-10 py-5 rounded-[25px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                   >
                     Authorize & Acknowledge Briefing
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tactical' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in zoom-in-95 duration-500">
           {/* Left: Performer Arrival & Set Times Timeline */}
           <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Timeline of Engagement</h3>
                 <div className="flex items-center gap-2 bg-slate-900 text-brand-accent px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                    <Timer size={12} className="animate-pulse" /> Live Now
                 </div>
              </div>
              
              <div className="bg-white p-10 rounded-[50px] border border-white/50 shadow-2xl shadow-black/5 relative overflow-hidden">
                 <div className="absolute top-0 left-10 w-px h-full bg-slate-100" />
                 
                 <div className="space-y-12 relative z-10">
                    <div className="flex gap-8 group">
                       <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black italic shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                          <Flag size={18} />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Event Ingress</p>
                          <h4 className="text-xl font-black text-slate-800 italic uppercase">Doors Open @ {activeEvent.startTime}</h4>
                       </div>
                    </div>

                    {activeEvent.performers.map(p => (
                       <React.Fragment key={p.id}>
                          <div className="flex gap-8 group">
                             <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center font-black italic shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                                <Users size={18} />
                             </div>
                             <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Talent Arrival</p>
                                <h4 className="text-xl font-black text-slate-800 italic uppercase">{p.name} Arrivals @ {p.arrivalTime}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic">Confirmed Check-in required</p>
                             </div>
                          </div>
                          <div className="flex gap-8 group">
                             <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center font-black italic shadow-xl shrink-0 group-hover:scale-110 transition-transform ring-4 ring-brand-primary/20">
                                <Mic2 size={18} />
                             </div>
                             <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary mb-1">Live Deployment</p>
                                <h4 className="text-xl font-black text-slate-800 italic uppercase">{p.name} Performance @ {p.performanceTime}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                   <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-brand-primary w-1/3 animate-pulse" />
                                   </div>
                                   <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Awaiting Stage Signal</span>
                                </div>
                             </div>
                          </div>
                       </React.Fragment>
                    ))}

                    <div className="flex gap-8 group">
                       <div className="w-10 h-10 bg-slate-400 text-white rounded-xl flex items-center justify-center font-black italic shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                          <History size={18} />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Operational Wrap</p>
                          <h4 className="text-xl font-black text-slate-800 italic uppercase">Curtain Call @ {activeEvent.endTime}</h4>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Middle: Bottleneck Intelligence & Live Tips */}
           <div className="lg:col-span-2 space-y-12">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Operational Watchlist</h3>
                 <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    <ShieldCheck size={12} /> Sync: Performance High
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {tacticalTips.map((t, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-xl shadow-black/5 group hover:border-brand-primary/20 transition-all flex flex-col justify-between">
                       <div>
                          <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-3">
                                <div className="p-3 bg-slate-900 text-brand-accent rounded-2xl shadow-lg">
                                   <t.icon size={20} />
                                </div>
                                <h4 className="text-lg font-black text-slate-800 italic uppercase tracking-tighter">{t.category} Intelligence</h4>
                             </div>
                             <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-lg text-[8px] font-black uppercase">
                                {t.trigger}
                             </div>
                          </div>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-6 group-hover:border-brand-primary transition-colors">
                             "{t.tip}"
                          </p>
                       </div>
                       <div className="pt-8 flex items-center justify-between mt-8 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Observation Active</span>
                          </div>
                          <button className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 hover:gap-3 transition-all">
                             Mark Observed <ArrowRight size={12} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Warning/Bottleneck Indicator */}
              <div className="bg-amber-50 p-10 rounded-[60px] border-2 border-amber-100 flex items-center gap-10 shadow-2xl shadow-amber-500/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 text-amber-500/5 rotate-12">
                   <AlertTriangle size={150} />
                 </div>
                 <div className="w-24 h-24 bg-amber-500 rounded-[35px] flex items-center justify-center text-white shadow-xl shadow-amber-500/20 shrink-0">
                    <TrendingUp size={48} strokeWidth={2.5} />
                 </div>
                 <div className="relative z-10">
                    <h4 className="text-2xl font-black text-amber-900 tracking-tight uppercase italic leading-none mb-3">Live Bottleneck Alert</h4>
                    <p className="text-sm text-amber-800 font-bold leading-relaxed italic max-w-lg">
                       Entrance throughput is currently at 88% capacity. If the queue crosses the <b>Main Stairwell Threshold</b>, deploy 1 runner for pre-verification of digital tickets to sustain entry velocity.
                    </p>
                    <div className="flex gap-4 mt-6">
                       <button className="bg-amber-900 text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">Deploy Reinforcement</button>
                       <button className="bg-white/50 text-amber-900 border border-amber-200 px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest">Suppress Alert</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EventExecutionModule;
