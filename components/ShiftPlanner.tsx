
import React, { useState, useMemo, useEffect } from 'react';
import { Shift, TeamMember, ShiftType, ProjectContext } from '../types';
import { MapPin, Clock, Calendar as CalendarIcon, Filter, Layers, Zap, Info, ShieldCheck, Trash2, Plus, X, Save, Edit3, UserCheck, User, ListOrdered, Group, ArrowRight, Bus, Map, MapPinned, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface ShiftPlannerProps {
  shifts: Shift[];
  team: TeamMember[];
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onUpdateShift: (id: string, updates: Partial<Shift>) => void;
  onDeleteShift: (id: string) => void;
}

const TRANSPORT_REGIONS = [
  "City Bowl / Central",
  "Northern Suburbs Hub",
  "Southern Peninsula",
  "Eastern Township Corridor",
  "Western Coast Coastline",
  "Winelands Express"
];

const ShiftPlanner: React.FC<ShiftPlannerProps> = ({ shifts, team, onAddShift, onUpdateShift, onDeleteShift }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'time' | 'personnel'>('time');
  const [formData, setFormData] = useState<Partial<Shift>>({
    memberId: '',
    location: 'Kitchen',
    type: ShiftType.LUNCH,
    startTime: '10:00',
    endTime: '15:00',
    context: ProjectContext.THE_YARD,
    requiresTransport: false,
    transportRegion: ''
  });

  const getMember = (id: string) => team.find(m => m.id === id);

  const shiftTypeStyles: Record<ShiftType, { color: string, icon: any, label: string }> = {
    [ShiftType.PREP]: { color: 'bg-emerald-400', icon: Map, label: 'Kitchen Prep' },
    [ShiftType.PRE_DUTY]: { color: 'bg-indigo-400', icon: Clock, label: 'Opening Duty' },
    [ShiftType.LUNCH]: { color: 'bg-orange-500', icon: Zap, label: 'Lunch Service' },
    [ShiftType.DINNER]: { color: 'bg-indigo-600', icon: Zap, label: 'Dinner Service' },
    [ShiftType.EVENT]: { color: 'bg-brand-primary', icon: CalendarIcon, label: 'Special Event' },
    [ShiftType.CLOSING]: { color: 'bg-slate-800', icon: Layers, label: 'Closing Shift' },
  };

  const locations = [
    { name: 'Kitchen', color: 'bg-brand-primary', zone: 'Utility' },
    { name: 'Front of House', color: 'bg-brand-accent', zone: 'Guest Facing' },
    { name: 'Yard Lower Level', color: 'bg-emerald-500', zone: 'The Yard' },
    { name: 'Yard Upper Level', color: 'bg-emerald-600', zone: 'The Yard' },
    { name: 'Theory VIP', color: 'bg-indigo-600', zone: 'Sunday Theory' },
    { name: 'Theory General', color: 'bg-indigo-500', zone: 'Sunday Theory' },
    { name: 'Theory Bar', color: 'bg-brand-accent', zone: 'Sunday Theory' },
    { name: 'Theory Kitchen', color: 'bg-brand-primary', zone: 'Sunday Theory' },
  ];

  // Refined Intelligent Time Auto-Fill Logic
  const applyDefaultTimes = (type: ShiftType, location: string) => {
    let start = '10:00';
    let end = '15:00';

    switch (type) {
      case ShiftType.PREP:
        start = '07:00';
        end = '10:00';
        break;
      case ShiftType.PRE_DUTY:
        start = '08:00';
        end = '10:00';
        break;
      case ShiftType.LUNCH:
        start = '10:00';
        end = '15:00';
        break;
      case ShiftType.DINNER:
        start = '15:00';
        end = '21:00';
        break;
      case ShiftType.CLOSING:
        start = '21:00';
        end = '23:00';
        break;
      case ShiftType.EVENT:
        start = '18:00';
        end = '00:00';
        break;
    }

    setFormData(prev => ({ 
      ...prev, 
      type, 
      location, 
      startTime: start, 
      endTime: end,
      requiresTransport: (start <= '07:30' || end >= '22:30') ? true : prev.requiresTransport
    }));
  };

  const applyComboShift = (combo: 'opening-lunch' | 'dinner-closing') => {
    if (combo === 'opening-lunch') {
      setFormData(prev => ({
        ...prev,
        type: ShiftType.LUNCH,
        startTime: '08:00',
        endTime: '15:00',
        requiresTransport: true
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        type: ShiftType.CLOSING,
        startTime: '15:00',
        endTime: '23:00',
        requiresTransport: true
      }));
    }
  };

  const openAddModal = (memberId?: string) => {
    setEditingShiftId(null);
    setFormData({
      memberId: memberId || team[0]?.id || '',
      location: 'Front of House',
      type: ShiftType.LUNCH,
      startTime: '10:00',
      endTime: '15:00',
      context: ProjectContext.THE_YARD,
      requiresTransport: false,
      transportRegion: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (shift: Shift) => {
    setEditingShiftId(shift.id);
    setFormData(shift);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent, close: boolean = true) => {
    e.preventDefault();
    if (!formData.memberId || !formData.location) return;

    if (editingShiftId) {
      onUpdateShift(editingShiftId, formData);
    } else {
      onAddShift(formData as Omit<Shift, 'id'>);
    }
    
    if (close) {
      setIsModalOpen(false);
    }
  };

  const shiftCountPerMember = useMemo(() => {
    const counts: Record<string, number> = {};
    shifts.forEach(s => {
      counts[s.memberId] = (counts[s.memberId] || 0) + 1;
    });
    return counts;
  }, [shifts]);

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

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Workforce Deployment</h2>
          <div className="flex items-center gap-3">
             <div className="h-1 w-20 bg-brand-primary rounded-full" />
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Managing service hours, combo duties, and regional transit logistics.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm mr-4">
            <button 
              onClick={() => setSortMode('time')}
              className={`p-3 rounded-xl transition-all ${sortMode === 'time' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              title="Sort by Chronology"
            >
              <ListOrdered size={18} />
            </button>
            <button 
              onClick={() => setSortMode('personnel')}
              className={`p-3 rounded-xl transition-all ${sortMode === 'personnel' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              title="Sort by Personnel"
            >
              <Group size={18} />
            </button>
          </div>
          <button 
            onClick={() => openAddModal()}
            className="bg-brand-primary text-white px-10 py-4 rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/30 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <Plus size={18} /> Assign Duty
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {locations.map(loc => (
          <div key={loc.name} className="bg-white p-8 rounded-[40px] border border-white/50 shadow-xl shadow-black/5 group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${loc.color} opacity-[0.03] -translate-y-1/2 translate-x-1/2 rounded-full`} />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${loc.color}`} />
                <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{loc.name}</h4>
              </div>
              <Info size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-5xl font-black text-slate-800 italic tracking-tighter leading-none">
              {shifts.filter(s => s.location === loc.name).length}
            </p>
            <p className="text-[9px] text-slate-400 uppercase font-black mt-4 tracking-[0.2em]">{loc.zone}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[60px] shadow-2xl shadow-black/5 border border-white/50 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">
                Live Shift Registry {sortMode === 'personnel' && <span className="text-brand-primary">(Grouped)</span>}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit staffing density, service windows, and transit needs.</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="bg-brand-primary/5 text-brand-primary px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-brand-primary/10 flex items-center gap-2">
                 <Bus size={14} /> Transit Planning Sync
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Personnel</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Shift Type</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tactical Zone</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Window</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Logistics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {processedShifts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">
                    No deployments assigned.
                  </td>
                </tr>
              ) : processedShifts.map((shift, idx) => {
                const member = getMember(shift.memberId);
                const typeInfo = shiftTypeStyles[shift.type] || { color: 'bg-slate-400', icon: CalendarIcon, label: 'General' };
                const isDouble = shiftCountPerMember[shift.memberId] > 1;
                const showMember = sortMode === 'time' || idx === 0 || processedShifts[idx-1].memberId !== shift.memberId;

                return (
                  <tr key={shift.id} className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${!showMember ? 'border-none' : ''}`} onClick={() => openEditModal(shift)}>
                    <td className="px-10 py-8">
                      {showMember ? (
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <img src={member?.avatar} className="w-14 h-14 rounded-[20px] object-cover border-2 border-white shadow-md" alt="" />
                            {isDouble && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                <Layers size={10} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="text-base font-black text-slate-800 tracking-tight leading-none">{member?.name}</p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{member?.role}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-14 ml-5">
                          <div className="h-4 w-px bg-slate-100" />
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${typeInfo.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                           <typeInfo.icon size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-700 italic">
                          {typeInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-xs font-black text-slate-700 uppercase tracking-tighter italic">
                        <MapPin size={16} className="text-brand-primary" />
                        {shift.location}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-xs font-mono font-black text-slate-600">
                        <Clock size={16} className="text-slate-300" />
                        {shift.startTime} — {shift.endTime}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                         {shift.requiresTransport ? (
                           <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-indigo-600">
                             <Bus size={14} fill="currentColor" className="opacity-30" />
                             <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[100px]">{shift.transportRegion || 'Required'}</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-slate-400">
                             <CheckCircle2 size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Self</span>
                           </div>
                         )}
                         <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteShift(shift.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-red-500"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment Architect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">{editingShiftId ? 'Modify Deployment' : 'Shift Architect'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Refining service windows and staff logistics.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={(e) => handleSubmit(e)} className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 {/* Left: Personnel & Transit */}
                 <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Target</label>
                       <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                          {team.map(m => {
                            const count = shiftCountPerMember[m.id] || 0;
                            return (
                             <button
                               type="button"
                               key={m.id}
                               onClick={() => setFormData({...formData, memberId: m.id})}
                               className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all text-left group ${formData.memberId === m.id ? 'bg-brand-primary border-brand-primary text-white shadow-xl' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'}`}
                             >
                                <div className="relative">
                                  <img src={m.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                  {count > 0 && (
                                    <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                      {count}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                   <p className="text-sm font-black uppercase tracking-tight">{m.name}</p>
                                   <p className={`text-[9px] font-bold uppercase ${formData.memberId === m.id ? 'text-white/60' : 'text-slate-400'}`}>{m.role}</p>
                                </div>
                             </button>
                            );
                          })}
                       </div>
                    </div>

                    <div className={`p-8 rounded-[40px] border-2 transition-all ${formData.requiresTransport ? 'bg-indigo-50 border-indigo-200 ring-4 ring-indigo-500/5' : 'bg-slate-50 border-transparent opacity-60'}`}>
                       <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                             <Bus size={20} className={formData.requiresTransport ? 'text-indigo-600' : 'text-slate-400'} />
                             <h4 className={`text-sm font-black uppercase tracking-widest italic ${formData.requiresTransport ? 'text-indigo-900' : 'text-slate-500'}`}>Transit Required</h4>
                          </div>
                          <div 
                            onClick={() => setFormData({...formData, requiresTransport: !formData.requiresTransport})}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all flex items-center ${formData.requiresTransport ? 'bg-indigo-500' : 'bg-slate-300'}`}
                          >
                             <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.requiresTransport ? 'translate-x-6' : ''}`} />
                          </div>
                       </div>
                       
                       {formData.requiresTransport && (
                         <div className="space-y-4 animate-in zoom-in-95 duration-200">
                            <p className="text-[9px] font-bold text-indigo-700/60 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPinned size={12} /> Regional Hubs</p>
                            <div className="grid grid-cols-1 gap-2">
                               {TRANSPORT_REGIONS.map(region => (
                                 <button
                                   type="button"
                                   key={region}
                                   onClick={() => setFormData({...formData, transportRegion: region})}
                                   className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all text-left flex items-center gap-2 ${formData.transportRegion === region ? 'bg-white border-indigo-400 text-indigo-600 shadow-md' : 'bg-white/50 border-transparent text-slate-400 hover:border-slate-200'}`}
                                 >
                                    <div className={`w-1.5 h-1.5 rounded-full ${formData.transportRegion === region ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                                    {region}
                                 </button>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Middle/Right: Configuration */}
                 <div className="lg:col-span-2 space-y-8">
                    {/* Combos Row */}
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Optimized Service Presets</label>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => applyComboShift('opening-lunch')}
                            className={`border-2 p-6 rounded-[35px] text-left transition-all group relative overflow-hidden ${formData.startTime === '08:00' && formData.endTime === '15:00' ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl' : 'bg-white border-slate-100 hover:border-indigo-400'}`}
                          >
                             <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-xl shadow-sm ${formData.startTime === '08:00' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-500'}`}><LinkIcon size={16} /></div>
                                <span className={`text-[11px] font-black uppercase tracking-widest ${formData.startTime === '08:00' ? 'text-white' : 'text-indigo-900'}`}>Opening + Lunch</span>
                             </div>
                             <p className={`text-[10px] font-bold italic leading-tight ${formData.startTime === '08:00' ? 'text-white/60' : 'text-indigo-700/60'}`}>Combined Block: 08:00 — 15:00</p>
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => applyComboShift('dinner-closing')}
                            className={`border-2 p-6 rounded-[35px] text-left transition-all group relative overflow-hidden ${formData.startTime === '15:00' && formData.endTime === '23:00' ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' : 'bg-white border-slate-100 hover:border-brand-primary'}`}
                          >
                             <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-xl shadow-sm ${formData.startTime === '15:00' && formData.endTime === '23:00' ? 'bg-white/20 text-brand-accent' : 'bg-slate-100 text-brand-primary'}`}><Layers size={16} /></div>
                                <span className={`text-[11px] font-black uppercase tracking-widest ${formData.startTime === '15:00' && formData.endTime === '23:00' ? 'text-white' : 'text-slate-800'}`}>Dinner + Closing</span>
                             </div>
                             <p className={`text-[10px] font-bold italic leading-tight ${formData.startTime === '15:00' && formData.endTime === '23:00' ? 'text-white/40' : 'text-slate-400'}`}>Combined Block: 15:00 — 23:00</p>
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tactical Zone</label>
                          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                             {locations.map(loc => (
                                <button
                                  type="button"
                                  key={loc.name}
                                  onClick={() => applyDefaultTimes(formData.type as ShiftType, loc.name)}
                                  className={`px-4 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-3 ${formData.location === loc.name ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                >
                                   <div className={`w-2 h-2 rounded-full ${formData.location === loc.name ? 'bg-white' : loc.color}`} />
                                   {loc.name}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-8">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Service Classification</label>
                             <div className="flex flex-wrap gap-2">
                                {Object.values(ShiftType).map(type => (
                                   <button
                                     type="button"
                                     key={type}
                                     onClick={() => applyDefaultTimes(type, formData.location || 'Front of House')}
                                     className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === type ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                   >
                                      {type.replace('-', ' ')}
                                   </button>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 relative">
                             <div className="absolute -top-6 right-0 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                                <Zap size={10} fill="currentColor" />
                                <span className="text-[8px] font-black uppercase tracking-widest italic">Service Standard Active</span>
                             </div>
                             <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Shift Start</label>
                                  <input 
                                    type="time" 
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-brand-primary transition-all text-sm"
                                    value={formData.startTime}
                                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Shift End</label>
                                  <input 
                                    type="time" 
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-brand-primary transition-all text-sm"
                                    value={formData.endTime}
                                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                                  />
                                </div>
                             </div>
                          </div>
                          
                          <div className="p-6 bg-brand-primary/5 rounded-[35px] border border-brand-primary/10">
                             <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info size={14} /> Operational Context
                             </p>
                             <p className="text-[11px] font-bold text-slate-600 leading-snug italic">
                                Shifts starting at 07:00 (Prep) or 08:00 (Opening) or ending at 23:00 (Closing) trigger automated logistics suggestions.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex gap-6 pt-8 border-t border-slate-100">
                 {!editingShiftId && (
                   <button 
                    type="button"
                    onClick={(e) => {
                       handleSubmit(e as any, false);
                       setFormData(prev => ({ ...prev, type: ShiftType.LUNCH, location: 'Front of House' }));
                    }}
                    className="flex-1 py-7 bg-white border-2 border-slate-200 text-slate-500 rounded-[30px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                   >
                     <Layers size={18} /> Stack Next Duty
                   </button>
                 )}
                 <button 
                  type="submit"
                  className="flex-[2] py-7 bg-brand-primary text-white rounded-[30px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                 >
                   {editingShiftId ? 'Update Deployment' : 'Authorize Placement'} <Save size={24} />
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftPlanner;
