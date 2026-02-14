
import React, { useMemo, useState } from 'react';
import { Event, TicketType, ProjectContext } from '../types';
import { Ticket, Users, TrendingUp, Activity, Smartphone, Package, ShieldCheck, Zap, AlertCircle, ShoppingCart, AlertTriangle, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TicketingModuleProps {
  events: Event[];
  context: ProjectContext;
}

const TicketingModule: React.FC<TicketingModuleProps> = ({ events, context }) => {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const activeEvent = events[activeEventIndex];

  const ticketing = activeEvent?.ticketing;
  
  const stats = useMemo(() => {
    if (!ticketing) return null;
    const sold = ticketing.tickets.reduce((acc, t) => acc + t.sold, 0);
    const capacity = ticketing.tickets.reduce((acc, t) => acc + t.capacity, 0);
    const likelyAttendance = Math.round(sold * ticketing.historicalShowRate) + ticketing.walkInEstimate;
    const maxScenario = sold + ticketing.walkInEstimate + 20;

    const percentFilled = Math.round((sold / capacity) * 100);
    const isCritical = percentFilled >= 95;
    const isWarning = percentFilled >= 80 && percentFilled < 95;

    return { sold, capacity, likelyAttendance, maxScenario, percentFilled, isCritical, isWarning };
  }, [ticketing]);

  const demandForecast = useMemo(() => {
    if (!stats) return null;
    const base = stats.likelyAttendance;
    return [
      { item: 'Sliders / Food Units', qty: base * 1.8, category: 'Kitchen' },
      { item: 'Craft Cocktails', qty: base * 2.4, category: 'Bar' },
      { item: 'Beer / Ciders', qty: base * 1.2, category: 'Bar' },
      { item: 'Hubbly Coal Sets', qty: Math.min(base * 0.3, 40), category: 'Upper Deck' }
    ];
  }, [stats]);

  if (events.length === 0) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-6 opacity-30">
        <ShieldCheck size={80} />
        <p className="font-black uppercase tracking-[0.4em] text-xs">No Active Ticketed Events in {context === 'the-yard' ? 'The Yard' : 'Sunday Theory'}</p>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-700">
      {/* REAL-TIME CAPACITY ALERTS */}
      {stats?.isCritical && (
        <div className="bg-red-600 p-6 rounded-[35px] text-white shadow-2xl flex items-center justify-between border-4 border-red-500 animate-pulse">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-red-600 shadow-lg">
                 <ShieldAlert size={32} />
              </div>
              <div>
                 <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">CRITICAL: Maximum Capacity Trigger</h4>
                 <p className="text-sm font-bold opacity-80 italic">Ticket sales at {stats.percentFilled}%. Authorize emergency crowd flow protocols immediately.</p>
              </div>
           </div>
           <div className="px-6 py-3 bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest">Priority Protocol Active</div>
        </div>
      )}

      {stats?.isWarning && !stats?.isCritical && (
        <div className="bg-amber-500 p-6 rounded-[35px] text-white shadow-xl flex items-center justify-between border-4 border-amber-400">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-md">
                 <AlertTriangle size={28} />
              </div>
              <div>
                 <h4 className="text-xl font-black uppercase italic tracking-tighter leading-none mb-1">Capacity Review Required</h4>
                 <p className="text-sm font-bold opacity-90 italic">Event is at {stats.percentFilled}%. Suggested scaling for bar staff and security deployment.</p>
              </div>
           </div>
           <div className="px-6 py-3 bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest">Scaling Advisory</div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Traffic Intelligence</h2>
          <div className="flex items-center gap-4">
             <div className="h-1 w-20 bg-brand-primary rounded-full" />
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Real-time ticketing & demand synthesis.</p>
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

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-brand-primary/10 group-hover:scale-110 transition-transform">
            <Ticket size={80} strokeWidth={3} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tickets Sold</p>
          <h3 className="text-5xl font-black text-slate-800 tracking-tighter italic leading-none mb-6">
            {stats?.sold} <span className="text-xl text-slate-300">/ {stats?.capacity}</span>
          </h3>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
             <div className={`h-full transition-all duration-1000 ${stats?.isCritical ? 'bg-red-500' : stats?.isWarning ? 'bg-amber-500' : 'bg-brand-primary'}`} style={{ width: `${stats?.percentFilled}%` }} />
          </div>
          <p className={`text-[9px] font-bold uppercase tracking-widest mt-4 ${stats?.isCritical ? 'text-red-500' : stats?.isWarning ? 'text-amber-500' : 'text-brand-primary'}`}>{stats?.percentFilled}% Capacity Filled</p>
        </div>

        <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl" />
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">likely Attendance</p>
          <h3 className="text-5xl font-black text-brand-primary tracking-tighter italic leading-none mb-6">
            ~{stats?.likelyAttendance}
          </h3>
          <div className="flex items-center gap-3">
             <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black uppercase text-white/60">Min: {Math.round(stats?.likelyAttendance! * 0.85)}</div>
             <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black uppercase text-white/60">Peak Scenario: {stats?.maxScenario}</div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Activity size={14} className="text-brand-primary" /> Entry Velocity
            </h4>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
              Live Entry <Smartphone size={10} />
            </div>
          </div>
          <div className="h-[120px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={ticketing?.tickets}>
                 <Bar dataKey="sold" radius={[8, 8, 0, 0]}>
                   {ticketing?.tickets.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--brand-primary)' : '#D1CEBD'} />
                   ))}
                 </Bar>
                 <XAxis dataKey="name" hide />
                 <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: 'bold' }} />
               </BarChart>
             </ResponsiveContainer>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4 text-center">Ticket Type Sales Distribution</p>
        </div>
      </div>

      {/* Demand Forecast Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Operational Demand Forecast</h3>
            <div className="bg-brand-primary/5 text-brand-primary px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} fill="currentColor" /> Automated Adjustment Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demandForecast?.map((df, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-center justify-between group hover:border-brand-primary/30 transition-all">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{df.category}</p>
                   <h5 className="text-lg font-black text-slate-800 tracking-tight">{df.item}</h5>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-brand-primary italic leading-none">{Math.round(df.qty)}</p>
                   <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">Units Recommended</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 flex items-center gap-6">
             <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={28} />
             </div>
             <div>
                <h4 className="text-lg font-black text-emerald-900 tracking-tight uppercase italic leading-none mb-2">Sync: Procurement Lock</h4>
                <p className="text-sm text-emerald-700/80 font-medium leading-relaxed">
                  Traffic forecasts have been synced with the <b>Supply Chain Hub</b>. Recommended quantities for this context's suppliers have been adjusted based on event demand.
                </p>
             </div>
          </div>
        </div>

        {/* Real Time Insights */}
        <div className="space-y-8">
           <div className="bg-brand-primary p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 p-8 text-white/5">
                <TrendingUp size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 mb-6">
                  <AlertCircle size={14} /> Critical Insight
                </div>
                <h3 className="text-3xl font-black tracking-tighter italic uppercase leading-tight mb-6">
                  Event Velocity Shift
                </h3>
                <p className="text-sm font-medium text-white/70 leading-relaxed mb-8">
                  Sales patterns are shifting compared to historical averages for {context === 'the-yard' ? 'The Yard' : 'Sunday Theory'}. Review staffing allocations for peak hours.
                </p>
              </div>
              <button className="relative z-10 w-full py-5 bg-white text-slate-900 rounded-[25px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                Apply Operational Change <Zap size={14} fill="currentColor" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TicketingModule;
