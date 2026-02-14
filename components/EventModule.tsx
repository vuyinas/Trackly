
import React, { useState } from 'react';
import { Event, ProjectContext, TeamMember, UserRole, Shift, Business } from '../types';
import { Calendar, Users, Mic2, Clock, MapPin, Plus, ChevronRight, Edit3, Trash2, Lock, Phone, Mail, User, Zap, Send, ShieldCheck, X, Loader2, Cake, Star, Briefcase, Utensils, Headphones, HardDrive, TrendingUp, Gem, ShoppingBag, Tag, Gift, Bed, Sparkles } from 'lucide-react';

interface EventModuleProps {
  events: Event[];
  currentUser: TeamMember;
  shifts: Shift[];
  team: TeamMember[];
  context: ProjectContext;
  activeBusiness: Business;
  businesses: Business[];
  onCreateNew?: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateEvent: (id: string, updates: Partial<Event>) => void;
}

const EventModule: React.FC<EventModuleProps> = ({ events, currentUser, shifts, team, context, activeBusiness, businesses, onCreateNew, onEdit, onDelete, onUpdateEvent }) => {
  const [filterType, setFilterType] = useState<'all' | 'Performance' | 'Table Reservation' | 'Celebration' | 'Corporate Event' | 'Themed Night'>('all');
  const isAuthorized = currentUser.role === UserRole.OWNER || currentUser.role === UserRole.MANAGER;

  const filteredEvents = events.filter(e => (filterType === 'all' || e.type === filterType));
  const getBiz = (id: string) => businesses.find(b => b.id === id);

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Sector Events</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto">
            {['all', 'Performance', 'Themed Night', 'Celebration', 'Corporate Event', 'Table Reservation'].map(tab => (
              <button key={tab} onClick={() => setFilterType(tab as any)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === tab ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.replace('Table Reservation', 'Bookings')}
              </button>
            ))}
          </div>
        </div>
        {isAuthorized && (
          <button onClick={onCreateNew} className="bg-brand-primary text-white px-10 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-transform">
            <Plus size={18} /> New Entry
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredEvents.map(event => {
          const biz = getBiz(event.context);
          return (
            <div key={event.id} className="bg-white rounded-[40px] shadow-xl border-2 overflow-hidden group transition-all hover:border-brand-primary/20" style={{ borderColor: biz?.primaryColor + '10' }}>
              <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-6">
                   <div className="p-4 rounded-2xl text-white shadow-lg" style={{ backgroundColor: biz?.primaryColor }}>
                      {event.type === 'Performance' ? <Headphones size={28} /> : <Calendar size={28} />}
                   </div>
                   <div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">{event.name}</h3>
                         <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: biz?.primaryColor }}>{biz?.prefix} Protocol</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{event.date} • {event.startTime} • {event.type}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => onDelete(event.id)} className="p-3 bg-white text-slate-200 hover:text-red-500 rounded-2xl transition-all shadow-sm border border-slate-100"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventModule;
