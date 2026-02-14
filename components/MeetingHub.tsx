
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Meeting, TeamMember, UserProfile, ProjectContext, AgendaItem, HiddenConsideration, ChatMessage, PresenceStatus, Sector } from '../types';
import { Video, Mic, MicOff, VideoOff, Users, MessageSquare, ShieldCheck, Zap, X, Send, Activity, Plus, Calendar, Link, Check, Info, ListChecks, Sparkles, Trash2, Layout, ClipboardList, Target, Clock, ShieldAlert, UserPlus, Brain, Phone, PhoneOff, Search, MoreVertical, Smartphone, CheckCheck, User, Video as VideoIcon } from 'lucide-react';
import { generateMeetingAgenda, synthesizeMeetingNotes } from '../services/geminiService';

interface MeetingHubProps {
  meetings: Meeting[];
  team: TeamMember[];
  currentUser: UserProfile;
  context: ProjectContext;
  onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
}

const DURATIONS = [
  { label: '30 Minutes', value: 30 },
  { label: '1 Hour', value: 60 },
  { label: '1.5 Hours', value: 90 },
  { label: '2 Hours', value: 120 },
  { label: '4 Hours', value: 240 },
  { label: 'All Day', value: 480 },
];

const MeetingHub: React.FC<MeetingHubProps> = ({ meetings, team, currentUser, context, onAddMeeting }) => {
  const [view, setView] = useState<'lobby' | 'room' | 'schedule' | 'direct'>('lobby');
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [selectedColleague, setSelectedColleague] = useState<TeamMember | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomMessages, setRoomMessages] = useState<{user: string, text: string, time: string}[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [liveAILoading, setLiveAILoading] = useState(false);
  const [roomSidebar, setRoomSidebar] = useState<'agenda' | 'logistics' | 'notes'>('agenda');
  const [isCommiting, setIsCommiting] = useState(false);

  const isHotel = currentUser.assignedSector === Sector.HOTEL;
  const brandHighlight = isHotel ? 'text-brand-accent' : 'text-brand-primary';
  const brandBg = isHotel ? 'bg-brand-accent' : 'bg-brand-primary';

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    engagementType: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    duration: 60,
    endTime: '11:00',
    attendees: [] as string[],
    agenda: [] as AgendaItem[],
    considerations: [] as HiddenConsideration[]
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const [h, m] = scheduleForm.startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + scheduleForm.duration);
    const endStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    setScheduleForm(prev => ({ ...prev, endTime: endStr }));
  }, [scheduleForm.startTime, scheduleForm.duration]);

  useEffect(() => {
    if ((view === 'room' || isCalling) && !isVideoOff) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [view, isVideoOff, isCalling]);

  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => setCallTimer(prev => prev + 1), 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedColleague]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) { console.error("Camera access denied:", err); }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleJoin = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setView('room');
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommiting) return;
    
    setIsCommiting(true);
    let finalAgenda = [...scheduleForm.agenda];
    let finalConsiderations = [...scheduleForm.considerations];
    let finalType = scheduleForm.engagementType;

    if (finalAgenda.length === 0 && scheduleForm.description) {
      const result = await generateMeetingAgenda(scheduleForm.title, scheduleForm.description, context);
      if (result) {
        finalAgenda = result.agenda;
        finalConsiderations = result.considerations;
        finalType = result.engagementType;
      }
    }

    const joinToken = Math.random().toString(36).substring(7).toUpperCase();
    onAddMeeting({ ...scheduleForm, engagementType: finalType, agenda: finalAgenda, considerations: finalConsiderations, type: 'meeting', context, joinToken });
    setIsCommiting(false);
    setView('lobby');
  };

  const toggleAttendee = (id: string) => {
    setScheduleForm(prev => ({
      ...prev,
      attendees: prev.attendees.includes(id)
        ? prev.attendees.filter(a => a !== id)
        : [...prev.attendees, id]
    }));
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedColleague) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedColleague.id,
      text: chatInput,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const handleSendRoomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setRoomMessages(prev => [...prev, {
      user: currentUser.name,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const formatCallTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const colleagues = useMemo(() => {
    return team.filter(m => m.id !== currentUser.id && m.assignedSector === currentUser.assignedSector);
  }, [team, currentUser]);

  const activeDirectMessages = useMemo(() => {
    if (!selectedColleague) return [];
    return messages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === selectedColleague.id) ||
      (m.senderId === selectedColleague.id && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, selectedColleague, currentUser.id]);

  const activateAIScribe = async () => {
    if (!activeMeeting) return;
    setLiveAILoading(true);
    const notes = await synthesizeMeetingNotes(activeMeeting.title, context, activeMeeting.duration || 60);
    setActiveMeeting(prev => prev ? ({ ...prev, liveNotes: [...(prev.liveNotes || []), ...notes] }) : null);
    setLiveAILoading(false);
    setRoomSidebar('notes');
  };

  return (
    <div className="p-8 h-[calc(100vh-73px)] overflow-hidden flex flex-col bg-[#28374a] text-white animate-in fade-in duration-500">
      
      {/* HUB HEADER TABS */}
      <div className="flex items-center gap-8 mb-8 border-b border-white/5 pb-4">
         <button onClick={() => setView('lobby')} className={`flex items-center gap-2 text-xl font-black italic tracking-tighter uppercase transition-all ${view === 'lobby' || view === 'room' || view === 'schedule' ? brandHighlight + ' border-b-2 border-current' : 'text-slate-500 hover:text-white'}`}>
            <Users size={20} /> Group Huddles
         </button>
         <button onClick={() => setView('direct')} className={`flex items-center gap-2 text-xl font-black italic tracking-tighter uppercase transition-all ${view === 'direct' ? brandHighlight + ' border-b-2 border-current' : 'text-slate-500 hover:text-white'}`}>
            <MessageSquare size={20} /> Direct Sync
         </button>
      </div>

      {view === 'lobby' && (
        <div className="flex-1 flex flex-col space-y-12 overflow-hidden">
           <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Meeting Hub</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Operational sync and strategic huddles.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-4">
                   <div className="flex -space-x-2">
                      {colleagues.slice(0, 3).map(m => (
                         <img key={m.id} src={m.avatar} className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" />
                      ))}
                   </div>
                   <div className="text-right">
                      <p className={`text-[8px] font-black uppercase ${brandHighlight}`}>Online Now</p>
                      <p className="text-[10px] font-black">{colleagues.length} Personnel</p>
                   </div>
                </div>
                <button onClick={() => setView('schedule')} className={`${brandBg} text-white px-8 py-4 rounded-[25px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all`}>
                  <Plus size={18} /> New Briefing
                </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pr-4 custom-scrollbar flex-1 content-start pb-12">
              {meetings.filter(m => m.context === context).map(meeting => (
                 <div key={meeting.id} className="bg-slate-800 p-8 rounded-[40px] border border-white/5 hover:border-brand-primary/20 transition-all flex flex-col h-fit min-h-[400px] relative group overflow-hidden shadow-2xl">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${brandBg} opacity-0 group-hover:opacity-10 transition-opacity rounded-full blur-3xl`} />
                    <div className="flex justify-between items-start mb-6">
                       <div className={`p-4 bg-slate-900 rounded-2xl ${brandHighlight} shadow-lg group-hover:scale-110 transition-transform`}><Video size={24} /></div>
                       <div className="text-right">
                          <p className="text-xs font-black text-white italic">{meeting.startTime} - {meeting.endTime}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{meeting.date}</p>
                       </div>
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">{meeting.title}</h4>
                    <p className="text-[10px] font-medium text-slate-400 italic mb-8 line-clamp-3 leading-relaxed">{meeting.description}</p>
                    
                    <div className="flex items-center gap-2 mb-8">
                       <Users size={12} className="text-slate-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{meeting.attendees.length} Stakeholders Assigned</span>
                    </div>

                    <div className="flex gap-3 mt-auto relative z-10">
                       <button onClick={() => handleJoin(meeting)} className={`flex-1 ${brandBg} text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all`}>Join Huddle</button>
                       <button className="p-4 bg-slate-900 rounded-2xl text-slate-400 hover:text-white transition-all"><Link size={18} /></button>
                    </div>
                 </div>
              ))}
              {meetings.filter(m => m.context === context).length === 0 && (
                <div className="col-span-3 h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[50px] opacity-20 text-center gap-4">
                   <Calendar size={48} />
                   <p className="text-xs font-black uppercase tracking-[0.4em]">No scheduled briefings</p>
                </div>
              )}
           </div>
        </div>
      )}

      {view === 'direct' && (
        <div className="flex-1 flex gap-8 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
           <div className="w-80 flex flex-col gap-6 overflow-hidden">
              <div className="relative group">
                 <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:${brandHighlight} transition-colors`} />
                 <input placeholder="Search Personnel..." className="w-full bg-slate-800 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:border-brand-primary shadow-inner" />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                 {colleagues.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => setSelectedColleague(m)}
                      className={`w-full p-4 rounded-3xl border transition-all flex items-center gap-4 group ${selectedColleague?.id === m.id ? 'bg-slate-800 border-brand-primary shadow-lg scale-[1.02]' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                    >
                       <div className="relative">
                          <img src={m.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-brand-primary transition-colors" />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${m.status === PresenceStatus.AT_DESK || m.status === PresenceStatus.ON_SHIFT ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                       </div>
                       <div className="text-left flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <h4 className="text-sm font-black uppercase tracking-tight truncate">{m.name.split(' ')[0]}</h4>
                             <span className="text-[8px] font-bold text-slate-600 uppercase">12:45</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase truncate leading-none">{m.role}</p>
                          <p className="text-[9px] font-medium text-slate-400 italic mt-1 truncate">Ready for tactical sync...</p>
                       </div>
                    </button>
                 ))}
              </div>
           </div>

           <div className="flex-1 bg-slate-800/50 rounded-[50px] border border-white/5 flex flex-col overflow-hidden relative shadow-2xl">
              {selectedColleague ? (
                 <>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/80 backdrop-blur-md relative z-10">
                       <div className="flex items-center gap-4">
                          <img src={selectedColleague.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-lg" />
                          <div>
                             <h4 className="text-base font-black italic uppercase tracking-tighter">{selectedColleague.name}</h4>
                             <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {selectedColleague.status.replace('-', ' ')}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <button onClick={() => setIsCalling(true)} className={`p-4 ${brandBg} text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all`} title="Voice Sync">
                             <Phone size={20} fill="currentColor" />
                          </button>
                          <button onClick={() => setIsCalling(true)} className="p-4 bg-slate-700 text-white rounded-2xl hover:bg-slate-600 transition-all" title="Video Huddle">
                             <VideoIcon size={20} />
                          </button>
                          <button className="p-4 text-slate-500 hover:text-white"><MoreVertical size={20} /></button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative">
                       <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                       
                       {activeDirectMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                             <div className={`max-w-[70%] p-5 rounded-[25px] relative shadow-lg ${msg.senderId === currentUser.id ? brandBg + ' text-white rounded-tr-none' : 'bg-slate-700 text-white rounded-tl-none'}`}>
                                <p className="text-sm font-medium leading-relaxed italic">{msg.text}</p>
                                <div className="flex items-center justify-end gap-2 mt-2 opacity-40">
                                   <span className="text-[8px] font-bold uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                                   {msg.senderId === currentUser.id && <CheckCheck size={10} />}
                                </div>
                             </div>
                          </div>
                       ))}
                       <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendDirectMessage} className="p-8 pt-4 relative z-10">
                       <div className="relative group">
                          <input 
                            placeholder="Type a tactical brief..." 
                            className={`w-full bg-slate-900 border border-white/10 rounded-[30px] px-8 py-5 text-sm font-medium outline-none focus:border-brand-primary pr-20 shadow-inner group-hover:border-white/20 transition-all`}
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                          />
                          <button type="submit" className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 ${brandBg} text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all`}>
                             <Send size={18} fill="currentColor" />
                          </button>
                       </div>
                    </form>
                 </>
              ) : (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10 text-center gap-6 p-12">
                    <div className="p-12 bg-white/5 rounded-full">
                       <MessageSquare size={120} strokeWidth={1} />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Sync Protocol Standby</h3>
                       <p className="text-xs font-black uppercase tracking-[0.4em]">Select a colleague to initiate direct tactical sync.</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      )}

      {isCalling && selectedColleague && (
         <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-12 animate-in zoom-in-95 duration-500">
            <div className={`absolute inset-0 ${brandBg} opacity-5 animate-pulse`} />
            
            <div className="relative mb-16">
               <div className={`absolute inset-0 rounded-full border-4 ${isHotel ? 'border-brand-accent' : 'border-brand-primary'} animate-ping opacity-20 scale-150`} />
               <img src={selectedColleague.avatar} className="w-56 h-56 rounded-[60px] border-8 border-white/5 shadow-2xl relative z-10 object-cover" />
               <div className={`absolute -bottom-4 -right-4 p-6 ${brandBg} text-white rounded-[25px] shadow-2xl animate-bounce z-20`}>
                  <Phone size={36} fill="currentColor" />
               </div>
            </div>

            <div className="text-center space-y-6 relative z-10 mb-20">
               <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${brandHighlight} mb-3`}>Establishing Live Bridge</p>
                  <h3 className="text-7xl font-black italic uppercase tracking-tighter leading-none">{selectedColleague.name}</h3>
               </div>
               <div className="bg-white/5 px-8 py-3 rounded-2xl border border-white/10 inline-block">
                  <p className="text-2xl font-mono font-bold text-slate-300 tabular-nums italic leading-none">
                     {callTimer > 0 ? formatCallTime(callTimer) : 'Synchronizing Channels...'}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-12 relative z-10">
               <button onClick={() => setIsMuted(!isMuted)} className={`p-10 rounded-[40px] transition-all border-2 shadow-2xl ${isMuted ? 'bg-red-500 border-red-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}>
                  {isMuted ? <MicOff size={40} /> : <Mic size={40} />}
               </button>
               <button onClick={() => setIsCalling(false)} className="p-12 rounded-[50px] bg-red-600 hover:bg-red-700 text-white shadow-[0_20px_50px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all">
                  <PhoneOff size={56} fill="currentColor" />
               </button>
               <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-10 rounded-[40px] transition-all border-2 shadow-2xl ${isVideoOff ? 'bg-red-500 border-red-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}>
                  {isVideoOff ? <VideoOff size={40} /> : <VideoIcon size={40} />}
               </button>
            </div>

            <div className="absolute bottom-12 right-12 w-80 h-56 bg-black rounded-[45px] overflow-hidden border-4 border-white/10 shadow-2xl grayscale brightness-125 hover:grayscale-0 transition-all duration-700 group">
               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
               <div className={`absolute inset-0 ${isHotel ? 'bg-brand-accent' : 'bg-brand-primary'} opacity-10 pointer-events-none group-hover:bg-transparent`} />
               <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-[8px] font-black uppercase text-white/40">Local Feed</div>
            </div>
         </div>
      )}

      {view === 'schedule' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <div className="max-w-6xl mx-auto py-12 pb-24">
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-4xl font-black uppercase italic tracking-tighter">Plan Briefing</h3>
                 <button onClick={() => setView('lobby')} className="p-4 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all shadow-xl"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <form onSubmit={handleSchedule} className="lg:col-span-7 space-y-8 bg-slate-800 p-10 rounded-[50px] border border-white/5 shadow-2xl">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Briefing Context (Title)</label>
                          <input required className="w-full bg-slate-900 border border-white/5 rounded-[25px] px-8 py-5 font-bold outline-none focus:border-brand-primary" 
                            value={scheduleForm.title} onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})} placeholder="e.g. VIP Performer Sync" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Duration & Window</label>
                          <div className="grid grid-cols-3 gap-4">
                             <select className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 font-bold" value={scheduleForm.duration} onChange={e => setScheduleForm({...scheduleForm, duration: Number(e.target.value)})}>
                                {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                             </select>
                             <input type="time" className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 font-bold text-white" value={scheduleForm.startTime} onChange={e => setScheduleForm({...scheduleForm, startTime: e.target.value})} />
                             <div className="bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 font-black flex flex-col justify-center">
                                <p className="text-[8px] opacity-30 uppercase">Auto End</p>
                                <p className={`${brandHighlight} italic`}>{scheduleForm.endTime}</p>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 flex items-center gap-2"><UserPlus size={12} /> Assign Stakeholders</label>
                          <div className="flex flex-wrap gap-2 p-6 bg-slate-900 rounded-3xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                             {team.map(m => (
                                <button key={m.id} type="button" onClick={() => toggleAttendee(m.id)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-3 ${scheduleForm.attendees.includes(m.id) ? brandBg + ' border-current text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-500 hover:border-white/10'}`}
                                >
                                   <img src={m.avatar} className="w-5 h-5 rounded-md object-cover" />
                                   {m.name.split(' ')[0]}
                                </button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Brief Objective</label>
                          <textarea className="w-full bg-slate-900 border border-white/5 rounded-[25px] px-8 py-5 font-medium text-sm outline-none focus:border-brand-primary h-32 resize-none" 
                            value={scheduleForm.description} onChange={e => setScheduleForm({...scheduleForm, description: e.target.value})} placeholder="What are we resolving?" />
                       </div>
                    </div>
                    <button type="submit" disabled={isCommiting} className="w-full py-7 bg-emerald-500 text-white rounded-[30px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all">Authorize Sync Session</button>
                 </form>

                 <div className="lg:col-span-5 space-y-8 flex flex-col">
                    <div className="bg-slate-800 p-12 rounded-[50px] border border-white/5 flex-1 shadow-2xl flex flex-col items-center justify-center text-center">
                       <div className="w-20 h-20 bg-brand-accent/10 rounded-[30px] flex items-center justify-center text-brand-accent mb-8 shadow-inner">
                          <Zap size={48} fill="currentColor" />
                       </div>
                       <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Architecture Sync Active</h4>
                       <p className="text-sm font-medium text-slate-400 italic leading-relaxed px-6 max-w-sm">Leave agenda empty to allow Trackly AI to architect your briefing timeline based on the objective.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {view === 'room' && activeMeeting && (
        <div className="flex-1 flex gap-8 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
             <div className="flex-1 bg-black rounded-[50px] overflow-hidden relative border border-white/5 shadow-2xl">
                <video ref={videoRef} autoPlay playsInline muted={isMuted} className={`w-full h-full object-cover grayscale brightness-110 ${isVideoOff ? 'hidden' : 'block'}`} />
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 relative">
                     <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                     <img src={currentUser.avatar} className="w-56 h-56 rounded-[60px] border-4 border-white/10 shadow-2xl object-cover relative z-10" />
                  </div>
                )}
                <div className="absolute top-8 left-8 flex items-center gap-4">
                   <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl">
                      <div className={`w-2 h-2 ${brandBg} rounded-full animate-pulse`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{activeMeeting.title}</span>
                      <div className="h-4 w-px bg-white/10 mx-2" />
                      <span className="text-[10px] font-black text-slate-400">03:42 SECURE</span>
                   </div>
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-black/40 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                   <button onClick={() => setIsMuted(!isMuted)} className={`p-6 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>{isMuted ? <MicOff size={28} /> : <Mic size={28} />}</button>
                   <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-6 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>{isVideoOff ? <VideoOff size={28} /> : <VideoIcon size={28} />}</button>
                   <div className="w-px h-12 bg-white/10 mx-2" />
                   <button onClick={activateAIScribe} disabled={liveAILoading} className={`p-6 rounded-full transition-all ${liveAILoading ? 'bg-indigo-600 animate-pulse' : brandBg + ' hover:opacity-80'} text-white shadow-xl`}>
                      <Brain size={28} />
                   </button>
                   <button onClick={() => setView('lobby')} className="p-6 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20 transition-all hover:scale-110 active:scale-95"><X size={28} /></button>
                </div>
             </div>
             <div className="h-24 flex gap-4 overflow-x-auto custom-scrollbar pb-2 shrink-0">
                {activeMeeting.attendees.map(id => team.find(t => t.id === id)).filter(Boolean).map((p, idx) => (
                  <div key={idx} className="w-44 bg-slate-800 rounded-3xl overflow-hidden relative border border-white/5 group shrink-0 shadow-lg">
                     <img src={p?.avatar} className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500" />
                     <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                           <span className="text-[9px] font-black uppercase text-white tracking-tighter truncate max-w-[80px]">{p?.name.split(' ')[0]}</span>
                        </div>
                        <div className="bg-black/40 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                           <Mic size={10} className="text-white" />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="w-[450px] flex flex-col gap-6 overflow-hidden">
             <div className="flex-1 bg-slate-800/50 rounded-[50px] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
                <div className="flex border-b border-white/5 bg-slate-800/80">
                   {['agenda', 'logistics', 'notes'].map(t => (
                      <button key={t} onClick={() => setRoomSidebar(t as any)}
                        className={`flex-1 py-5 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${roomSidebar === t ? brandHighlight : 'text-slate-500 hover:text-slate-300'}`}
                      >
                         {t}
                         {roomSidebar === t && <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20" />}
                      </button>
                   ))}
                </div>

                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-black/10">
                   {roomSidebar === 'agenda' && (
                      <div className="space-y-8">
                         {activeMeeting.agenda?.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-6 animate-in fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                               <div className={`w-12 text-[9px] font-black ${brandHighlight} uppercase shrink-0 mt-0.5 border-r border-white/5 pr-4 italic`}>{item.timeBlock}</div>
                               <div className="flex-1 min-w-0">
                                  <h6 className="text-xs font-black text-white uppercase italic mb-1.5 tracking-tight truncate">{item.objective}</h6>
                                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">{item.detail}</p>
                               </div>
                            </div>
                         ))}
                         {(!activeMeeting.agenda || activeMeeting.agenda.length === 0) && (
                            <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
                               <ListChecks size={48} />
                               <p className="text-[10px] font-black uppercase italic">Awaiting synchronized agenda</p>
                            </div>
                         )}
                      </div>
                   )}
                   {roomSidebar === 'notes' && (
                      <div className="space-y-8">
                         <div className="flex items-center justify-between mb-2">
                            <h5 className="text-[10px] font-black uppercase text-brand-accent flex items-center gap-2 tracking-[0.2em]"><Brain size={14} /> Real-Time Intelligence</h5>
                            {liveAILoading && <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />}
                         </div>
                         <div className="space-y-6">
                            {activeMeeting.liveNotes?.map((note, idx) => (
                               <div key={idx} className="p-6 bg-white/5 rounded-[30px] border-l-4 border-l-brand-accent animate-in slide-in-from-right-4 shadow-xl">
                                  <p className="text-sm font-bold text-white/80 leading-relaxed italic">"{note}"</p>
                                  <div className="flex justify-end mt-2 opacity-20"><Smartphone size={10} /></div>
                               </div>
                            ))}
                            {(!activeMeeting.liveNotes || activeMeeting.liveNotes.length === 0) && (
                               <div className="py-20 text-center opacity-10">
                                  <Sparkles size={64} className="mx-auto mb-6" />
                                  <p className="text-xs font-black uppercase italic max-w-[180px] mx-auto leading-relaxed">Activate AI Scribe to parse the session for actionable objectives</p>
                               </div>
                            )}
                         </div>
                      </div>
                   )}
                </div>
                <form onSubmit={handleSendRoomMessage} className="p-8 pt-6 bg-black/40 border-t border-white/5">
                   <div className="relative group">
                      <input type="text" placeholder="Send sync message..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-sm font-medium outline-none pr-16 focus:bg-white/10 transition-all shadow-inner" value={chatInput} onChange={e => setChatInput(e.target.value)} />
                      <button type="submit" className={`absolute right-4 top-1/2 -translate-y-1/2 ${brandHighlight} group-focus-within:scale-110 transition-transform`}><Send size={24} fill="currentColor" /></button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingHub;
