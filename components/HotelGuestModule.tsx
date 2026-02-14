
import React, { useState, useMemo } from 'react';
import { Booking, Room, CrossDomainSignal, Sector, OccasionType } from '../types';
import { User, Users, Phone, Mail, Calendar, CheckCircle2, Search, Plus, Filter, ShoppingBag, Utensils, Zap, Clock, ShieldCheck, Heart, AlertCircle, X, Save, ChevronRight, Bed, DollarSign, Music, Sparkles, LogIn, Star, LogOut, MoreVertical, Info, Edit3, Trash2, MapPin, ArrowRight } from 'lucide-react';
import { DatePicker } from './CustomInputs';

interface HotelGuestProps {
  bookings: Booking[];
  rooms: Room[];
  onAddBooking: (booking: Partial<Booking>) => void;
  onUpdateBooking?: (id: string, updates: Partial<Booking>) => void;
  onDeleteBooking?: (id: string) => void;
  signals?: CrossDomainSignal[];
  onAckSignal?: (id: string) => void;
}

const ROOM_TIERS: Record<string, { label: string, price: number, floor: number }> = {
  'The Nest': { label: 'The Nest', price: 1200, floor: 1 },
  'The Haven': { label: 'The Haven', price: 2400, floor: 1 },
  'The Residence': { label: 'The Residence', price: 4800, floor: 2 },
  'The Sanctuary': { label: 'The Sanctuary', price: 9500, floor: 2 }
};

const HotelGuestModule: React.FC<HotelGuestProps> = ({ bookings, rooms, onAddBooking, onUpdateBooking, onDeleteBooking, signals = [], onAckSignal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSignal, setActiveSignal] = useState<CrossDomainSignal | null>(null);
  const [isAssigningRoom, setIsAssigningRoom] = useState<string | null>(null);
  
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<Booking>>({
    guestName: '', guestEmail: '', guestPhone: '',
    checkIn: today,
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pax: 1, source: 'Direct', isVip: false, dietaryNotes: '',
    specialRequests: '', hasBreakfast: true, hasDinner: false,
    occasion: 'None'
  });
  
  const [selectedRoomType, setSelectedRoomType] = useState<Room['type']>('The Nest');

  const stats = useMemo(() => {
    const arrivals = bookings.filter(b => b.checkIn === today).length;
    const departures = bookings.filter(b => b.checkOut === today).length;
    const checkedIn = bookings.filter(b => b.roomId).length;
    return { arrivals, departures, checkedIn };
  }, [bookings, today]);

  const nights = useMemo(() => {
    const start = new Date(formData.checkIn || today);
    const end = new Date(formData.checkOut || today);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [formData.checkIn, formData.checkOut, today]);

  const predictedPrice = nights * (ROOM_TIERS[selectedRoomType]?.price || 0);
  const filteredBookings = bookings.filter(b => b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || b.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenRes = (signal?: CrossDomainSignal) => {
    if (signal) {
      setFormData({ 
        guestName: signal.payload.artistName, 
        guestEmail: signal.payload.managementEmail || '', 
        guestPhone: signal.payload.managementPhone || '', 
        checkIn: signal.payload.eventDate, 
        checkOut: signal.payload.eventDate, 
        isVip: true, 
        source: 'Artist Management', 
        specialRequests: `Talent Hub Sync: ${signal.payload.rider?.join(', ')}` 
      });
      setSelectedRoomType('The Sanctuary');
      setActiveSignal(signal);
    } else {
      setFormData({ guestName: '', guestEmail: '', guestPhone: '', checkIn: today, checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0], pax: 1, source: 'Direct', isVip: false, dietaryNotes: '', specialRequests: '', hasBreakfast: true, hasDinner: false, occasion: 'None' });
      setSelectedRoomType('The Nest');
      setActiveSignal(null);
    }
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (booking: Booking) => {
    setEditingId(booking.id);
    setFormData(booking);
    setSelectedRoomType(booking.internalTable as any || 'The Nest');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && onUpdateBooking) {
      onUpdateBooking(editingId, { ...formData, internalTable: selectedRoomType });
    } else {
      onAddBooking({ 
        ...formData, 
        id: `bk-${Date.now()}`,
        welcomePackAssigned: formData.isVip, 
        paymentStatus: 'pending', 
        internalTable: selectedRoomType 
      });
      if (activeSignal && onAckSignal) onAckSignal(activeSignal.id);
    }
    setIsModalOpen(false);
  };

  const handleAssignRoom = (bookingId: string, roomId: string) => {
    if (onUpdateBooking) {
      onUpdateBooking(bookingId, { roomId });
      setIsAssigningRoom(null);
    }
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Guest Ledger</h2>
           <div className="flex items-center gap-4 bg-white p-4 rounded-[30px] shadow-sm border border-slate-100">
              <div className="relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                 <input type="text" placeholder="Search guests..." className="pl-16 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-brand-primary outline-none w-80" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="p-4 bg-brand-primary text-white rounded-2xl shadow-xl hover:scale-105 transition-all"><Filter size={20} /></button>
           </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => handleOpenRes()} className="bg-brand-primary text-white px-10 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all">
              <Plus size={18} /> New Reservation
           </button>
        </div>
      </div>

      {/* TODAY'S PULSE COMMAND CENTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-10 rounded-[50px] shadow-xl border border-white/50 flex flex-col justify-between group hover:border-brand-primary transition-all">
            <div>
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6"><LogIn size={28} /></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Arriving Today</p>
               <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{stats.arrivals} Guests</h3>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-4">Expected at reception</p>
         </div>
         <div className="bg-white p-10 rounded-[50px] shadow-xl border border-white/50 flex flex-col justify-between group hover:border-brand-primary transition-all">
            <div>
               <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6"><LogOut size={28} /></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Departing Today</p>
               <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{stats.departures} Keys</h3>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-4">Finalizing folios</p>
         </div>
         <div className="bg-slate-900 p-10 rounded-[50px] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><Bed size={120} /></div>
            <div className="relative z-10">
               <div className="w-14 h-14 bg-brand-primary/20 text-brand-primary rounded-2xl flex items-center justify-center mb-6"><ShieldCheck size={28} /></div>
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Live Occupancy</p>
               <h3 className="text-4xl font-black text-brand-primary italic tracking-tighter">{stats.checkedIn} Rooms</h3>
            </div>
            <p className="text-[9px] font-bold text-white/30 uppercase mt-4 relative z-10">Physical presence on premises</p>
         </div>
      </div>

      {/* RESERVATION LIST */}
      <div className="grid grid-cols-1 gap-6">
         <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800 flex items-center gap-3"><MapPin size={24} className="text-brand-primary" /> Active Registry</h3>
         {filteredBookings.map(booking => {
            const isCheckInDay = booking.checkIn === today;
            const isCheckedIn = !!booking.roomId;
            return (
               <div key={booking.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-xl flex items-center justify-between group hover:border-brand-primary/20 transition-all">
                  <div className="flex items-center gap-8">
                     <div className="relative">
                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-brand-accent font-black text-2xl italic">{booking.guestName.charAt(0)}</div>
                        {booking.isVip && <div className="absolute -top-1 -right-1 p-1 bg-brand-primary text-white rounded-lg shadow-lg"><Star size={12} fill="currentColor" /></div>}
                     </div>
                     <div>
                        <h4 className="text-xl font-black uppercase italic tracking-tight text-slate-800">{booking.guestName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.pax} Pax • {booking.source}</p>
                     </div>
                     <div className="h-10 w-px bg-slate-100" />
                     <div className="flex gap-10">
                        <div>
                           <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Check-In</p>
                           <p className={`text-xs font-bold ${isCheckInDay ? 'text-indigo-600' : 'text-slate-700'}`}>{booking.checkIn}</p>
                        </div>
                        <div>
                           <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Tier Plan</p>
                           <p className="text-xs font-bold text-brand-primary">{booking.internalTable || 'The Nest'}</p>
                        </div>
                        {isCheckedIn && (
                           <div>
                              <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Room Assigned</p>
                              <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                 <p className="text-xs font-black text-slate-800 italic">{rooms.find(r => r.id === booking.roomId)?.roomNumber}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     {!isCheckedIn ? (
                        isCheckInDay ? (
                           <button 
                              onClick={() => setIsAssigningRoom(booking.id)}
                              className="px-8 py-3 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
                           >
                              <LogIn size={14} /> Finalize Check-In
                           </button>
                        ) : (
                           <div className="px-6 py-3 bg-slate-50 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                              Awaiting {booking.checkIn}
                           </div>
                        )
                     ) : (
                        <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                           <CheckCircle2 size={14} /> In House
                        </div>
                     )}
                     <div className="flex gap-1">
                        <button onClick={() => handleEdit(booking)} className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-brand-primary transition-all"><Edit3 size={18} /></button>
                        <button onClick={() => onDeleteBooking?.(booking.id)} className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                     </div>
                  </div>
               </div>
            );
         })}
         {filteredBookings.length === 0 && (
            <div className="py-24 text-center opacity-30 flex flex-col items-center gap-6">
               <ShieldCheck size={80} />
               <p className="font-black uppercase tracking-[0.4em] text-xs italic">T3S Ledger Is Empty</p>
            </div>
         )}
      </div>

      {/* ROOM ASSIGNMENT MODAL overlay */}
      {isAssigningRoom && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden flex flex-col">
               <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter italic">Tactical Room Assignment</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sourcing tier: {filteredBookings.find(b => b.id === isAssigningRoom)?.internalTable}</p>
                  </div>
                  <button onClick={() => setIsAssigningRoom(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
               </div>
               <div className="p-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                  {rooms.filter(r => r.status === 'vacant-clean').map(room => (
                     <button 
                        key={room.id}
                        onClick={() => handleAssignRoom(isAssigningRoom, room.id)}
                        className="p-8 bg-slate-50 rounded-[40px] border-2 border-transparent hover:border-brand-primary hover:bg-white transition-all text-center flex flex-col items-center group"
                     >
                        <Bed size={32} className="text-slate-300 group-hover:text-brand-primary mb-4 transition-colors" />
                        <h4 className="text-3xl font-black text-slate-800 italic leading-none">{room.roomNumber}</h4>
                        <p className="text-[8px] font-black uppercase text-slate-400 mt-2 tracking-widest">{room.type}</p>
                        <p className="text-[7px] font-bold text-brand-primary uppercase mt-1 opacity-60">Level {room.floor}</p>
                     </button>
                  ))}
               </div>
               <div className="p-10 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Only Vacant-Clean inventory is listed for check-in.</p>
               </div>
            </div>
         </div>
      )}

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50"><div><h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">{editingId ? 'Modify Record' : 'Establish Residence'}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">THIRD Space Property Management Protocol</p></div><button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button></div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 custom-scrollbar">
                 <div className="space-y-10">
                    <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Guest Identity</label><input required className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[25px] font-black text-2xl outline-none focus:border-brand-primary" placeholder="Full Legal Name" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} /><div className="grid grid-cols-2 gap-4"><input type="email" placeholder="Email Address" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm" value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})} /><input type="tel" placeholder="Mobile / WhatsApp" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm" value={formData.guestPhone} onChange={e => setFormData({...formData, guestPhone: e.target.value})} /></div></div>
                    <div className="grid grid-cols-2 gap-6">
                       <DatePicker label="Check-In" value={formData.checkIn || today} onChange={val => setFormData({...formData, checkIn: val})} />
                       <DatePicker label="Check-Out" value={formData.checkOut || today} onChange={val => setFormData({...formData, checkOut: val})} />
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                       <p className="text-[10px] font-black uppercase text-slate-400">Inventory Tier</p>
                       <div className="grid grid-cols-2 gap-3">
                          {Object.entries(ROOM_TIERS).map(([id, tier]) => (
                             <button key={id} type="button" onClick={() => setSelectedRoomType(id as any)}
                              className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedRoomType === id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                             >
                                <div className="flex justify-between items-start">
                                   <p className="text-[9px] font-black uppercase mb-1">{tier.label}</p>
                                   <span className="text-[7px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase">Level {tier.floor}</span>
                                </div>
                                <p className="text-xs font-black italic">R{tier.price.toLocaleString()}</p>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="space-y-10">
                    <div className="p-10 bg-slate-900 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                       <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={160} /></div>
                       <div className="relative z-10">
                          <h4 className="text-xl font-black italic uppercase tracking-tighter text-brand-accent mb-8">Folio Projection</h4>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center text-sm font-bold opacity-60 italic">
                                <span>{nights} Nights @ {selectedRoomType}</span>
                                <span>R{predictedPrice.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm font-bold opacity-60 italic">
                                <span>Reservation Source</span>
                                <span>{formData.source}</span>
                             </div>
                             <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                <span className="text-lg font-black uppercase italic">Predicted Total</span>
                                <span className="text-3xl font-black italic text-brand-accent">R{predictedPrice.toLocaleString()}</span>
                             </div>
                          </div>
                       </div>
                       <button type="submit" className="relative z-10 w-full py-8 bg-brand-primary text-white rounded-[35px] font-black uppercase tracking-[0.3em] text-sm shadow-xl hover:scale-[1.01] active:scale-95 transition-all">
                          {editingId ? 'Update Record' : 'Authorize Entry'} <ChevronRight size={18} className="inline ml-2" />
                       </button>
                    </div>
                    <div className="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-[40px] flex items-center gap-6">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm"><Info size={24} /></div>
                       <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic pr-4">
                          Establishment of record will sync with Housekeeping and Guest Dining hubs automatically.
                       </p>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default HotelGuestModule;
