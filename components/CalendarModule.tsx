
import React, { useState, useMemo } from 'react';
import { ProjectContext, Event, Meeting, TeamMember, RecurrenceType } from '../types';
import { ChevronLeft, ChevronRight, Clock, Plus, Zap, X, Save, Coffee, Users2, Repeat, Trash2, Flag, Heart, Cake, Gift } from 'lucide-react';

interface CalendarModuleProps {
  events: Event[];
  meetings: Meeting[];
  team: TeamMember[];
  context: ProjectContext;
  onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  onUpdateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  onDeleteMeeting: (id: string) => void;
  onJoinMeeting: (meeting: Meeting) => void;
}

type HolidayType = 'official' | 'observed' | 'cultural' | 'birthday' | 'wellness';

/**
 * 🇿🇦 EXHAUSTIVE SOUTH AFRICAN CALENDAR REGISTRY (2024 - 2027)
 * Strictly synchronized with national gazette observations.
 */
const SA_HOLIDAYS: Record<string, { name: string; type: HolidayType }> = {
  // --- 2024 ---
  "2024-01-01": { name: "New Year's Day", type: 'official' },
  "2024-02-14": { name: "Valentine's Day", type: 'cultural' },
  "2024-03-21": { name: "Human Rights Day", type: 'official' },
  "2024-03-29": { name: "Good Friday", type: 'official' },
  "2024-04-01": { name: "Family Day", type: 'official' },
  "2024-04-27": { name: "Freedom Day", type: 'official' },
  "2024-05-01": { name: "Workers' Day", type: 'official' },
  "2024-05-12": { name: "Mother's Day", type: 'cultural' },
  "2024-06-16": { name: "Youth Day", type: 'official' },
  "2024-06-17": { name: "Youth Day (Observed)", type: 'observed' },
  "2024-08-09": { name: "National Women's Day", type: 'official' },
  "2024-09-01": { name: "Spring Day", type: 'cultural' },
  "2024-09-24": { name: "Heritage Day", type: 'official' },
  "2024-10-31": { name: "Halloween", type: 'cultural' },
  "2024-12-16": { name: "Day of Reconciliation", type: 'official' },
  "2024-12-25": { name: "Christmas Day", type: 'official' },
  "2024-12-26": { name: "Day of Goodwill", type: 'official' },

  // --- 2025 ---
  "2025-01-01": { name: "New Year's Day", type: 'official' },
  "2025-02-14": { name: "Valentine's Day", type: 'cultural' },
  "2025-03-21": { name: "Human Rights Day", type: 'official' },
  "2025-04-18": { name: "Good Friday", type: 'official' },
  "2025-04-21": { name: "Family Day", type: 'official' },
  "2025-04-27": { name: "Freedom Day", type: 'official' },
  "2025-04-28": { name: "Freedom Day (Observed)", type: 'observed' },
  "2025-05-01": { name: "Workers' Day", type: 'official' },
  "2025-05-11": { name: "Mother's Day", type: 'cultural' },
  "2025-06-15": { name: "Father's Day", type: 'cultural' },
  "2025-06-16": { name: "Youth Day", type: 'official' },
  "2025-08-09": { name: "National Women's Day", type: 'official' },
  "2025-08-11": { name: "Women's Day (Observed)", type: 'observed' },
  "2025-09-01": { name: "Spring Day", type: 'cultural' },
  "2025-09-24": { name: "Heritage Day", type: 'official' },
  "2025-10-31": { name: "Halloween", type: 'cultural' },
  "2025-12-16": { name: "Day of Reconciliation", type: 'official' },
  "2025-12-25": { name: "Christmas Day", type: 'official' },
  "2025-12-26": { name: "Day of Goodwill", type: 'official' },

  // --- 2026 ---
  "2026-01-01": { name: "New Year's Day", type: 'official' },
  "2026-02-14": { name: "Valentine's Day", type: 'cultural' },
  "2026-03-21": { name: "Human Rights Day", type: 'official' },
  "2026-04-03": { name: "Good Friday", type: 'official' },
  "2026-04-06": { name: "Family Day", type: 'official' },
  "2026-04-27": { name: "Freedom Day", type: 'official' },
  "2026-05-01": { name: "Workers' Day", type: 'official' },
  "2026-05-10": { name: "Mother's Day", type: 'cultural' },
  "2026-06-16": { name: "Youth Day", type: 'official' },
  "2026-06-21": { name: "Father's Day", type: 'cultural' },
  "2026-08-09": { name: "National Women's Day", type: 'official' },
  "2026-08-10": { name: "Women's Day (Observed)", type: 'observed' },
  "2026-09-01": { name: "Spring Day", type: 'cultural' },
  "2026-09-24": { name: "Heritage Day", type: 'official' },
  "2026-10-31": { name: "Halloween", type: 'cultural' },
  "2026-12-16": { name: "Day of Reconciliation", type: 'official' },
  "2026-12-25": { name: "Christmas Day", type: 'official' },
  "2026-12-26": { name: "Day of Goodwill", type: 'official' },

  // --- 2027 ---
  "2027-01-01": { name: "New Year's Day", type: 'official' },
  "2027-02-14": { name: "Valentine's Day", type: 'cultural' },
  "2027-03-21": { name: "Human Rights Day", type: 'official' },
  "2027-03-22": { name: "Human Rights (Observed)", type: 'observed' },
  "2027-03-26": { name: "Good Friday", type: 'official' },
  "2027-03-29": { name: "Family Day", type: 'official' },
  "2027-04-27": { name: "Freedom Day", type: 'official' },
  "2027-05-01": { name: "Workers' Day", type: 'official' },
  "2027-05-09": { name: "Mother's Day", type: 'cultural' },
  "2027-06-16": { name: "Youth Day", type: 'official' },
  "2027-06-20": { name: "Father's Day", type: 'cultural' },
  "2027-08-09": { name: "National Women's Day", type: 'official' },
  "2027-09-01": { name: "Spring Day", type: 'cultural' },
  "2027-09-24": { name: "Heritage Day", type: 'official' },
  "2027-10-31": { name: "Halloween", type: 'cultural' },
  "2027-12-16": { name: "Day of Reconciliation", type: 'official' },
  "2027-12-25": { name: "Christmas Day", type: 'official' },
  "2027-12-26": { name: "Day of Goodwill", type: 'official' },
  "2027-12-27": { name: "Day of Goodwill (Observed)", type: 'observed' },
};

const CalendarModule: React.FC<CalendarModuleProps> = ({ 
  events, meetings, team, context, onAddMeeting, onUpdateMeeting, onDeleteMeeting, onJoinMeeting 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Meeting>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    type: 'meeting',
    notes: '',
    attendees: [],
    isRecurring: false,
    recurrenceType: 'none'
  });

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(y, m, d));
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const getItemsForDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const birthdayStr = `${m}-${d}`;
    
    const holiday = SA_HOLIDAYS[dateStr];
    const dayEvents = events.filter(e => e.date === dateStr && e.context === context);
    const dayMeetings = meetings.filter(m => m.date === dateStr && m.context === context);
    const dayBirthdays = team.filter(t => t.birthday === birthdayStr);
    
    return {
      holiday,
      birthdays: dayBirthdays,
      items: [
        ...dayEvents.map(e => ({ ...e, calendarType: 'event' })), 
        ...dayMeetings.map(m => ({ ...m, calendarType: 'meeting' }))
      ]
    };
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeetingId(meeting.id);
    setFormData({ ...meeting });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingMeetingId(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      type: 'meeting',
      notes: '',
      attendees: [],
      isRecurring: false,
      recurrenceType: 'none'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    if (editingMeetingId) onUpdateMeeting(editingMeetingId, formData);
    else onAddMeeting({ ...(formData as Omit<Meeting, 'id'>), context });
    setIsModalOpen(false);
  };

  const getHolidayStyles = (type: HolidayType) => {
    switch (type) {
      case 'official': return 'bg-amber-600 text-white border-amber-700';
      case 'observed': return 'bg-indigo-600 text-white border-indigo-700';
      case 'cultural': return 'bg-rose-500 text-white border-rose-600';
      default: return 'bg-slate-900 text-white border-black';
    }
  };

  return (
    <div className="p-4 md:p-12 space-y-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">Space Calendar</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Viewing Operational Timeline for {year}. All South African Public Holidays are highlighted in Amber.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-brand-primary"><ChevronLeft size={24} /></button>
              <div className="px-8 flex flex-col items-center justify-center min-w-[160px]">
                <span className="font-black uppercase text-[10px] tracking-[0.4em] text-slate-400 leading-none mb-1">{year}</span>
                <span className="font-black uppercase text-xl tracking-tighter text-slate-800 italic leading-none">{monthName}</span>
              </div>
              <button onClick={() => changeMonth(1)} className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-brand-primary"><ChevronRight size={24} /></button>
           </div>
           <button 
            onClick={openAddModal}
            className="bg-brand-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
             <Plus size={18} strokeWidth={4} /> Make New Entry
           </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-[35px] overflow-hidden shadow-2xl border-4 border-white">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-100 py-4 text-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 border-b border-slate-200">{day}</div>
        ))}
        
        {daysInMonth.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="bg-slate-50/40 h-32 md:h-48" />;

          const { holiday, birthdays, items } = getItemsForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();
          
          return (
            <div 
              key={date.toISOString()} 
              className={`bg-white h-32 md:h-48 p-2 md:p-3 border-b border-r border-slate-100 group transition-all relative overflow-hidden
                ${isToday ? 'ring-4 ring-inset ring-brand-primary/10 z-10' : ''} 
                ${holiday ? (holiday.type === 'cultural' ? 'bg-rose-500/5' : 'bg-amber-500/5') : ''}
                ${birthdays.length > 0 ? 'bg-indigo-500/5' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className={`text-lg md:text-xl font-black italic tracking-tighter ${isToday ? 'text-brand-primary' : (holiday ? (holiday.type === 'cultural' ? 'text-rose-500' : 'text-amber-600') : (birthdays.length > 0 ? 'text-indigo-600' : 'text-slate-300'))}`}>
                  {date.getDate()}
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {holiday && (
                    <div className={`px-1.5 py-0.5 rounded border text-[7px] font-black uppercase tracking-tight shadow-sm flex items-center gap-1 ${getHolidayStyles(holiday.type)}`}>
                      {holiday.type === 'cultural' ? <Heart size={8} fill="currentColor" /> : <Flag size={8} fill="currentColor" />}
                      <span className="truncate max-w-[40px] md:max-w-[70px]">{holiday.name}</span>
                    </div>
                  )}
                  {birthdays.map(b => (
                    <div key={b.id} className="bg-indigo-600 text-white px-1.5 py-0.5 rounded border border-indigo-700 text-[7px] font-black uppercase tracking-tight shadow-sm flex items-center gap-1">
                      <Cake size={8} /> <span className="truncate max-w-[40px] md:max-w-[70px]">{b.name.split(' ')[0]}'s Birth</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1 overflow-y-auto max-h-[calc(100%-35px)] custom-scrollbar pr-0.5">
                {birthdays.map(b => (
                  <div key={`gift-${b.id}`} className="p-1 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-1.5 animate-pulse">
                     <Gift size={10} className="text-indigo-600" />
                     <p className="text-[7px] font-black uppercase text-indigo-900 tracking-tighter italic">Gift from Trackly Pending</p>
                  </div>
                ))}
                {items.map((item: any, idx) => {
                  const isWellness = (item as any).type === 'wellness';
                  return (
                    <div 
                      key={idx} 
                      onClick={() => item.calendarType === 'meeting' ? openEditModal(item) : null}
                      className={`p-1 rounded-lg border flex flex-col gap-0 cursor-pointer transition-all hover:scale-[1.02] ${
                        isWellness ? 'bg-teal-500/10 border-teal-500/20 text-teal-900' :
                        item.calendarType === 'event' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        {isWellness ? <Heart size={7} fill="currentColor" /> : (item.calendarType === 'event' ? <Zap size={7} fill="currentColor" /> : <Users2 size={7} />)}
                        <p className="text-[7px] font-black uppercase tracking-tight truncate">{(item as any).title || (item as any).name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[50px] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">New Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entry Type</label>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                   {['meeting', 'break', 'wellness'].map(t => (
                     <button 
                      key={t} type="button" onClick={() => setFormData({...formData, type: t as any})}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-400'}`}
                     >
                       {t}
                     </button>
                   ))}
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Log Name</label>
                 <input 
                  placeholder="e.g. Afternoon Service Huddle" required className="w-full px-8 py-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-bold text-lg"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Date</label>
                  <input type="date" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Recurrence</label>
                  <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase" value={formData.recurrenceType} onChange={e => setFormData({...formData, isRecurring: e.target.value !== 'none', recurrenceType: e.target.value as any})}>
                    <option value="none">One-time</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-[0.4em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">Commit Entry <Save size={20} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarModule;
