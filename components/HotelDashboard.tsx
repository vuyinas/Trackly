
import React, { useMemo } from 'react';
import { Room, Booking, MaintenanceTicket, IncidentReport, CrossDomainSignal } from '../types';
import { Bed, Users, AlertTriangle, ShieldAlert, Zap, TrendingUp, ChevronRight, Activity, Bell, CheckCircle2, UserPlus, Clock } from 'lucide-react';

interface HotelDashboardProps {
  rooms: Room[];
  bookings: Booking[];
  tickets: MaintenanceTicket[];
  incidents: IncidentReport[];
  signals: CrossDomainSignal[];
  onAckSignal: (id: string) => void;
}

const HotelDashboard: React.FC<HotelDashboardProps> = ({ rooms, bookings, tickets, incidents, signals, onAckSignal }) => {
  const occupancyRate = useMemo(() => {
    const occupiedCount = rooms.filter(r => r.status === 'occupied' || r.status === 'blocker').length;
    return Math.round((occupiedCount / (rooms.length || 1)) * 100);
  }, [rooms]);

  const activeSignals = signals.filter(s => !s.acknowledged);

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">THIRD Space Command</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time guest volume and facility integrity.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-[20px] shadow-xl border border-slate-100">
           <TrendingUp className="text-brand-primary" size={20} />
           <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{occupancyRate}% Occupancy</span>
        </div>
      </div>

      {activeSignals.length > 0 && (
        <div className="space-y-4">
           {activeSignals.map(sig => (
             <div key={sig.id} className="bg-brand-primary p-8 rounded-[40px] text-white shadow-2xl flex items-center justify-between border-4 border-white/20 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-8">
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-brand-primary shadow-xl">
                      <UserPlus size={32} />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">Incoming Residency: {sig.payload.artistName}</h4>
                      <p className="text-sm font-bold opacity-80 italic">A performer has been booked at The Yard for {sig.payload.eventDate}. Action required: Room Blocker & Rider Setup.</p>
                   </div>
                </div>
                <button 
                  onClick={() => onAckSignal(sig.id)}
                  className="bg-brand-accent text-slate-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                >
                   Authorize Logistics
                </button>
             </div>
           ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white/50 group hover:border-brand-primary transition-all">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors">
            <Bed size={28} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory Health</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic">
            {rooms.filter(r => r.status === 'vacant-clean').length} <span className="text-xl text-slate-300">/ Ready</span>
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white/50 group hover:border-brand-primary transition-all">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors">
            <Clock size={28} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-ins Pending</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic">
            {bookings.filter(b => b.checkIn === new Date().toISOString().split('T')[0]).length} <span className="text-xl text-slate-300">Today</span>
          </h3>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white/50 group hover:border-red-500 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <AlertTriangle size={28} className="text-red-500 group-hover:text-white" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Tickets</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic">
            {tickets.filter(t => t.status !== 'done').length} <span className="text-xl text-slate-300">Open</span>
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800 flex items-center gap-3">
               <Activity size={24} className="text-brand-primary" /> Tactical Signal Feed
            </h3>
            <div className="space-y-4">
               {incidents.filter(i => i.status === 'open').map(inc => (
                 <div key={inc.id} className="bg-red-50 p-6 rounded-[35px] border border-red-100 flex items-center justify-between shadow-sm animate-pulse">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm"><ShieldAlert size={24} /></div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-red-600">Active {inc.type} Incident</p>
                          <h4 className="text-lg font-black text-slate-800 italic uppercase">{inc.description}</h4>
                       </div>
                    </div>
                    <button className="bg-red-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">Dispatch</button>
                 </div>
               ))}
               
               {incidents.length === 0 && tickets.filter(t => t.priority === 'critical').length === 0 && (
                 <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[50px] opacity-30">
                    <CheckCircle2 size={48} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">THIRD Space Protocol Stable</p>
                 </div>
               )}
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-brand-primary p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px]">
               <div className="absolute top-0 right-0 p-8 text-white/5"><Bell size={120} /></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter italic uppercase leading-tight mb-6">Predictive Ops</h3>
                  <div className="p-6 bg-white/10 rounded-[35px] border border-white/20">
                     <p className="text-xs font-bold text-white/80 leading-relaxed italic">
                       "System anticipates a high turnover on Monday. Recommend pre-staging 3 housekeeping crews for Level 1 Suites. Laundry volume expected to peak at 14:00."
                     </p>
                  </div>
               </div>
               <button className="relative z-10 w-full mt-8 py-5 bg-white text-slate-900 rounded-[25px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-transform">
                  View Full Forecast
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HotelDashboard;
