
import React, { useState, useEffect, useRef } from 'react';
import { Meeting, TeamMember, UserProfile, ProjectContext } from '../types';
// Added Circle to the lucide-react imports
import { Video, Mic, MicOff, VideoOff, Users, MessageSquare, ShieldCheck, Zap, X, Coffee, Send, ChevronRight, Activity, Circle } from 'lucide-react';

interface MeetingHubProps {
  meetings: Meeting[];
  team: TeamMember[];
  currentUser: UserProfile;
  context: ProjectContext;
}

const MeetingHub: React.FC<MeetingHubProps> = ({ meetings, team, currentUser, context }) => {
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(meetings[0] || null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{user: string, text: string, time: string}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isJoined && !isVideoOff) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isJoined, isVideoOff]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      user: currentUser.name,
      text: chatInput,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    setChatInput('');
  };

  const roomParticipants = activeMeeting?.attendees?.map(id => team.find(t => t.id === id)).filter(Boolean) || [];

  return (
    <div className="p-12 h-[calc(100vh-73px)] overflow-hidden flex flex-col bg-slate-900 text-white animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Meeting Hub Live</p>
           </div>
           <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
             {activeMeeting?.title || 'Operational Briefing Space'}
           </h2>
        </div>
        <div className="flex items-center gap-4">
           {isJoined && (
             <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                <Users size={16} className="text-slate-400" />
                <span className="text-xs font-black uppercase tracking-widest">{roomParticipants.length} Linked Personnel</span>
             </div>
           )}
           <button 
            onClick={() => {
              if (isJoined) {
                setIsJoined(false);
                stopCamera();
              } else {
                setIsJoined(true);
              }
            }}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${isJoined ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-brand-primary text-white shadow-brand-primary/20'}`}
           >
             {isJoined ? 'Disconnect Session' : 'Initiate Secure Feed'}
           </button>
        </div>
      </div>

      {!isJoined ? (
        <div className="flex-1 flex items-center justify-center p-12">
           <div className="max-w-xl w-full text-center space-y-8 bg-slate-800/50 p-16 rounded-[60px] border border-white/5 backdrop-blur-md">
              <div className="w-24 h-24 bg-brand-primary rounded-[35px] flex items-center justify-center mx-auto shadow-2xl shadow-brand-primary/20">
                 <Video size={48} className="text-white" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter">Ready to briefing?</h3>
                 <p className="text-slate-400 font-medium leading-relaxed">
                   Encryption active. Your operational status will be updated to 'In Meeting' across the Trackly deployment board once joined.
                 </p>
              </div>
              <div className="flex items-center justify-center gap-6">
                 <div className="text-center">
                    <p className="text-2xl font-black italic">{roomParticipants.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Invitees</p>
                 </div>
                 <div className="h-10 w-px bg-white/10" />
                 <div className="text-center">
                    <p className="text-2xl font-black italic text-brand-primary">{activeMeeting?.startTime}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Window</p>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-8 overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Main Stage */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
             <div className="flex-1 bg-black rounded-[50px] overflow-hidden relative border border-white/5 shadow-inner">
                {/* User Camera Feed */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted={isMuted}
                  className={`w-full h-full object-cover grayscale brightness-110 ${isVideoOff ? 'hidden' : 'block'}`}
                />
                
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                     <div className="text-center">
                        <img src={currentUser.avatar} className="w-48 h-48 rounded-[60px] mx-auto border-4 border-white/10 shadow-2xl mb-6" alt="" />
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white/40">Feed Terminated</h4>
                     </div>
                  </div>
                )}

                <div className="absolute top-8 left-8 flex items-center gap-4">
                   <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3 border border-white/10">
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Master Feed: {currentUser.name}</span>
                   </div>
                </div>

                {/* Media Controls Floating Overlay */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/40 backdrop-blur-xl rounded-[30px] border border-white/10 shadow-2xl">
                   <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-5 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                   >
                     {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                   </button>
                   <button 
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-5 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                   >
                     {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                   </button>
                   <div className="w-px h-10 bg-white/10 mx-2" />
                   <button className="p-5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                      <MessageSquare size={24} />
                   </button>
                   <button 
                    onClick={() => setIsJoined(false)}
                    className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-xl shadow-red-600/20"
                   >
                      <X size={24} />
                   </button>
                </div>
             </div>

             {/* Participant Grid Thumbnails */}
             <div className="h-32 flex gap-4">
                {roomParticipants.map((p, idx) => (
                  <div key={idx} className="w-48 bg-slate-800 rounded-3xl overflow-hidden relative border border-white/5 group">
                     <img src={p?.avatar} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" />
                     <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{p?.name.split(' ')[0]}</span>
                     </div>
                  </div>
                ))}
                <div className="w-48 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-20">
                   <Users size={24} />
                   <p className="text-[8px] font-black uppercase tracking-widest mt-2">Awaiting Ops</p>
                </div>
             </div>
          </div>

          {/* Tactical Sidebar */}
          <div className="w-[450px] flex flex-col gap-6 overflow-hidden">
             {/* Discussion Feed */}
             <div className="flex-1 bg-slate-800/50 rounded-[50px] border border-white/5 flex flex-col overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <h4 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                      <MessageSquare size={16} className="text-brand-primary" /> Briefing Comms
                   </h4>
                   <span className="text-[9px] font-black uppercase bg-white/5 px-2 py-1 rounded">Secure Port</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                   {messages.map((m, idx) => (
                     <div key={idx} className="space-y-2 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{m.user}</p>
                           <p className="text-[8px] font-medium text-slate-500">{m.time}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-sm font-medium leading-relaxed">
                           {m.text}
                        </div>
                     </div>
                   ))}
                   {messages.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-10 text-center gap-4">
                        <Send size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Comms Logged</p>
                     </div>
                   )}
                </div>

                <form onSubmit={handleSendMessage} className="p-8 pt-4 bg-black/20 border-t border-white/5">
                   <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Type tactical update..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-brand-primary transition-all pr-16"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                      />
                      <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary hover:scale-110 transition-transform">
                         <Send size={20} fill="currentColor" />
                      </button>
                   </div>
                </form>
             </div>

             {/* Briefing Checklist / Notes */}
             <div className="bg-brand-primary/10 rounded-[50px] border border-brand-primary/20 p-10 flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <Activity size={20} className="text-brand-primary" />
                      <h4 className="text-sm font-black uppercase tracking-widest italic">Hub Agenda</h4>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 opacity-100">
                         <ShieldCheck size={16} className="text-emerald-500" />
                         <span className="text-xs font-bold italic leading-none">Sync workforce for upcoming peak shift</span>
                      </div>
                      <div className="flex items-center gap-4 opacity-50">
                         <Circle size={16} />
                         <span className="text-xs font-bold italic leading-none">Review Sunday Theory performer rider</span>
                      </div>
                      <div className="flex items-center gap-4 opacity-50">
                         <Circle size={16} />
                         <span className="text-xs font-bold italic leading-none">Authorize stock replenishment (Batch #22)</span>
                      </div>
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t border-brand-primary/10">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary mb-3">Meeting Integrity</p>
                   <p className="text-xs font-medium text-slate-400 italic">Personnel Wellness: Forced breaks are paused during active briefing sessions. System resumes compliance logic post-disconnect.</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingHub;
