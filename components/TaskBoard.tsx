import React, { useState, useMemo } from 'react';
import { 
  Task, TaskStatus, TaskPriority, TaskCategory, ProjectContext, TeamMember, Event, MenuItem 
} from '../types';
import { 
  MoreHorizontal, Calendar, Repeat, User, Plus, X, AlertTriangle, ArrowRight, Zap, Edit3, CheckCircle2, Play, 
  SearchCode, ShieldCheck, Eye, UserCheck, Paperclip, MessageSquareText, FileText, ExternalLink, Filter, Clock, Percent, History, MapPin 
} from 'lucide-react';

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
      reviewerId,
      progress: 90,
      submissionNotes,
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
        context
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
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">Spatial Task Tracker</h2>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
              {['all', 'recurring', 'due-soon'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterMode(f as any)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    filterMode === f ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f === 'all' ? 'Current Scope' : f === 'recurring' ? 'Recurring Rules' : 'Urgent Trace'}
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

      {/* Urgent Alert */}
      {filterMode === 'due-soon' && filteredTasks.length > 0 && (
        <div className="bg-red-50 p-6 rounded-[35px] border border-red-100 flex items-center gap-6 animate-pulse">
          <AlertTriangle className="text-red-500" size={32} />
          <div>
            <h4 className="text-lg font-black text-red-900 uppercase italic leading-none">High Velocity Alert</h4>
            <p className="text-sm font-bold text-red-700 mt-1 uppercase tracking-tight">Immediate fulfillment required for these trace items.</p>
          </div>
        </div>
      )}

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {columns.map(col => (
          <div key={col.status} className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${col.color}} />
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
                filteredTasks.filter(t => t.status === col.status).map(task => {
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
                      {/* Task content here... */}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reviewer Modal */}
      {isReviewerModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          {/* Modal content */}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">{editingId ? 'Modify Trace' : 'Trace Objective'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Spatial architecture for {context === 'the-yard' ? 'The Yard' : 'Sunday Theory'}.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
              {/* Form fields for title, description, context, priority, due date */}
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
