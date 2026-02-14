
import React, { useState, useMemo, useEffect } from 'react';
import { Shift, TeamMember, ShiftType, ProjectContext, Sector, UserRole, Business } from '../types';
import { MapPin, Clock, Calendar as CalendarIcon, Filter, Layers, Zap, Info, ShieldCheck, Trash2, Plus, X, Save, Edit3, UserCheck, User, ListOrdered, Group, ArrowRight, Bus, Map, MapPinned, Link as LinkIcon, CheckCircle2, Brain, Sparkles, Shield, Brush, Key, Moon, Utensils, Coffee, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { synthesizeShiftSchedule } from '../services/geminiService';
import { TimePicker } from './CustomInputs';

interface ShiftPlannerProps {
  shifts: Shift[];
  team: TeamMember[];
  activeSector: Sector;
  businesses: Business[];
  currentUser: TeamMember;
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onUpdateShift: (id: string, updates: Partial<Shift>) => void;
  onDeleteShift: (id: string) => void;
}

const HOSPITALITY_TYPES = [
  ShiftType.PREP, ShiftType.OPENING, ShiftType.LUNCH, 
  ShiftType.DINNER, ShiftType.EVENT, ShiftType.CLOSING, ShiftType.SECURITY
];

const HOTEL_TYPES = [
  ShiftType.FRONT_DESK, ShiftType.KITCHEN, ShiftType.PREP, 
  ShiftType.BREAKFAST, ShiftType.LUNCH, ShiftType.DINNER, 
  ShiftType.CLOSING, ShiftType.OPENING, ShiftType.SECURITY, 
  ShiftType.HOUSEKEEPING
];

const ShiftPlanner: React.FC<ShiftPlannerProps> = ({ shifts, team, activeSector, businesses, currentUser, onAddShift, onUpdateShift, onDeleteShift }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortMode, setSortMode] = useState<'time' | 'personnel'>('time');
  const [isAiSynthesizing, setIsAiSynthesizing] = useState(false);
  const [draftStack, setDraftStack] = useState<Omit<Shift, 'id'>[]>([]);

  const activeBusiness = businesses.find(b => b.sector === activeSector);
  const currentContext = activeBusiness?.id || 'b1';

  const [formData, setFormData] = useState<Partial<Shift>>({
    memberId: '',
    location: '',
    types: [],
    startTime: '10:00',
    endTime: '15:00',
    context: currentContext,
    requiresTransport: false,
    transportRegion: '',
    status: 'active',
    source: 'manual'
  });

  const isManager = currentUser.role === UserRole.OWNER || currentUser.role === UserRole.MANAGER;

  const getMember = (id: string) => team.find(m => m.id === id);
  const getBusiness = (id: string) => businesses.find(b => b.id === id);

  const shiftTypeStyles: Record<ShiftType, { color: string, icon: any, label: string }> = {
    [ShiftType.PREP]: { color: 'bg-emerald-400', icon: Map, label: 'Kitchen Prep' },
    [ShiftType.OPENING]: { color: 'bg-indigo-400', icon: Clock, label: 'Opening Duty' },
    [ShiftType.LUNCH]: { color: 'bg-orange-500', icon: Zap, label: 'Lunch Service' },
    [ShiftType.DINNER]: { color: 'bg-indigo-600', icon: Zap, label: 'Dinner Service' },
    [ShiftType.EVENT]: { color: 'bg-brand-primary', icon: CalendarIcon, label: 'Special Event' },
    [ShiftType.CLOSING]: { color: 'bg-slate-800', icon: Brush, label: 'Closing & Cleaning' },
    [ShiftType.FRONT_DESK]: { color: 'bg-blue-500', icon: Key, label: 'Front Desk' },
    [ShiftType.BREAKFAST]: { color: 'bg-amber-400', icon: Coffee, label: 'Breakfast Service' },
    [ShiftType.SECURITY]: { color: 'bg-red-600', icon: Shield, label: 'Security Detail' },
    [ShiftType.HOUSEKEEPING]: { color: 'bg-teal-500', icon: Brush, label: 'Housekeeping' },
    [ShiftType.KITCHEN]: { color: 'bg-orange-600', icon: Utensils, label: 'Kitchen Ops' },
  };

  // ISOLATED DEPLOYMENT ZONES - UPDATED AS PER REQUEST
  const locations = useMemo(() => {
    if (activeSector === Sector.THE_YARD) {
      return [
        { name: 'Main Floor', color: 'bg-brand-primary', zone: 'FOH' },
        { name: 'Upper Deck', color: 'bg-emerald-500', zone: 'FOH' },
        { name: 'Back of House / Kitchen', color: 'bg-orange-600', zone: 'BOH' },
        { name: 'Bar', color: 'bg-indigo-600', zone: 'SERVICE' },
        { name: 'Entrance / Host Stand', color: 'bg-slate-700', zone: 'GUEST RELATIONS' },
      ];
    } else if (activeSector === Sector.SUNDAY_THEORY) {
      return [
        { name: 'Zone 1', color: 'bg-indigo-500', zone: 'MAIN' },
        { name: 'Zone 2 (VIP)', color: 'bg-brand-accent', zone: 'ELITE' },
        { name: 'Entrance / Host Stand', color: 'bg-slate-700', zone: 'GUEST RELATIONS' },
        { name: 'Back of House / Kitchen', color: 'bg-orange-600', zone: 'BOH' },
        { name: 'Bar', color: 'bg-indigo-600', zone: 'SERVICE' },
        { name: 'Technical Booth', color: 'bg-slate-900', zone: 'AV OPS' },
      ];
    } else {
      // THE THIRD SPACE (HOTEL)
      return [
        { name: 'Front of House / Reception', color: 'bg-blue-500', zone: 'LOBBY' },
        { name: 'Housekeeping', color: 'bg-teal-500', zone: 'SERVICES' },
        { name: 'Kitchen', color: 'bg-orange-600', zone: 'F&B' },
        { name: 'Bar Server', color: 'bg-indigo-400', zone: 'F&B' },
        { name: 'Maintenance', color: 'bg-red-500', zone: 'FACILITIES' },
      ];
    }
  }, [activeSector]);

  useEffect(() => {
    if (isModalOpen) {
      setFormData(prev => ({ 
        ...prev, 
        context: currentContext,
        location: locations[0]?.name || ''
      }));
    }
  }, [isModalOpen, currentContext, locations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || (formData.types?.length === 0 && draftStack.length === 0)) return;

    if (formData.types && formData.types.length > 0) {
      onAddShift({ ...formData, context: currentContext } as Omit<Shift, 'id'>);
    }
    draftStack.forEach(s => onAddShift({ ...s, context: currentContext }));
    setDraftStack([]);
    setIsModalOpen(false);
  };

  const processedShifts = useMemo(() => {
    let list = [...shifts];
    if (sortMode === 'time') {
      return list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    } else {
      return list.sort((a, b) => {
        const nameA = getMember(a.memberId)?.name || '';
        const nameB = getMember(b.memberId)?.name || '';
        return nameA.localeCompare(nameB);
      });
    }
  }, [shifts, sortMode]);

  const activeTypes = activeSector === Sector.HOTEL ? HOTEL_TYPES : HOSPITALITY_TYPES;

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Shift Architecture</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Registry synchronized to 2026. Sector Deployment active.</p>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit mt-6">
            <button onClick={() => setSortMode('time')} className={`p-3 rounded-xl transition-all ${sortMode === 'time' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><ListOrdered size={18} /></button>
            <button onClick={() => setSortMode('personnel')} className={`p-3 rounded-xl transition-all ${sortMode === 'personnel' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><Group size={18} /></button>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setFormData({...formData, types: []}); setIsModalOpen(true); }} className="bg-brand-primary text-white px-10 py-4 rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform flex items-center gap-3">
            <Plus size={18} /> Establish Duty
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[60px] shadow-2xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Personnel</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Entity</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Duty Specification</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tactical Zone</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Window</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {processedShifts.length === 0 ? (
                <tr><td colSpan={6} className="px-10 py-20 text-center opacity-30 italic font-black uppercase text-xs">No deployments assigned for 2026 yet.</td></tr>
              ) : processedShifts.map((shift, idx) => {
                const member = getMember(shift.memberId);
                const biz = getBusiness(shift.context);
                const showMember = sortMode === 'time' || idx === 0 || processedShifts[idx-1].memberId !== shift.memberId;
                const isPending = shift.status === 'pending-approval';

                return (
                  <tr key={shift.id} className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${isPending ? 'bg-indigo-50/10' : ''}`}>
                    <td className="px-10 py-8">
                      {showMember ? (
                        <div className="flex items-center gap-5">
                          <img src={member?.avatar} className="w-14 h-14 rounded-[20px] object-cover border-2 border-white shadow-md" alt="" />
                          <div><p className="text-base font-black text-slate-800 tracking-tight leading-none">{member?.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{member?.role}</p></div>
                        </div>
                      ) : <div className="ml-16 h-4 w-px bg-slate-100" />}
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: biz?.primaryColor }} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{biz?.name}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-wrap gap-2">
                        {shift.types.map(t => {
                          const typeInfo = shiftTypeStyles[t];
                          return (
                            <div key={t} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                               <div className={`p-1 rounded ${typeInfo?.color || 'bg-slate-500'} text-white`}><DynamicIcon icon={typeInfo?.icon || Clock} /></div>
                               <span className="text-[9px] font-black uppercase text-slate-700">{typeInfo?.label || t}</span>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-xs font-black text-slate-700 uppercase italic"><MapPin size={16} className="text-brand-primary inline mr-2" />{shift.location}</td>
                    <td className="px-10 py-8 text-xs font-mono font-black text-slate-600">{shift.startTime} — {shift.endTime}</td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl text-emerald-600">
                            <ShieldCheck size={12} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); onDeleteShift(shift.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[95vh]">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-slate-900 text-white">
                    <Zap size={24} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Deployment Architect</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">2026 Protocol Deployment: {activeSector.toUpperCase()}</p>
                 </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setDraftStack([]); }} className="p-4 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <div className="lg:col-span-4 space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assigned Personnel</label>
                       <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {team.map(m => (
                             <button type="button" key={m.id} onClick={() => setFormData({...formData, memberId: m.id})}
                               className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all text-left ${formData.memberId === m.id ? 'bg-brand-primary border-brand-primary text-white shadow-xl scale-[1.02]' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'}`}
                             >
                                <img src={m.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                <div className="flex-1">
                                   <p className="text-sm font-black uppercase tracking-tight">{m.name}</p>
                                   <p className={`text-[9px] font-bold uppercase opacity-60`}>{m.role}</p>
                                </div>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Service Specification</label>
                          <div className="flex flex-wrap gap-2">
                             {activeTypes.map(type => (
                                <button key={type} type="button" onClick={() => {
                                  const current = formData.types || [];
                                  setFormData({
                                    ...formData,
                                    types: current.includes(type) ? current.filter(t => t !== type) : [...current, type]
                                  });
                                }}
                                  className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${formData.types?.includes(type) ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                >
                                   {shiftTypeStyles[type]?.icon && <div className={formData.types?.includes(type) ? 'text-brand-accent' : 'text-slate-300'}><DynamicIcon icon={shiftTypeStyles[type].icon} /></div>}
                                   {type.replace('-', ' ')}
                                </button>
                             ))}
                          </div>

                          <div className="space-y-4 pt-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Deployment Zone</label>
                             <div className="grid grid-cols-1 gap-2">
                                {locations.map(loc => (
                                   <button key={loc.name} type="button" onClick={() => setFormData({...formData, location: loc.name})}
                                     className={`px-4 py-4 rounded-2xl border-2 transition-all flex items-center justify-between ${formData.location === loc.name ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-slate-100'}`}
                                   >
                                      <span className="font-black text-[10px] uppercase tracking-widest">{loc.name}</span>
                                      <span className={`text-[8px] font-bold uppercase opacity-60`}>{loc.zone}</span>
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="space-y-8 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                          <div className="grid grid-cols-2 gap-6">
                             <TimePicker label="Shift Start" value={formData.startTime || ''} onChange={val => setFormData({...formData, startTime: val})} />
                             <TimePicker label="Shift End" value={formData.endTime || ''} onChange={val => setFormData({...formData, endTime: val})} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-8 border-t border-slate-100">
                 <button type="button" onClick={() => { setIsModalOpen(false); }} className="flex-1 py-7 bg-white border-2 border-slate-200 text-slate-400 rounded-[35px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Abort Deployment</button>
                 <button type="submit" disabled={!formData.memberId || formData.types?.length === 0} className="flex-[2] py-7 bg-brand-primary text-white rounded-[35px] font-black text-xl uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4">
                    Commit To Registry <Save size={24} />
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DynamicIcon = ({ icon: Icon }: { icon: any }) => <Icon size={12} />;

export default ShiftPlanner;
