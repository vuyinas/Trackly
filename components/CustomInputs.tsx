
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

// --- TIME PICKER ---
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Changed from 96 (15 min) to 48 (30 min) intervals
  const times = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = (i % 2) * 30;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm hover:border-brand-primary transition-all"
      >
        <span className="italic">{value || 'Select Time'}</span>
        <Clock size={16} className="text-slate-300" />
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-3xl shadow-2xl custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 grid grid-cols-1 gap-1">
            {times.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { onChange(t); setIsOpen(false); }}
                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-left transition-all ${value === t ? 'bg-brand-primary text-white' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- DATE PICKER ---
interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const handleMonthChange = (offset: number) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + offset);
    setViewDate(d);
  };

  const handleDateSelect = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const calendarDays = [];
  const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());

  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

  const selectedDateObj = value ? new Date(value) : null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm hover:border-brand-primary transition-all"
      >
        <span className="italic">{value || 'Select Date'}</span>
        <CalendarIcon size={16} className="text-slate-300" />
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 mt-2 w-72 bg-white border border-slate-100 rounded-[35px] shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <button type="button" onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={16} /></button>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary leading-none mb-1">{viewDate.getFullYear()}</p>
              <h4 className="font-black uppercase italic tracking-tighter text-slate-800">{viewDate.toLocaleString('default', { month: 'long' })}</h4>
            </div>
            <button type="button" onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={16} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} className="text-[8px] font-black text-slate-300 uppercase">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d, i) => d ? (
              <button
                key={i}
                type="button"
                onClick={() => handleDateSelect(d)}
                className={`h-8 w-8 rounded-lg text-[10px] font-black transition-all flex items-center justify-center ${
                  selectedDateObj?.getDate() === d && selectedDateObj?.getMonth() === viewDate.getMonth() && selectedDateObj?.getFullYear() === viewDate.getFullYear()
                    ? 'bg-brand-primary text-white shadow-lg'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                {d}
              </button>
            ) : <div key={i} />)}
          </div>
        </div>
      )}
    </div>
  );
};
