
import React, { useState, useEffect } from 'react';
import { VipResidencyProtocol, CrossDomainSignal, Room, TeamMember, Booking, TaskStatus, TaskCategory, TaskPriority } from '../types';
import { Star, Shield, User, Zap, X, MapPin, Headphones, Music4, Utensils, ShieldCheck, ClipboardCheck, Sparkles, Building, Key, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { TimePicker } from './CustomInputs';

interface HotelVipModuleProps {
  protocols: VipResidencyProtocol[];
  rooms: Room[];
  team: TeamMember[];
  signals: CrossDomainSignal[];
  onAddProtocol: (p: Partial<VipResidencyProtocol>) => void;
  onAddBooking: (b: Partial<Booking>) => void;
  onAckSignal: (id: string) => void;
  onAddTask: (task: any) => void;
  pendingSignal: CrossDomainSignal | null;
  onClearPendingSignal: () => void;
}

const HotelVipModule: React.FC<HotelVipModuleProps> = ({ 
  protocols, rooms, team, signals, onAddProtocol, onAddBooking, onAckSignal, onAddTask, pendingSignal, onClearPendingSignal 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSignal, setActiveSignal] = useState<CrossDomainSignal | null>(null);
  const [pickupTime, setPickupTime] = useState('19:00');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const pendingSignals = signals.filter(s => !s.acknowledged && s.type === 'artist-booking');

  // TRIGGER MODAL FROM DASHBOARD ACTION
  useEffect(() => {
    if (pendingSignal) {
        handleProcessArtist(pendingSignal);
        onClearPendingSignal();
    }
  }, [pendingSignal]);

  const handleProcessArtist = (signal: CrossDomainSignal) => {
    setActiveSignal(signal);
    
    // PRIORITY AUTO-SELECT: Find Room 404 / The Sanctuary specifically
    const sanctuaryRoom = rooms.find(r => r.type === 'The Sanctuary');
    const vipRoom = rooms.find(r => r.isVipRoom);
    
    // Auto-select the room so the button is NOT disabled
    setSelectedRoomId(sanctuaryRoom?.id || vipRoom?.id || rooms[0]?.id || '');
    setIsModalOpen(true);
  };

  const getSourceDisplay = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes('theory') || b.includes('st')) return { name: 'Sunday Theory', icon: Music4, color: 'text-[#8B8635]', bg: 'bg-[#8B8635]/10' };
    return { name: 'The Yard', icon: Utensils, color: 'text-[#AF431D]', bg: 'bg-[#AF431D]/10' };
  };

  const finalizeResidency = () => {
    if (!activeSignal || !selectedRoomId) return;

    const source = activeSignal.payload.sourceBrand || 'The Yard';
    const artistName = activeSignal.payload.artistName;
    const room = rooms.find(r => r.id === selectedRoomId);

    // 1. SAVE PROTOCOL (Talent Hub Board)
    const protocol: Partial<VipResidencyProtocol> = {
      artistId: artistName,
      rider: activeSignal.payload.rider?.length ? activeSignal.payload.rider : ['Standard VIP Refreshments', 'Premium Security Escort'],
      privacyNotes: `Authorized from ${source}. Assigned to ${room?.roomNumber}.`,
      assignedRoomNumber: room?.roomNumber || 'TBD',
      transportSchedule: [{ time: pickupTime, from: 'Airport', to: 'T3S' }],
      securityRequired: true,
      entourageSize: 1,
      hospitalityGifting: ['Premium Welcome Pack', 'Artisanal Water']
    };

    // 2. CREATE BOOKING (Guest Ledger)
    const booking: Partial<Booking> = {
      guestName: artistName,
      guestEmail: activeSignal.payload.managementEmail || '',
      guestPhone: activeSignal.payload.managementPhone || '',
      checkIn: activeSignal.payload.eventDate,
      checkOut: activeSignal.payload.eventDate,
      roomId: selectedRoomId,
      isVip: true,
      source: 'Artist Management',
      pax: 1,
      paymentStatus: 'pending',
      specialRequests: `VIP RESIDENCY. Sanctuary Room ${room?.roomNumber}. Rider: ${activeSignal.payload.rider?.join(', ')}`
    };

    // 3. CREATE OPS TASK (Explicitly tagged for Hotel Board 'h1')
    onAddTask({
      title: `VIP SETUP: ${artistName} (Room ${room?.roomNumber})`,
      description: `Rider Setup: ${activeSignal.payload.rider?.join(', ')}. Security protocol active. Pickup at ${pickupTime}.`,
      status: TaskStatus.TODO,
      priority: 'critical' as TaskPriority,
      category: TaskCategory.OPS,
      assignees: [], 
      dueDate: activeSignal.payload.eventDate,
      isRecurring: false,
      recurrenceType: 'none',
      context: 'h1', 
      progress: 0
    });

    onAddProtocol(protocol);
    onAddBooking(booking);
    onAckSignal(activeSignal.id);
    setIsModalOpen(false);
    setActiveSignal(null);
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <Star className="text-brand-accent animate-pulse" size={16} fill="currentColor" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Elite Residency Protocol</p>
           </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Talent Stay Hub</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Authorizing Artist residency and pinning setup objectives to the main board.</p>
        </div>
        <div className="bg-indigo-600 text-white px-8 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-indigo-600/20">
            <Shield size={18} /> Sanctuary Access Authorized
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* PENDING SIGNALS */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-800">
                 <Zap size={24} className="text-brand-accent" fill="currentColor" /> Incoming Artist Signals
              </h3>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase">{pendingSignals.length} AWAITING SETUP</span>
           </div>
           <div className="space-y-6">
              {pendingSignals.map(sig => {
                const source = getSourceDisplay(sig.payload.sourceBrand || 'The Yard');
                return (
                  <div key={sig.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-xl flex items-center justify-between group hover:border-indigo-200 transition-all animate-in slide-in-from-left-4">
                     <div className="flex items-center gap-6">
                        <div className="p-4 bg-slate-900 text-brand-accent rounded-2xl shadow-lg group-hover:scale-110 transition-transform"><Headphones size={28} /></div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <source.icon size={12} className={source.color} />
                              <p className={`text-[8px] font-black uppercase tracking-widest ${source.color}`}>{source.name}</p>
                           </div>
                           <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">{sig.payload.artistName}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Arrival Date: {sig.payload.eventDate}</p>
                        </div>
                     </div>
                     <button onClick={() => handleProcessArtist(sig)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all">Authorize Setup</button>
                  </div>
                );
              })}
              {pendingSignals.length === 0 && (
                <div className="p-20 text-center opacity-20 italic font-black uppercase text-xs border-2 border-dashed border-slate-100 rounded-[50px]">
                   <ShieldCheck size={48} className="mx-auto mb-4" />
                   No pending talent signals
                </div>
              )}
           </div>
        </div>

        {/* CONFIRMED ROSTER */}
        <div className="space-y-8">
           <h3 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-slate-800">
              <ShieldCheck size={24} className="text-emerald-500" /> Confirmed Board Roster
           </h3>
           <div className="grid grid-cols-1 gap-6">
              {protocols.map((p) => {
                const source = getSourceDisplay(p.privacyNotes?.includes('Sunday Theory') ? 'Sunday Theory' : 'The Yard');
                return (
                 <div key={p.id} className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group border border-white/5 animate-in slide-in-from-right-4">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Star size={120} /></div>
                    <div className="flex items-center justify-between relative z-10">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-brand-accent italic font-black text-2xl border border-white/5">{p.artistId.charAt(0)}</div>
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <source.icon size={10} className={source.color} />
                                <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${source.color}`}>{source.name}</span>
                             </div>
                             <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">{p.artistId}</h4>
                             <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/30">
                                    <Key size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Room {p.assignedRoomNumber || 'Sanctuary'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-xl border border-indigo-500/30">
                                    <ClipboardCheck size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Active Mission</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                       {(p.rider || []).map((r, i) => (
                          <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase whitespace-nowrap text-slate-400 border border-white/5">"{r}"</span>
                       ))}
                    </div>
                 </div>
              )})}
              {protocols.length === 0 && (
                <div className="p-20 text-center opacity-20 italic font-black uppercase text-xs border-2 border-dashed border-slate-100 rounded-[50px]">
                   No confirmed residencies in the board registry.
                </div>
              )}
           </div>
        </div>
      </div>

      {isModalOpen && activeSignal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
               <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Architecture Sync</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Deploying Sanctuary Protocol for {activeSignal.payload.artistName}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
               </div>
               <div className="p-10 space-y-12 overflow-y-auto max-h-[70vh] custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 relative">
                          <div className="absolute -top-4 -right-4 bg-brand-primary p-3 rounded-2xl text-white shadow-lg"><Star size={20} fill="currentColor" /></div>
                          <h4 className="text-xs font-black uppercase text-slate-400 mb-4 italic">Neural Rider Digest</h4>
                          <ul className="space-y-2">
                             {/* ENSURE RIDER IS NEVER EMPTY */}
                             {(activeSignal.payload.rider?.length ? activeSignal.payload.rider : ['Standard VIP Refreshments', 'Premium Security Escort']).map((r: string, i: number) => (
                                <li key={i} className="text-sm font-bold text-slate-600 italic flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/40" />
                                    {r}
                                </li>
                             ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                               <Building size={12} /> Sanctuary Suite Allocation
                           </label>
                           <select 
                            className={`w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none border-2 transition-all ${selectedRoomId ? 'border-indigo-500 bg-indigo-50/20' : 'border-red-500'}`}
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                           >
                              <option value="">-- Choose Assigned Room --</option>
                              {rooms.map(r => (
                                 <option key={r.id} value={r.id} className={r.type === 'The Sanctuary' ? 'font-black' : ''}>
                                    Room {r.roomNumber} — {r.type}
                                 </option>
                              ))}
                           </select>
                           {rooms.find(r => r.id === selectedRoomId)?.type === 'The Sanctuary' ? (
                               <div className="flex items-center gap-2 text-[8px] font-black text-emerald-600 uppercase italic ml-2">
                                   <Sparkles size={10} fill="currentColor" /> Sanctuary Tier Confirmed
                               </div>
                           ) : (
                               <div className="flex items-center gap-2 text-[8px] font-black text-amber-600 uppercase italic ml-2">
                                   <AlertTriangle size={10} /> Sanctuary Room highly recommended
                               </div>
                           )}
                        </div>
                     </div>
                     <div className="space-y-8">
                        <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-6">
                           <h4 className="text-sm font-black uppercase italic text-indigo-900">Transport & Arrival</h4>
                           <TimePicker label="Airport Pickup Huddle" value={pickupTime} onChange={val => setPickupTime(val)} />
                           <div className="p-4 bg-white/40 rounded-2xl flex items-start gap-3">
                              <Info size={16} className="text-indigo-900/40 mt-1" />
                              <p className="text-[9px] font-bold text-indigo-900/60 leading-relaxed italic">
                                "Authorizing this will pin a CRITICAL Setup Objective on the main Operations Board for the entire Floor Team."
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-7 bg-white border-2 border-slate-200 text-slate-400 rounded-[35px] font-black text-xs uppercase tracking-widest">Abort</button>
                  <button 
                    onClick={finalizeResidency} 
                    disabled={!selectedRoomId}
                    className="flex-[2] py-7 bg-indigo-600 text-white rounded-[35px] font-black text-xl uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-30"
                  >
                    Commit & Push to Board <ArrowRight size={24} />
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default HotelVipModule;
