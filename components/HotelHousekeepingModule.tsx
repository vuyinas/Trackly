
import React, { useState, useMemo } from 'react';
import { Room, RoomStatusType, HousekeepingTask, TeamMember, Responsibility } from '../types';
import { Brush, CheckCircle2, AlertCircle, Clock, ShieldCheck, User, ChevronRight, ListChecks, Droplets, Sparkles, Wand2, X, Save, ClipboardList, Bed, UserPlus, Zap } from 'lucide-react';

interface HotelHousekeepingProps {
  rooms: Room[];
  tasks: HousekeepingTask[];
  team: TeamMember[];
  onUpdateRoom: (id: string, status: RoomStatusType) => void;
  onAddTask: (task: Partial<HousekeepingTask>) => void;
  onUpdateTask: (id: string, updates: Partial<HousekeepingTask>) => void;
}

const HotelHousekeepingModule: React.FC<HotelHousekeepingProps> = ({ rooms, tasks, team, onUpdateRoom, onAddTask, onUpdateTask }) => {
  const [filter, setFilter] = useState<'all' | RoomStatusType>('all');
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);

  const statusConfig: Record<RoomStatusType, { label: string, color: string, bg: string, icon: any }> = {
    'vacant-clean': { label: 'Ready', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 },
    'vacant-dirty': { label: 'Dirty', color: 'text-amber-500', bg: 'bg-amber-50', icon: Brush },
    'occupied': { label: 'In Use', color: 'text-indigo-500', bg: 'bg-indigo-50', icon: User },
    'maintenance': { label: 'Down', color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle },
    'blocker': { label: 'Blocked', color: 'text-slate-500', bg: 'bg-slate-100', icon: ShieldCheck }
  };

  const housekeepers = useMemo(() => {
    return team.filter(m => m.responsibilities.includes(Responsibility.HOUSEKEEPING));
  }, [team]);

  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'inspected'), [tasks]);
  const currentTask = activeTasks[activeTaskIndex];

  const getMember = (id?: string) => team.find(m => m.id === id);
  const getRoom = (id: string) => rooms.find(r => r.id === id);
  const getTaskForRoom = (roomId: string) => activeTasks.find(t => t.roomId === roomId);

  const roomsNeedingAttention = useMemo(() => {
    return rooms.filter(r => r.status === 'vacant-dirty' && !getTaskForRoom(r.id));
  }, [rooms, activeTasks]);

  const handleSmartAssign = (roomId: string) => {
    if (housekeepers.length === 0) return;
    
    // Simple load balancing: pick housekeeper with fewest active tasks
    const housekeeperStats = housekeepers.map(hk => ({
      id: hk.id,
      taskCount: activeTasks.filter(t => t.assignedTo === hk.id).length
    })).sort((a, b) => a.taskCount - b.taskCount);

    const bestFit = housekeeperStats[0].id;
    const room = rooms.find(r => r.id === roomId);

    onAddTask({
      roomId,
      assignedTo: bestFit,
      type: 'check-out',
      status: 'pending',
      checklist: [
        'Strip linens and towels',
        'Sanitize high-touch surfaces',
        'Vacuum and mop floors',
        'Restock mini-bar to FULL',
        'Final fragrance mist'
      ],
      brief: `Standard turnover for ${room?.type}. Priority: Immediate.`
    });
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Housekeeping Ops</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto">
            {['all', 'vacant-clean', 'vacant-dirty', 'occupied', 'maintenance', 'blocker'].map(t => (
              <button key={t} onClick={() => setFilter(t as any)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === t ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
           {roomsNeedingAttention.length > 0 && (
             <button 
                onClick={() => roomsNeedingAttention.forEach(r => handleSmartAssign(r.id))}
                className="bg-brand-primary text-white px-8 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
             >
                <Zap size={18} fill="currentColor" /> Smart-Assign All ({roomsNeedingAttention.length})
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* LEFT: QUEUE & ASSIGNMENTS */}
         <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase italic tracking-widest text-slate-800 flex items-center gap-3">
                 <ListChecks size={24} className="text-brand-primary" /> Personnel Deployment
              </h3>
              <span className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-slate-400">{activeTasks.length} Active Missions</span>
            </div>
            
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
               {activeTasks.map((task, idx) => {
                 const room = getRoom(task.roomId);
                 const hk = getMember(task.assignedTo);
                 return (
                   <button 
                    key={task.id} 
                    onClick={() => setActiveTaskIndex(idx)}
                    className={`w-full p-6 rounded-[35px] border-2 transition-all text-left flex items-center justify-between group ${activeTaskIndex === idx ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-50 shadow-xl hover:border-brand-primary/30'}`}
                   >
                      <div className="flex items-center gap-6">
                         <div className={`text-3xl font-black italic tracking-tighter ${activeTaskIndex === idx ? 'text-brand-accent' : 'text-slate-800'}`}>
                            {room?.roomNumber}
                         </div>
                         <div>
                            <p className={`text-[9px] font-black uppercase mb-1 ${activeTaskIndex === idx ? 'text-white/40' : 'text-slate-400'}`}>
                               {task.type.replace('-', ' ')}
                            </p>
                            <div className="flex items-center gap-2">
                               <img src={hk?.avatar} className="w-5 h-5 rounded-full object-cover border border-white/20" />
                               <span className={`text-[10px] font-bold uppercase ${activeTaskIndex === idx ? 'text-white' : 'text-slate-600'}`}>{hk?.name.split(' ')[0]}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${task.status === 'in-progress' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>{task.status}</span>
                        <ChevronRight size={16} className={activeTaskIndex === idx ? 'text-brand-accent' : 'text-slate-200'} />
                      </div>
                   </button>
                 );
               })}
               
               {roomsNeedingAttention.map(room => (
                 <div key={room.id} className="w-full p-6 rounded-[35px] border-2 border-dashed border-amber-200 bg-amber-50/30 flex items-center justify-between group animate-pulse">
                    <div className="flex items-center gap-6">
                       <div className="text-3xl font-black italic tracking-tighter text-amber-500">{room.roomNumber}</div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-amber-600 mb-1">Awaiting Assignment</p>
                          <p className="text-[10px] font-bold uppercase text-amber-400 tracking-widest">{room.type}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleSmartAssign(room.id)}
                      className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform"
                    >
                       <UserPlus size={18} />
                    </button>
                 </div>
               ))}
            </div>
         </div>

         {/* RIGHT: BRIEFING & EXECUTION */}
         <div className="lg:col-span-8">
            {currentTask ? (
               <div className="bg-white rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                     <div className="flex items-center gap-6">
                        <div className="p-4 bg-slate-900 text-brand-accent rounded-3xl shadow-xl"><Brush size={32} /></div>
                        <div>
                           <div className="flex items-center gap-3">
                              <h3 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">Room {getRoom(currentTask.roomId)?.roomNumber}</h3>
                              <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{getRoom(currentTask.roomId)?.type}</span>
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                              <Sparkles size={12} className="text-brand-primary" /> Active Protocol: {currentTask.assignedTo ? getMember(currentTask.assignedTo)?.name : 'Unassigned'}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <div className={`px-6 py-2 border rounded-2xl text-xs font-black uppercase tracking-widest ${currentTask.status === 'in-progress' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                           {currentTask.status}
                        </div>
                     </div>
                  </div>

                  <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-10">
                        <div className="space-y-4">
                           <h4 className="text-sm font-black uppercase italic text-slate-800 flex items-center gap-3"><ClipboardList size={18} className="text-brand-primary" /> Mission Checklist</h4>
                           <div className="space-y-3">
                              {currentTask.checklist?.map((item, i) => (
                                 <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-primary transition-all cursor-pointer">
                                    <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-white group-hover:border-brand-primary">
                                       <div className="w-2.5 h-2.5 rounded-sm bg-brand-primary opacity-0 group-hover:opacity-20" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 italic">"{item}"</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="space-y-10">
                        <div className="p-8 bg-slate-900 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
                           <div className="absolute top-0 right-0 p-10 opacity-5"><ShieldCheck size={160} /></div>
                           <div className="relative z-10">
                              <h4 className="text-xl font-black italic uppercase tracking-tighter text-brand-accent mb-8">Responsible Personnel</h4>
                              <div className="space-y-6">
                                 <div className="flex items-center gap-6">
                                    <img src={getMember(currentTask.assignedTo)?.avatar} className="w-20 h-20 rounded-[30px] object-cover border-4 border-white/20 shadow-xl" />
                                    <div>
                                       <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Primary Housekeeper</p>
                                       <p className="text-xl font-black italic uppercase">{getMember(currentTask.assignedTo)?.name}</p>
                                       <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Status: {getMember(currentTask.assignedTo)?.status.replace('-', ' ')}</p>
                                    </div>
                                 </div>
                                 <div className="space-y-4 pt-8 border-t border-white/5">
                                    <div className="flex justify-between text-xs font-bold text-white/40 uppercase">
                                       <span>Cycle Window</span>
                                       <span className="text-white">45 Minutes</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-white/40 uppercase">
                                       <span>Target Readiness</span>
                                       <span className="text-brand-accent">Today @ 15:30</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="relative z-10 flex gap-4">
                              {currentTask.status === 'pending' ? (
                                <button 
                                  onClick={() => onUpdateTask(currentTask.id, { status: 'in-progress', startTime: new Date().toISOString() })}
                                  className="w-full py-5 bg-brand-primary text-white rounded-[25px] text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
                                >
                                  Authorize Cycle Start
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    onUpdateTask(currentTask.id, { status: 'inspected', endTime: new Date().toISOString() });
                                    onUpdateRoom(currentTask.roomId, 'vacant-clean');
                                  }}
                                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[25px] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                                >
                                  <CheckCircle2 size={18} /> Inspect & Finalize
                                </button>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="h-full bg-white rounded-[60px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-12 opacity-30">
                  <div className="p-10 bg-slate-50 rounded-full mb-8"><Wand2 size={120} strokeWidth={1} className="text-slate-300" /></div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 mb-4">Registry Idle</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] max-w-sm mx-auto">All physical inventory is currently ready or in use. Pending dirty rooms will appear in the deployment queue.</p>
               </div>
            )}
         </div>
      </div>

      {/* INVENTORY QUICK GRID */}
      <div className="pt-12 border-t border-slate-200">
         <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800 mb-8 flex items-center gap-4"><Bed size={28} className="text-brand-primary" /> Real-Time Registry Recognition</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {rooms.map(room => {
               const config = statusConfig[room.status] || statusConfig['vacant-clean'];
               const task = getTaskForRoom(room.id);
               const responsible = task ? getMember(task.assignedTo) : null;

               return (
                  <div key={room.id} className="bg-white rounded-[35px] border border-slate-100 shadow-xl p-6 flex flex-col items-center text-center group hover:border-brand-primary transition-all relative overflow-hidden">
                     {room.status === 'vacant-dirty' && !task && (
                        <div className="absolute top-2 right-2 flex gap-1">
                           <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                        </div>
                     )}
                     <span className={`w-2.5 h-2.5 rounded-full mb-4 ${config.color.replace('text-', 'bg-')}`} />
                     <h5 className="text-2xl font-black text-slate-800 italic leading-none">{room.roomNumber}</h5>
                     <p className={`text-[8px] font-black uppercase tracking-widest mt-1 mb-4 ${config.color}`}>{config.label}</p>
                     
                     <div className="pt-4 border-t border-slate-50 w-full flex flex-col items-center">
                        {responsible ? (
                           <div className="flex flex-col items-center gap-1">
                              <img src={responsible.avatar} className="w-8 h-8 rounded-xl object-cover border-2 border-brand-primary/20 shadow-sm" alt="" />
                              <p className="text-[7px] font-black uppercase text-slate-400">{responsible.name.split(' ')[0]}</p>
                           </div>
                        ) : room.status === 'vacant-dirty' ? (
                           <button onClick={() => handleSmartAssign(room.id)} className="text-amber-500 hover:text-brand-primary transition-colors flex flex-col items-center gap-1">
                              <UserPlus size={20} />
                              <p className="text-[7px] font-black uppercase">Assign</p>
                           </button>
                        ) : (
                           <div className="h-10 flex items-center justify-center opacity-10">
                              <ShieldCheck size={20} />
                           </div>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
    </div>
  );
};

export default HotelHousekeepingModule;
