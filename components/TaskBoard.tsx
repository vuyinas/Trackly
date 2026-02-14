
import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskStatus, TeamMember, ProjectContext, Event, MenuItem, PresenceStatus, UserRole, TaskCategory, Shift, Sector, Business } from '../types';
import { Plus, X, ArrowRight, Edit3, CheckCircle2, History, MapPin, Trash2, Database, Target, BellOff, User, Clock, Tag, Save, Coffee, Users, Briefcase, Lock, Sliders, Activity } from 'lucide-react';
import { DatePicker } from './CustomInputs';

interface TaskBoardProps {
  tasks: Task[];
  team: TeamMember[];
  events: Event[];
  menu: MenuItem[];
  shifts: Shift[];
  context: ProjectContext;
  activeSector: Sector;
  businesses: Business[];
  user: TeamMember;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onAddTask: (task: Omit<Task, 'id' | 'progress'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onUpdatePresence: (status: PresenceStatus, expiry?: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, team, events, menu, shifts, context, activeSector, businesses, user, onUpdateStatus, onAddTask, onUpdateTask, onDeleteTask, onUpdatePresence }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const isAuthorized = user?.role === UserRole.OWNER || user?.role === UserRole.MANAGER;

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    assignees: [],
    dueDate: '2026-01-01',
    priority: 'medium' as any,
    category: TaskCategory.OPS,
    isRecurring: false,
    recurrenceType: 'none',
    context: context,
    progress: 0
  });

  const columns: { title: string; status: TaskStatus; color: string; actionLabel: string; nextStatus?: TaskStatus }[] = [
    { title: 'To Do', status: TaskStatus.TODO, color: 'bg-slate-400', actionLabel: 'Commence', nextStatus: TaskStatus.IN_PROGRESS },
    { title: 'In Progress', status: TaskStatus.IN_PROGRESS, color: 'bg-blue-500', actionLabel: 'Finish', nextStatus: TaskStatus.REVIEW },
    { title: 'Review', status: TaskStatus.REVIEW, color: 'bg-amber-500', actionLabel: 'Authorize', nextStatus: TaskStatus.DONE },
    { title: 'Done', status: TaskStatus.DONE, color: 'bg-emerald-500', actionLabel: 'Archived' },
  ];

  const getMember = (id: string) => team.find(m => m.id === id);
  const getBiz = (id: string) => businesses.find(b => b.id === id);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.status !== TaskStatus.DONE);
  }, [tasks]);

  const globalHistory = useMemo(() => {
    return tasks
      .filter(t => t.status === TaskStatus.DONE)
      .sort((a, b) => new Date(b.completedAt || b.dueDate).getTime() - new Date(a.completedAt || a.dueDate).getTime());
  }, [tasks]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', status: TaskStatus.TODO, assignees: [], dueDate: '2026-01-01', priority: 'medium' as any, category: TaskCategory.OPS, isRecurring: false, recurrenceType: 'none', context: context, progress: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingId(task.id);
    setFormData(task);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    if (editingId) onUpdateTask(editingId, formData);
    else onAddTask(formData as Omit<Task, 'id' | 'progress'>);
    setIsModalOpen(false);
  };

  const handleStatusShift = (taskId: string, nextStatus: TaskStatus) => {
    const updates: Partial<Task> = { status: nextStatus };
    if (nextStatus === TaskStatus.DONE) {
      updates.completedAt = new Date().toISOString();
      updates.completedBy = user.id;
      updates.progress = 100;
    }
    onUpdateTask(taskId, updates);
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 overflow-x-hidden">
      
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
             <Briefcase size={20} className="text-brand-primary" />
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Task Tracker</h2>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
             Live Progress & Audit Stream for 2026 Operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
           <div className="bg-white px-6 py-4 rounded-[30px] shadow-xl border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Activity size={20} /></div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector Velocity</p>
                 <p className="text-[14px] font-black text-slate-800 uppercase italic leading-none">High-Precision Tracking</p>
              </div>
           </div>

          <button 
            onClick={openAddModal}
            className="bg-brand-primary text-white px-8 py-5 rounded-[25px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-[1.05] transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18} strokeWidth={4} /> New Objective
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 pt-8 border-t border-slate-100">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${col.color}`} />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">{col.title}</h3>
              </div>
            </div>

            <div className="space-y-6">
              {filteredTasks.filter(t => t.status === col.status).map((task) => {
                const biz = getBiz(task.context);
                return (
                <div key={task.id} className="bg-white p-6 rounded-[35px] shadow-xl shadow-black/5 border-2 border-transparent hover:border-brand-primary/20 transition-all group relative flex flex-col min-h-[220px]">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openEditModal(task)} className="p-2 text-slate-300 hover:text-brand-primary transition-colors"><Edit3 size={14} /></button>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded border border-slate-100">
                      {task.category}
                    </span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border bg-slate-50" style={{ borderColor: biz?.primaryColor + '40' }}>
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: biz?.primaryColor }} />
                       <span className="text-[7px] font-black uppercase" style={{ color: biz?.primaryColor }}>{biz?.prefix}</span>
                    </div>
                  </div>
                  <h4 className="text-base font-black text-slate-800 tracking-tight leading-tight mb-2 pr-12">{task.title}</h4>
                  <p className="text-[11px] text-slate-500 mb-6 font-medium line-clamp-2 italic">"{task.description}"</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">How Far We Are</span>
                      <span className="text-[10px] font-black text-brand-primary italic">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary transition-all duration-700" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex -space-x-1.5">
                        {task.assignees.map(id => (
                          <img key={id} src={getMember(id)?.avatar} className="w-7 h-7 rounded-lg border-2 border-white object-cover" alt="" />
                        ))}
                     </div>
                     {col.nextStatus && (
                        <button onClick={() => handleStatusShift(task.id, col.nextStatus!)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-primary transition-all active:scale-95">
                          {col.actionLabel} <ArrowRight size={10} />
                        </button>
                     )}
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>

      {/* AUDIT HISTORY SECTION */}
      <div id="archive-section" className="pt-12 border-t border-slate-200">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800 flex items-center gap-3">
                  <Database size={24} className="text-brand-primary" /> What's Been Done Where (Audit)
               </h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical trace of resolved objectives across domains.</p>
            </div>
            <button 
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
               <History size={16} /> {isHistoryExpanded ? 'Collapse Audit' : 'Expand Full Audit History'}
            </button>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {globalHistory.slice(0, isHistoryExpanded ? globalHistory.length : 5).map(task => {
               const completedBy = getMember(task.completedBy || '');
               const biz = getBiz(task.context);
               return (
               <div key={task.id} className="bg-white p-6 rounded-[35px] border border-slate-50 shadow-xl shadow-black/5 flex items-center justify-between group hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                        <CheckCircle2 size={24} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1.5">
                           <h5 className="font-black text-slate-800 uppercase tracking-tight leading-none">{task.title}</h5>
                           <div className="px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm" style={{ backgroundColor: biz?.primaryColor, color: '#fff' }}>
                              <MapPin size={8} /> {biz?.name}
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                             <Clock size={10} /> Completed: {task.completedAt ? new Date(task.completedAt).toLocaleString() : '2026 Archive'}
                           </p>
                           {completedBy && (
                             <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                               <User size={10} /> By {completedBy.name}
                             </p>
                           )}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase text-slate-300 italic tracking-widest">Archived Mission Trace</span>
                  </div>
               </div>
            )})}
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic">{editingId ? 'Modify Trace' : 'New Objective'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">2026 Operational Protocol Synthesis</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Objective Name</label>
                   <input 
                      type="text" required placeholder="Trace ID / Name..."
                      className="w-full px-8 py-5 bg-slate-50 rounded-[25px] border-2 border-transparent focus:border-brand-primary outline-none font-black text-xl shadow-inner"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Audit Context (Description)</label>
                   <textarea 
                      required placeholder="Provide depth for the audit trail..."
                      className="w-full px-8 py-5 bg-slate-50 rounded-[25px] border-2 border-transparent focus:border-brand-primary outline-none font-medium text-sm italic shadow-inner h-32 resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                </div>
              </div>

              {/* HOW FAR THEY ARE - PROGRESS SLIDER */}
              <div className="p-8 bg-slate-950 text-white rounded-[40px] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-10"><Sliders size={80} /></div>
                 <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                       <h4 className="text-sm font-black uppercase tracking-widest text-brand-primary flex items-center gap-2 italic"><Activity size={16} /> Precision Progress Tracker</h4>
                       <span className="text-3xl font-black italic text-white">{formData.progress}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-primary"
                      value={formData.progress}
                      onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                    />
                    <div className="flex justify-between mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">
                       <span>Static</span>
                       <span>Mid-Cycle</span>
                       <span>Complete</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Trace Domain</label>
                    <select 
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none border-2 border-transparent focus:border-brand-primary"
                    value={formData.context}
                    onChange={e => setFormData({...formData, context: e.target.value})}
                    >
                        {businesses.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="space-y-3">
                    <DatePicker label="Audit Deadline" value={formData.dueDate || ''} onChange={val => setFormData({...formData, dueDate: val})} />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-8 bg-brand-primary text-white rounded-[35px] font-black text-2xl uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 mt-8"
              >
                {editingId ? 'Update Trace Record' : 'Fire Audit Trace'} <Save size={28} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
