
import React, { useState } from 'react';
import { TeamMember, PresenceStatus, UserRole, ProjectContext, Responsibility } from '../types';
import { Coffee, Briefcase, Home, Clock, ExternalLink, Plus, UserPlus, Trash2, Edit3, X, Save, ShieldCheck, Zap, Target, BellOff } from 'lucide-react';

interface PresenceHubProps {
  team: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id' | 'status'>) => void;
  onUpdateMember: (id: string, member: Partial<TeamMember>) => void;
  onDeleteMember: (id: string) => void;
  isManager: boolean;
}

const PresenceHub: React.FC<PresenceHubProps> = ({ team, onAddMember, onUpdateMember, onDeleteMember, isManager }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    role: UserRole.SERVER,
    avatar: 'https://picsum.photos/seed/new/150/150',
    pin: '',
    defaultContext: ProjectContext.THE_YARD,
    responsibilities: [Responsibility.DASHBOARD, Responsibility.TASKS, Responsibility.CALENDAR]
  });

  const getStatusInfo = (status: PresenceStatus) => {
    switch (status) {
      case PresenceStatus.AT_DESK: return { label: 'At Desk', color: 'text-green-600 bg-green-50', icon: Briefcase };
      case PresenceStatus.LUNCH: return { label: 'On Lunch', color: 'text-amber-600 bg-amber-50', icon: Coffee };
      case PresenceStatus.MEETING: return { label: 'In Meeting', color: 'text-indigo-600 bg-indigo-50', icon: Clock };
      case PresenceStatus.OUT_OF_OFFICE: return { label: 'Out of Office', color: 'text-slate-600 bg-slate-100', icon: Home };
      case PresenceStatus.LEAVE: return { label: 'On Leave', color: 'text-red-600 bg-red-50', icon: ExternalLink };
      case PresenceStatus.ON_SHIFT: return { label: 'On Shift', color: 'text-emerald-600 bg-emerald-50', icon: Zap };
      case PresenceStatus.FOCUS: return { label: 'Deep Focus', color: 'text-brand-primary bg-brand-primary/5', icon: Target };
      default: return { label: 'Unknown', color: 'text-slate-400 bg-slate-50', icon: Briefcase };
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: UserRole.SERVER,
      avatar: `https://picsum.photos/seed/${Date.now()}/150/150`,
      pin: '',
      defaultContext: ProjectContext.THE_YARD,
      responsibilities: [Responsibility.DASHBOARD, Responsibility.TASKS, Responsibility.CALENDAR]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateMember(editingId, formData);
    } else {
      onAddMember(formData as Omit<TeamMember, 'id' | 'status'>);
    }
    setIsModalOpen(false);
  };

  const toggleResponsibility = (resp: Responsibility) => {
    setFormData(prev => {
      const resps = prev.responsibilities || [];
      const exists = resps.includes(resp);
      return {
        ...prev,
        responsibilities: exists ? resps.filter(r => r !== resp) : [...resps, resp]
      };
    });
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Staff Ecosystem</h2>
          <div className="flex items-center gap-3">
             <div className="h-1 w-20 bg-brand-primary rounded-full" />
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Managing personnel lifecycle, status, and permissions.</p>
          </div>
        </div>
        {isManager && (
          <button 
            onClick={openAddModal}
            className="bg-brand-primary text-white px-10 py-5 rounded-[25px] text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/30 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <UserPlus size={18} /> Onboard Personnel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {team.map((member) => {
          const info = getStatusInfo(member.status);
          const isFocus = member.status === PresenceStatus.FOCUS;
          
          return (
            <div key={member.id} className={`bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border-2 transition-all group relative overflow-hidden ${isFocus ? 'border-brand-primary/30 ring-4 ring-brand-primary/5' : 'border-white/50 hover:border-brand-primary/20'}`}>
              {isFocus && (
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-primary animate-pulse" />
              )}
              
              <div className="absolute top-0 right-0 p-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 {isManager && (
                   <>
                     <button onClick={() => openEditModal(member)} className="p-3 bg-slate-100 text-slate-400 hover:bg-brand-primary hover:text-white rounded-2xl transition-all shadow-sm"><Edit3 size={16} /></button>
                     <button onClick={() => onDeleteMember(member.id)} className="p-3 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={16} /></button>
                   </>
                 )}
              </div>

              <div className="flex items-start gap-6 mb-8">
                <div className="relative">
                  <img src={member.avatar} className={`w-20 h-20 rounded-[30px] object-cover border-4 border-slate-50 shadow-lg ${isFocus ? 'grayscale-0' : ''}`} alt={member.name} />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${
                    member.status === PresenceStatus.AT_DESK ? 'bg-green-500' : 
                    member.status === PresenceStatus.LUNCH ? 'bg-amber-500' : 
                    member.status === PresenceStatus.ON_SHIFT ? 'bg-emerald-500' : 
                    member.status === PresenceStatus.FOCUS ? 'bg-brand-primary' :
                    'bg-slate-300'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{member.name}</h3>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{member.role}</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-3 ${info.color}`}>
                    <info.icon size={12} />
                    {info.label}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                 {isFocus && (
                    <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-center gap-3">
                       <BellOff size={16} className="text-brand-primary" />
                       <div className="flex-1">
                          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Do Not Disturb</p>
                          <p className="text-[11px] font-bold text-slate-600">Deep Work Session Active</p>
                       </div>
                    </div>
                 )}

                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Responsibilities</p>
                    <div className="flex flex-wrap gap-2">
                       {member.responsibilities.slice(0, 4).map(r => (
                         <span key={r} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-tight">{r.replace('-', ' ')}</span>
                       ))}
                    </div>
                 </div>

                 {member.status === PresenceStatus.FOCUS && member.statusExpiresAt && (
                   <div className="flex items-center gap-2 text-brand-primary bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10">
                     <Clock size={16} />
                     <p className="text-xs font-bold italic">Available again at {new Date(member.statusExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">{editingId ? 'Modify Personnel' : 'Personnel Onboarding'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configuring identity and system clearance.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 {/* Identity Info */}
                 <div className="space-y-8">
                    <div className="flex items-center gap-8">
                       <div className="relative group">
                          <img src={formData.avatar} className="w-32 h-32 rounded-[40px] object-cover border-8 border-slate-50 shadow-2xl" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px] flex items-center justify-center">
                             <Edit3 className="text-white" size={24} />
                          </div>
                       </div>
                       <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Identity</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Full Name"
                            className="w-full px-8 py-5 bg-slate-50 rounded-[25px] border-2 border-transparent focus:border-brand-primary outline-none font-bold text-xl"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Avatar URL (External Link)</label>
                       <input 
                        type="text" 
                        placeholder="https://..."
                        className="w-full px-8 py-4 bg-slate-50 rounded-[20px] font-mono text-xs border-2 border-transparent focus:border-brand-primary outline-none"
                        value={formData.avatar}
                        onChange={e => setFormData({...formData, avatar: e.target.value})}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Operating Role</label>
                          <select 
                            className="w-full px-6 py-5 bg-slate-50 rounded-[20px] font-black text-[10px] uppercase tracking-widest outline-none border-2 border-transparent focus:border-brand-primary"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                          >
                             {Object.values(UserRole).map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Access PIN</label>
                          <input 
                            type="password" 
                            maxLength={4}
                            placeholder="4 Digits"
                            className="w-full px-8 py-5 bg-slate-50 rounded-[20px] font-black text-center tracking-[1em] outline-none border-2 border-transparent focus:border-brand-primary"
                            value={formData.pin}
                            onChange={e => setFormData({...formData, pin: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>

                 {/* Responsibilities */}
                 <div className="bg-slate-50 p-10 rounded-[50px] border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                       <ShieldCheck className="text-brand-primary" size={24} />
                       <h4 className="text-xl font-black uppercase tracking-tighter italic">Responsibilities</h4>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-relaxed">Select system modules this personnel is authorized to access and manage.</p>
                    
                    <div className="grid grid-cols-2 gap-3 flex-1">
                       {Object.values(Responsibility).map(resp => (
                         <button
                           key={resp}
                           type="button"
                           onClick={() => toggleResponsibility(resp)}
                           className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-3 ${formData.responsibilities?.includes(resp) ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white border-white text-slate-400 hover:border-slate-200'}`}
                         >
                            <div className={`w-2 h-2 rounded-full ${formData.responsibilities?.includes(resp) ? 'bg-white' : 'bg-slate-100'}`} />
                            {resp.replace('-', ' ')}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex gap-6">
                 <button 
                  type="submit"
                  className="flex-1 py-7 bg-brand-primary text-white rounded-[30px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                 >
                   {editingId ? 'Update Clearance' : 'Commit Personnel'} <Save size={24} />
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresenceHub;
