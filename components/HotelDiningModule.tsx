
import React, { useState, useMemo } from 'react';
import { Booking, Order } from '../types';
import { Coffee, Pizza, Zap, TrendingUp, Clock, CheckCircle2, AlertTriangle, User, Search, Plus, Filter, ShoppingBag, Utensils } from 'lucide-react';

interface HotelDiningModuleProps {
  bookings: Booking[];
  context: string;
  orders: Order[];
  onAddOrder: (order: Partial<Order>) => void;
}

const HotelDiningModule: React.FC<HotelDiningModuleProps> = ({ bookings, context, orders, onAddOrder }) => {
  const [activeTab, setActiveTab] = useState<'breakfast' | 'room-service'>('breakfast');
  const [searchTerm, setSearchTerm] = useState('');

  const breakfastVolume = useMemo(() => {
    return bookings.filter(b => b.hasBreakfast).reduce((sum, b) => sum + b.pax, 0);
  }, [bookings]);

  const diningBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Food & Bev Ops</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
            {['breakfast', 'room-service'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-8 py-6 rounded-[35px] border border-slate-50 shadow-xl flex items-center gap-4">
              <div className="p-3 bg-brand-primary text-white rounded-2xl"><TrendingUp size={20} /></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Demand Forecast</p>
                 <p className="text-2xl font-black text-slate-800 italic">{breakfastVolume} Covers</p>
              </div>
           </div>
        </div>
      </div>

      {activeTab === 'breakfast' ? (
        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Coffee size={150} /></div>
             <div className="relative z-10">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Buffet Deployment</h3>
                <p className="text-sm font-medium text-white/50 max-w-md italic leading-relaxed">
                   Breakfast service is set to "Buffet Mode" based on current T3S occupancy. Kitchen has been alerted for {breakfastVolume} covers.
                </p>
             </div>
             <div className="relative z-10 flex gap-4">
                <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/10 text-center">
                   <p className="text-2xl font-black text-brand-accent italic">{breakfastVolume}</p>
                   <p className="text-[8px] font-black uppercase opacity-40">Expected</p>
                </div>
                <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/10 text-center">
                   <p className="text-2xl font-black text-emerald-400 italic">22</p>
                   <p className="text-[8px] font-black uppercase opacity-40">Seated</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {diningBookings.filter(b => b.hasBreakfast).map(b => (
               <div key={b.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-xl hover:border-brand-primary transition-all group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-brand-accent font-black italic text-xl">{b.guestName.charAt(0)}</div>
                        <div>
                           <h4 className="font-black text-slate-800 uppercase italic tracking-tight">{b.guestName}</h4>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{b.pax} Pax • Room {b.internalTable || '--'}</p>
                        </div>
                     </div>
                     <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={20} /></button>
                  </div>
                  {b.dietaryNotes && (
                     <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                        <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-900 leading-relaxed italic">"{b.dietaryNotes}"</p>
                     </div>
                  )}
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800 flex items-center gap-3"><ShoppingBag size={24} className="text-brand-primary" /> Active Room Orders</h3>
              <div className="space-y-4">
                 {orders.filter(o => o.tableNumber.includes('R') || o.tableNumber.includes('101') || o.tableNumber.includes('201')).map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-xl flex items-center justify-between group hover:border-brand-primary/30 transition-all">
                       <div className="flex items-center gap-8">
                          <div className="text-3xl font-black italic text-brand-primary w-16">{order.tableNumber}</div>
                          <div>
                             <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{order.items.length} Items Ordered</p>
                             <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${order.status === 'ready' ? 'bg-emerald-500 text-white' : 'bg-amber-50 text-amber-600'}`}>{order.status}</span>
                                <span className="text-[10px] font-bold text-slate-400 italic">Placed {new Date(order.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                             </div>
                          </div>
                       </div>
                       <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-lg">Clear Dispatch</button>
                    </div>
                 ))}
                 {orders.length === 0 && <div className="py-20 text-center opacity-20 italic text-sm font-black uppercase">No active room service orders</div>}
              </div>
           </div>
           
           <div className="space-y-8">
              <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                 <div className="absolute top-0 right-0 p-8 text-white/5"><Pizza size={120} /></div>
                 <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tighter italic uppercase leading-tight mb-6">Staff Meals</h3>
                    <div className="p-6 bg-brand-primary/20 rounded-[35px] border border-brand-primary/30">
                       <p className="text-xs font-bold text-white/80 leading-relaxed italic">
                         "Staff meal window is 15:00 - 16:30. Current prep: 12 portions for Afternoon Shift."
                       </p>
                    </div>
                 </div>
                 <button className="relative z-10 w-full mt-8 py-5 bg-white text-slate-900 rounded-[25px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                    Log Bulk Consumption
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HotelDiningModule;
