
import React, { useState, useMemo } from 'react';
import { Room, TeamMember, UserRole } from '../types';
import { Layout, CheckCircle2, AlertCircle, Clock, Brush, MapPin, User, LogIn, LogOut, Search, Filter, ShieldCheck, Zap, Bed, Key, ChevronRight, Box, Plus, X, Save } from 'lucide-react';

interface HotelOpsModuleProps {
  rooms: Room[];
  team: TeamMember[];
  user: TeamMember;
  onUpdateRoom: (id: string, updates: Partial<Room>) => void;
  onAddRoom: (room: Omit<Room, 'id'>) => void;
}

const ROOM_TYPES = ['The Nest', 'The Haven', 'The Residence', 'The Sanctuary'];

const HotelOpsModule: React.FC<HotelOpsModuleProps> = ({ rooms, team, user, onUpdateRoom, onAddRoom }) => {
  const [filter, setFilter] = useState<'all' | 'vacant-clean' | 'occupied' | 'vacant-dirty' | 'maintenance'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isAuthorized = user?.role === UserRole.OWNER || user?.role === UserRole.MANAGER;

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'The Nest' as Room['type'],
    floor: 1,
    isVipRoom: false
  });

  const statsByTier = useMemo(() => {
    const tiers: Record<string, { total: number, available: number }> = {
      'The Nest': { total: 0, available: 0 },
      'The Haven': { total: 0, available: 0 },
      'The Residence': { total: 0, available: 0 },
      'The Sanctuary': { total: 0, available: 0 },
    };

    rooms.forEach(r => {
      if (tiers[r.type]) {
        tiers[r.type].total++;
        if (r.status === 'vacant-clean') tiers[r.type].available++;
      }
    });

    return tiers;
  }, [rooms]);

  const statusConfig = {
    'vacant-clean': { label: 'Ready', color: 'bg-emerald-500', icon: CheckCircle2 },
    'occupied': { label: 'Occupied', color: 'bg-blue-600', icon: User },
    'vacant-dirty': { label: 'Dirty', color: 'bg-amber-500', icon: Brush },
    'maintenance': { label: 'Maintenance', color: 'bg-red-500', icon: AlertCircle },
    'blocker': { label: 'Blocked', color: 'bg-slate-500', icon: ShieldCheck }
  };

  const filteredRooms = rooms.filter(r => filter === 'all' || r.status === filter);

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRoom({
      ...formData,
      status: 'vacant-clean',
      miniBarStatus: 'full'
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <ShieldCheck size={16} className="text-brand-accent" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Inventory Control Hub</p>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Room Matrix</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto">
            {['all', 'vacant-clean', 'occupied', 'vacant-dirty', 'maintenance'].map(t => (
              <button key={t} onClick={() => setFilter(t as any)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === t ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
           {isAuthorized && (
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-primary text-white px-8 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-transform"
             >
                <Plus size={18} /> Establish Inventory
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {(Object.entries(statsByTier) as [string, { total: number, available: number }][]).map(([tier, data]) => (
            <div key={tier} className="bg-white p-6 rounded-[35px] border border-slate-50 shadow-xl flex flex-col justify-between group hover:border-brand-primary transition-all">
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{tier}</p>
                  <h5 className="text-2xl font-black text-slate-800 italic tracking-tighter">{data.available} <span className="text-sm text-slate-300">/ {data.total}</span></h5>
               </div>
               <div className="w-full bg-slate-100 h-1 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-brand-primary transition-all duration-1000" style={{ width: `${(data.available/Math.max(1, data.total)) * 100}%` }} />
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredRooms.map(room => {
          const config = statusConfig[room.status as keyof typeof statusConfig] || statusConfig['vacant-clean'];
          return (
            <div key={room.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-xl shadow-black/5 hover:border-brand-primary transition-all group cursor-pointer relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-24 h-24 ${config.color} opacity-[0.03] -translate-y-1/2 translate-x-1/2 rounded-full`} />
               <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><Bed size={24} /></div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg ${config.color}`}>
                     {config.label}
                  </div>
               </div>
               <h4 className="text-3xl font-black text-slate-800 italic tracking-tighter leading-none mb-1">{room.roomNumber}</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{room.type}</p>
               
               <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-400">
                    <span>Floor {room.floor}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded italic">Wing A</span>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
               <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Inventory Architect</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Establishing new physical room registry</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
               </div>
               <form onSubmit={handleAddRoom} className="p-10 space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Room Identifier (Number)</label>
                     <input required className="w-full px-8 py-5 bg-slate-50 rounded-[25px] font-black text-2xl outline-none border-2 border-transparent focus:border-brand-primary" placeholder="e.g. 405" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Classification</label>
                        <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                           {ROOM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Floor / Level</label>
                        <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none" value={formData.floor} onChange={e => setFormData({...formData, floor: parseInt(e.target.value)})}>
                           <option value="1">Level 1 (Nest/Haven)</option>
                           <option value="2">Level 2 (Residence/Sanctuary)</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[30px] border border-slate-100">
                     <div className={`w-12 h-6 rounded-full p-1 transition-all flex items-center cursor-pointer ${formData.isVipRoom ? 'bg-brand-primary' : 'bg-slate-300'}`} onClick={() => setFormData({...formData, isVipRoom: !formData.isVipRoom})}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.isVipRoom ? 'translate-x-6' : ''}`} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-800">VIP Elite Designation</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Tags room for Talent Residency & protocol sync.</p>
                     </div>
                  </div>
                  <button type="submit" className="w-full py-8 bg-brand-primary text-white rounded-[35px] font-black text-xl uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.01] transition-all">
                    Commit to Inventory <Save size={24} />
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default HotelOpsModule;
