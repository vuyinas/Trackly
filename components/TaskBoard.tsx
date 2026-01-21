
import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TaskCategory, RecurrenceType, TeamMember, ProjectContext, Event, MenuItem } from '../types';
import { MoreHorizontal, Calendar, Repeat, User, Plus, X, AlertTriangle, ArrowRight, Zap, Edit3, CheckCircle2, Play, SearchCode, ShieldCheck, Eye, UserCheck, Paperclip, MessageSquareText, FileText, ExternalLink, Filter, Clock, Percent, History, MapPin } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  team: TeamMember[];
  events: Event[];
  menu: MenuItem[];
  context: ProjectContext;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onAddTask: (task: Omit<Task, 'id' | 'progress'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, team, events, menu, context, onUpdateStatus, onAddTask, onUpdateTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
  const [activeTaskForReview, setActiveTaskForReview] = useState<Task | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'recurring' | 'due-soon'>('all');
  
  // States for submission notes and attachments in the review modal
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionDocUrl, setSubmissionDocUrl] = useState('');
  const [submissionDocName, setSubmissionDocName] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    assignees: [],
    dueDate: '',
    priority: 'medium',
    category: 'ops',
    isRecurring: false,
    recurrenceType: 'none',
    context: context,
    dependencies: [],
    estimatedMinutes: 30,
    projectNotes: '',
    attachmentUrl: '',
    attachmentName: '',
    progress: 0
  });

  const columns: { title: string; status: TaskStatus; color: string; actionLabel: string; nextStatus?: TaskStatus }[] = [
    { title: 'To Do', status: TaskStatus.TODO, color: 'bg-slate-400', actionLabel: 'Commence Ops', nextStatus: TaskStatus.IN_PROGRESS },
    { title: 'In Progress', status: TaskStatus.IN_PROGRESS, color: 'bg-blue-500', actionLabel: 'Submit for Review', nextStatus: TaskStatus.REVIEW },
    { title: 'Review', status: TaskStatus.REVIEW, color: 'bg-amber-500', actionLabel: 'Authorize Completion', nextStatus: TaskStatus.DONE },
    { title: 'Done', status: TaskStatus.DONE, color: 'bg-emerald-500', actionLabel: 'Archive Log' },
  ];

  const getMember = (id: string) => team.find(m => m.id === id);

  const filteredTasks = useMemo(() => {
    let list = tasks.filter(t => t.context === context);
    if (filterMode === 'recurring') list = list.filter(t => t.isRecurring);
    if (filterMode === 'due-soon') list = list.filter(t => {
      const hoursLeft = (new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60);
      return hoursLeft > 0 && hoursLeft < 12 && t.status !== TaskStatus.DONE;
    });
    return list;
  }, [tasks, context, filterMode]);

  const taskHistory = useMemo(() => {
    return tasks.filter(t => t.status === TaskStatus.DONE).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [tasks]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      assignees: [],
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      category: 'ops',
      isRecurring: false,
      recurrenceType: 'none',
      context: context,
      dependencies: [],
      estimatedMinutes: 30,
      projectNotes: '',
      attachmentUrl: '',
      attachmentName: '',
      progress: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingId(task.id);
    setFormData(task);
    setIsModalOpen(true);
  };

  const handleActionClick = (task: Task, nextStatus: TaskStatus) => {
    if (nextStatus === TaskStatus.REVIEW) {
      setActiveTaskForReview(task);
      setSubmissionNotes(task.submissionNotes || '');
      setSubmissionDocUrl(task.attachmentUrl || '');
      setSubmissionDocName(task.attachmentName || '');
      setIsReviewerModalOpen(true);
    } else {
      onUpdateStatus(task.id, nextStatus);
    }
  };

  const handleAssignReviewer = (reviewerId: string) => {
    if (!activeTaskForReview) return;
    onUpdateTask(activeTaskForReview.id, { 
      status: TaskStatus.REVIEW, 
      reviewerId: reviewerId,
      progress: 90,
      submissionNotes: submissionNotes,
      attachmentUrl: submissionDocUrl,
      attachmentName: submissionDocName
    });
    setIsReviewerModalOpen(false);
    setActiveTaskForReview(null);
    setSubmissionNotes('');
    setSubmissionDocUrl('');
    setSubmissionDocName('');
  };

  const handleProgressChange = (id: string, value: number) => {
    onUpdateTask(id, { progress: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) return;
    
    if (editingId) {
      onUpdateTask(editingId, formData);
    } else {
      const { progress, ...rest } = formData;
      onAddTask({
        ...rest as Omit<Task, 'id' | 'progress'>,
        context: context
      });
    }
    setIsModalOpen(false);
  };

  const getProgressColor = (p: number) => {
    if (p < 30) return 'bg-slate-400';
    if (p < 70) return 'bg-blue-500';
    if (p < 100) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">Spatial Task Tracker</h2>
          <div className="flex items-center gap-4 mt-4">
             <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                {[
                  { id: 'all', label: 'Current Scope' },
                  { id: 'recurring', label: 'Recurring Rules' },
                  { id: 'due-soon', label: 'Urgent Trace' }
                ].map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setFilterMode(f.id as any)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterMode === f.id ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {f.label}
                  </button>
                ))}
             </div>
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-brand-primary text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-[1.05] transition-all flex items-center gap-3 w-fit"
        >
          <Plus size={18} /> Define Objective
        </button>
      </div>

      {filterMode === 'due-soon' && filteredTasks.length > 0 && (
        <div className="bg-red-50 p-6 rounded-[35px] border border-red-100 flex items-center gap-6 animate-pulse">
           <AlertTriangle className="text-red-500" size={32} />
           <div>
              <h4 className="text-lg font-black text-red-900 uppercase italic leading-none">High Velocity Alert</h4>
              <p className="text-sm font-bold text-red-700 mt-1 uppercase tracking-tight">Immediate fulfillment required for these trace items.</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${col.color}`} />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">{col.title}</h3>
                <span className="bg-white border border-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400">
                  {filteredTasks.filter(t => t.status === col.status).length}
                </span>
              </div>
              <button className="text-slate-200 hover:text-slate-400 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {filteredTasks.filter(t => t.status === col.status).length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[50px] opacity-20 flex flex-col items-center justify-center gap-4 bg-white/50">
                   <SearchCode size={40} strokeWidth={1} />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Void</p>
                </div>
              ) : (
                filteredTasks.filter(t => t.status === col.status).map((task) => {
                  const hoursLeft = (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60);
                  const isUrgent = hoursLeft > 0 && hoursLeft < 12 && task.status !== TaskStatus.DONE;
                  
                  return (
                  <div 
                    key={task.id} 
                    className={`bg-white p-6 rounded-[35px] shadow-xl shadow-black/5 border-2 transition-all group relative overflow-hidden flex flex-col min-h-[260px] ${
                      isUrgent ? 'border-red-400 ring-4 ring-red-500/10' : 
                      task.status === TaskStatus.REVIEW ? 'border-amber-100 ring-4 ring-amber-500/5' : 
                      'border-transparent hover:border-brand-primary/20'
                    }`}
                  >
                    {isUrgent && <div className="absolute top-0 right-0 p-3"><Clock size={16} className="text-red-500 animate-spin-slow" /></div>}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                         <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          task.priority === 'critical' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 
                          task.priority === 'high' ? 'bg-red-50 text-red-600' : 
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest">
                           <MapPin size={8} /> {task.context === 'the-yard' ? 'The Yard' : 'Sunday Theory'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         {task.isRecurring && (
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-primary/10 rounded-lg text-brand-primary">
                              <Repeat size={10} strokeWidth={3} className="animate-pulse" />
                              <span className="text-[8px] font-black uppercase">Cycle</span>
                           </div>
                         )}
                         <button 
                          onClick={() => openEditModal(task)}
                          className="p-2 bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                         >
                            <Edit3 size={14} />
                         </button>
                      </div>
                    </div>

                    <h4 className="text-base font-black text-slate-800 tracking-tight leading-tight mb-2 group-hover:text-brand-primary transition-colors">{task.title}</h4>
                    <p className="text-[11px] text-slate-500 mb-4 font-medium line-clamp-2 leading-relaxed">{task.description}</p>
                    
                    <div className="space-y-3 mb-6 mt-auto">
                       <div className="flex justify-between items-center group/progress relative">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Objective Fulfillment</span>
                          <span className={`text-[9px] font-black italic px-2 py-0.5 rounded-lg transition-colors ${task.progress === 100 ? 'text-emerald-500 bg-emerald-50' : 'text-slate-500 bg-slate-50'}`}>{task.progress}%</span>
                       </div>
                       
                       <div className="relative h-2 group/slider">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={task.progress}
                            onChange={(e) => handleProgressChange(task.id, parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="absolute inset-0 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.1)] ${getProgressColor(task.progress)}`} 
                                style={{ width: `${task.progress}%` }}
                             />
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                      <div className="space-y-3">
                         <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Owner Port</p>
                         <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                              {task.assignees.map(id => {
                                const m = getMember(id);
                                return (
                                  <img key={id} src={m?.avatar} className="w-8 h-8 rounded-xl border-2 border-white object-cover shadow-sm" alt="" title={m?.name} />
                                );
                              })}
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
                            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                         </div>
                      </div>
                    </div>

                    {col.nextStatus && (
                      <button 
                        onClick={() => handleActionClick(task, col.nextStatus!)}
                        className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-primary transition-all active:scale-95 group/btn shadow-lg shadow-black/5"
                      >
                         {col.status === TaskStatus.TODO ? <Play size={12} fill="currentColor" /> : <CheckCircle2 size={12} />}
                         {col.actionLabel}
{columns.map((column) => (
  <div key={column.id}>
    {column.tasks.map((task) => (
      <button key={task.id}>
        <ArrowRight
          size={12}
          className="group-hover/btn:translate-x-1 transition-transform"
        />
      </button>
    ))}
  </div>
))}

      {/* Cross-Context Audit Section (What's been done where) */}
      <div className="space-y-8 pt-12 border-t border-slate-200">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black italic tracking-tighter uppercase">Historical Trace Archive</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit log of spatial objectives completed</p>
            </div>
            <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
               <History size={16} /> Export Audit Pack
            </button>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {taskHistory.length === 0 ? (
               <div className="py-20 bg-white rounded-[50px] border-2 border-dashed border-slate-100 text-center opacity-30">
                  <CheckCircle2 size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest italic">No completion records logged</p>
               </div>
            ) : (
               taskHistory.map(task => (
                  <div key={task.id} className="bg-white p-6 rounded-[35px] border border-slate-50 shadow-xl shadow-black/5 flex items-center justify-between group hover:border-emerald-200 transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                           <CheckCircle2 size={24} />
                        </div>
                        <div>
                           <h5 className="font-black text-slate-800 uppercase tracking-tight">{task.title}</h5>
                           <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase">
                                 <Zap size={10} fill="currentColor" /> Verified Done
                              </div>
                              <div className="flex items-center gap-1 text-[8px] font-black text-indigo-500 uppercase">
                                 <MapPin size={10} /> {task.context === 'the-yard' ? 'The Yard' : 'Sunday Theory'}
                              </div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase">
                                 Target: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="text-right flex items-center gap-6">
                        <div className="hidden md:block">
                           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Personnel</p>
                           <div className="flex -space-x-1 mt-1">
                              {task.assignees.map(id => <img key={id} src={getMember(id)?.avatar} className="w-6 h-6 rounded-lg border border-white" alt="" />)}
                           </div>
                        </div>
                        <button className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-brand-primary transition-all">
                           <FileText size={18} />
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

      {/* Reviewer Modal & Task Add Modal remain logic-identical to maintain system integrity */}
      {isReviewerModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Submission Architect</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Attaching Evidence & Assigning Overseer</p>
                 </div>
                 <button onClick={() => setIsReviewerModalOpen(false)} className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 transition-all"><X size={20} /></button>
              </div>
              
              <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                 <div className="bg-amber-50 p-6 rounded-[30px] border border-amber-100 flex items-start gap-4">
                    <Zap className="text-amber-500 shrink-0 mt-1" size={20} fill="currentColor" />
                    <p className="text-xs font-bold text-amber-900 leading-relaxed italic">
                      Moving "<b>{activeTaskForReview?.title}</b>" to review. Please attach your findings or documents below.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                         <Paperclip size={12} /> Document Link
                       </label>
                       <input 
                        type="url" 
                        placeholder="Paste document URL..."
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-bold text-xs"
                        value={submissionDocUrl}
                        onChange={e => setSubmissionDocUrl(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Name</label>
                       <input 
                        type="text" 
                        placeholder="e.g. Budget_Report_v2.pdf"
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-bold text-xs"
                        value={submissionDocName}
                        onChange={e => setSubmissionDocName(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                      <MessageSquareText size={12} /> Submission Memo
                    </label>
                    <textarea 
                      placeholder="Explain what has been done or any issues encountered during execution..."
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-medium text-xs h-24 resize-none"
                      value={submissionNotes}
                      onChange={e => setSubmissionNotes(e.target.value)}
                    />
                 </div>
                 
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Authorized Review Personnel</p>
                    <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                       {team.map(member => (
                         <button
                           key={member.id}
                           onClick={() => handleAssignReviewer(member.id)}
                           className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-brand-primary hover:text-white rounded-[25px] border-2 border-transparent transition-all text-left group"
                         >
                            <img src={member.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform" alt="" />
                            <div className="flex-1">
                               <p className="text-sm font-black uppercase tracking-tight">{member.name}</p>
                               <p className="text-[10px] font-bold opacity-60 uppercase">{member.role}</p>
                            </div>
                            <UserCheck size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">{editingId ? 'Modify Trace' : 'Trace Objective'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Spatial architecture for {context === 'the-yard' ? 'The Yard' : 'Sunday Theory'}.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Task Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Pre-event Technical Inspection"
                      className="w-full px-8 py-5 bg-slate-50 rounded-[25px] border-2 border-transparent focus:border-brand-primary outline-none font-bold text-lg"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Basic Scope</label>
                    <textarea 
                      placeholder="Essential breakdown of work required..."
                      className="w-full px-8 py-5 bg-slate-50 rounded-[25px] border-2 border-transparent focus:border-brand-primary outline-none font-medium text-sm min-h-[100px] resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Objective Context (Where?)</label>
                        <select 
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none border-2 border-transparent focus:border-brand-primary"
                          value={formData.context}
                          onChange={e => setFormData({...formData, context: e.target.value as ProjectContext})}
                        >
                          <option value={ProjectContext.THE_YARD}>The Yard</option>
                          <option value={ProjectContext.SUNDAY_THEORY}>Sunday Theory</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Priority</label>
                        <select 
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none border-2 border-transparent focus:border-brand-primary"
                          value={formData.priority}
                          onChange={e => setFormData({...formData, priority: e.target.value as any})}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                    </div>
                  <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Date</label>
                        <input 
                          type="date" 
                          required
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-xs"
                          value={formData.dueDate}
                          onChange={e => setFormData({...formData, dueDate: e.target.value})}
                        />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-7 bg-brand-primary text-white rounded-[30px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 mt-8"
              >
                {editingId ? 'Save Configuration' : 'Deploy Objective'} <Zap size={24} fill="currentColor" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
