
import React from 'react';
import { Event, ProjectContext } from '../types';
import { Calendar, Users, Mic2, Clock, MapPin, CheckCircle, Plus, ChevronRight, Edit3, Trash2, Crown, Armchair } from 'lucide-react';

interface EventModuleProps {
  events: Event[];
  onCreateNew?: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const EventModule: React.FC<EventModuleProps> = ({ events, onCreateNew, onEdit, onDelete }) => {
  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Event Intelligence</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Managing performers, riders, and Sunday Theory flow.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform"
        >
          <Plus size={16} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {events.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[50px] border-2 border-dashed border-slate-100 opacity-40">
            <Calendar size={64} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest italic">No events in the pipeline</p>
          </div>
        ) : events.map(event => (
          <div key={event.id} className="bg-white rounded-[40px] shadow-xl shadow-black/5 border border-white/50 overflow-hidden group relative">
            <div className="bg-brand-primary/5 p-8 border-b border-brand-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-primary">
                  <Calendar size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">{event.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    <span className="flex items-center gap-1.5 font-black text-indigo-600"><MapPin size={12} /> {event.location}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {event.date} • {event.startTime}</span>
                    <span className="flex items-center gap-1.5"><Users size={12} /> {event.expectedAttendance} Exp.</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary border border-brand-primary/20 shadow-sm">
                  Tactical Deployment Active
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(event.id)}
                    className="p-3 bg-white hover:bg-brand-primary hover:text-white rounded-2xl text-slate-400 transition-all shadow-sm border border-slate-100"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => { if(window.confirm('Terminate event architecture?')) onDelete(event.id); }}
                    className="p-3 bg-white hover:bg-red-500 hover:text-white rounded-2xl text-slate-400 transition-all shadow-sm border border-slate-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <Mic2 size={14} className="text-brand-primary" /> Performer Lineup
                </h4>
                <div className="space-y-4">
                  {event.performers.map(performer => (
                    <div key={performer.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group/perf hover:border-brand-accent transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-lg font-black text-slate-800 tracking-tight">{performer.name}</p>
                          <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{performer.role}</p>
                          {performer.tableAssignment && (
                             <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-accent/20 text-brand-accent rounded mt-2 border border-brand-accent/30">
                                <Armchair size={10} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Reserved: {performer.tableAssignment} (Zone 2 VIP)</span>
                             </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-800 italic">{performer.performanceTime}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Set Time</p>
                        </div>
                      </div>
                      <div className="bg-white/60 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical & Rider</p>
                        <div className="flex flex-wrap gap-2">
                          {performer.rider.map((item, idx) => (
                            <span key={idx} className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">{item}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <CheckCircle size={14} className="text-brand-primary" /> Event Milestones
                  </h4>
                  <div className="space-y-3">
                    {event.checklists.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:shadow-black/5 transition-all group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.status === 'done' ? 'bg-brand-primary border-brand-primary text-white' : 'border-slate-200'}`}>
                          {item.status === 'done' && <CheckCircle size={12} />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${item.status === 'done' ? 'text-slate-900' : 'text-slate-400'}`}>{item.task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-brand-primary rounded-[35px] text-white relative overflow-hidden group shadow-2xl shadow-brand-primary/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 opacity-80">Checklist Completion</h4>
                  <p className="text-4xl font-black tracking-tighter italic mb-6">
                    {Math.round((event.checklists.filter(i => i.status === 'done').length / (event.checklists.length || 1)) * 100)}%
                  </p>
                  <button className="w-full py-4 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    Manage Checklist <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventModule;
