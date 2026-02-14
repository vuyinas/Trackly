
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, ShieldCheck, User, KeyRound, ChevronRight, Mail, ArrowRight, Fingerprint, X } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  profiles: UserProfile[];
}

const Login: React.FC<LoginProps> = ({ onLogin, profiles }) => {
  const [view, setView] = useState<'initial' | 'pin'>('initial');
  const [email, setEmail] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setSelectedProfile(found);
      setView('pin');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleInput = useCallback((digit: string) => {
    setPin(prev => {
      if (prev.length >= 4) return prev;
      return prev + digit;
    });
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
  }, []);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
  }, []);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view === 'pin' && /^[0-9]$/.test(e.key)) {
        handleInput(e.key);
      } else if (view === 'pin' && (e.key === 'Backspace' || e.key === 'Delete')) {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, handleInput, handleBackspace]);

  // Auth Logic
  useEffect(() => {
    if (view === 'pin' && selectedProfile && pin.length === 4) {
      if (pin === selectedProfile.pin) {
        onLogin(selectedProfile);
      } else {
        setError(true);
        const timer = setTimeout(() => {
          setPin('');
          setError(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [pin, view, selectedProfile, onLogin]);

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] flex items-center justify-center p-4 md:p-6 z-[9999] overflow-y-auto">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center py-12">
        
        {/* Left: Branding */}
        <div className="space-y-8 text-center md:text-left animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-16 h-16 bg-[#E9C891] rounded-2xl flex items-center justify-center text-[#1A1A1A] font-black text-3xl shadow-2xl shadow-brand-accent/20">T</div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic">TRACKLY</h1>
          </div>
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold text-[#F4F2F0] leading-[1.1] tracking-tight">The Operating System for Spaces.</h2>
            <p className="text-[#A1A1A1] text-lg md:text-xl max-w-md leading-relaxed italic">Secure terminal for Sunday Theory & The Yard personnel. Sync your presence to begin the cycle.</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
             <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <ShieldCheck size={16} className="text-brand-accent" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Encrypted Auth</span>
             </div>
             <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Fingerprint size={16} className="text-brand-accent" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Tactical Access</span>
             </div>
          </div>
        </div>

        {/* Right: Interaction Card */}
        <div className="bg-[#2A2A2A] p-8 md:p-14 rounded-[60px] shadow-2xl border border-white/5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-brand-accent/5 transition-all duration-700">
             <ShieldCheck size={180} strokeWidth={1} />
          </div>

          {view === 'initial' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-brand-accent/10 rounded-3xl flex items-center justify-center mb-6 border border-brand-accent/20">
                  <User size={32} className="text-brand-accent" />
                </div>
                <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] mb-2">Login Gateway</p>
                <h3 className="text-4xl font-black text-white tracking-tight italic uppercase leading-none">Authentication</h3>
              </div>
              
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-4">System Identity (Email)</label>
                   <div className="relative group">
                      <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-accent transition-colors" />
                      <input 
                        type="email" 
                        required
                        placeholder="Enter authorized email..."
                        className={`w-full bg-white/5 border-2 rounded-[30px] pl-16 pr-6 py-6 text-white font-bold outline-none transition-all ${error ? 'border-red-500' : 'border-white/5 focus:border-brand-accent focus:bg-white/10'}`}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                   </div>
                </div>
                {error && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-pulse">Identity not found in registry</p>}
                <button 
                  type="submit"
                  className="w-full bg-brand-accent text-[#1A1A1A] py-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Verify Access <ArrowRight size={18} />
                </button>
              </form>

              <div className="pt-8 border-t border-white/5 text-center">
                 <p className="text-[9px] font-bold uppercase tracking-widest italic text-white/10">Authorized Personnel Only • IP Logged</p>
              </div>
            </div>
          )}

          {view === 'pin' && (
            <div className="space-y-10 animate-in zoom-in-95 duration-300 relative z-10">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => { setView('initial'); handleClear(); setSelectedProfile(null); }}
                  className="text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-brand-accent flex items-center gap-2 transition-colors"
                >
                  <ChevronRight size={14} className="rotate-180" /> Change Identity
                </button>
                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Validated Identity</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <img src={selectedProfile?.avatar} className="w-32 h-32 rounded-[45px] border-4 border-brand-accent/20 shadow-2xl object-cover" alt="" />
                  <div className="absolute -bottom-1 -right-1 p-3 bg-brand-accent rounded-2xl shadow-xl">
                    <KeyRound size={20} className="text-[#1A1A1A]" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedProfile?.name}</h3>
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-3">{selectedProfile?.role} • Secure Port Access</p>
                </div>
              </div>

              <div className="flex justify-center gap-6 py-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${pin.length > i ? 'bg-brand-accent border-brand-accent scale-110 shadow-[0_0_25px_rgba(233,200,145,0.3)]' : 'border-white/10'} ${error ? 'bg-red-500 border-red-500 animate-shake' : ''}`} 
                  >
                    {pin.length > i && <div className="w-2.5 h-2.5 bg-[#1A1A1A] rounded-full" />}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['1','2','3','4','5','6','7','8','9','C','0', 'X'].map((val, idx) => {
                  if (val === 'X') return (
                    <button key={idx} onClick={handleBackspace} className="h-14 rounded-2xl flex items-center justify-center bg-white/5 text-white/40 hover:text-red-400 hover:bg-white/10 transition-all active:scale-95">
                       <X size={20} />
                    </button>
                  );
                  return (
                    <button
                      key={idx}
                      onClick={() => val === 'C' ? handleClear() : handleInput(val)}
                      className={`h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90 ${val === 'C' ? 'bg-white/5 text-white/20 hover:text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-[9px] font-bold text-white/10 uppercase tracking-[0.4em] italic">Access Authorization Required</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
