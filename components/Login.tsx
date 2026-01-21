
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, User, KeyRound, ChevronRight, Mail, ArrowRight, X } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  profiles: UserProfile[];
}

const Login: React.FC<LoginProps> = ({ onLogin, profiles }) => {
  const [email, setEmail] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setSelectedProfile(found);
      setIsEmailSubmitted(true);
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

  useEffect(() => {
    if (!selectedProfile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleInput(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProfile, handleInput, handleBackspace]);

  useEffect(() => {
    if (selectedProfile && pin.length === 4) {
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
  }, [pin, selectedProfile, onLogin]);

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] flex items-center justify-center p-6 z-[9999]">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left: Branding */}
        <div className="space-y-8 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 bg-[#E9C891] rounded-2xl flex items-center justify-center text-[#1A1A1A] font-black text-2xl">T</div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">TRACKLY</h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-[#F4F2F0] leading-tight">Welcome to the Operating System.</h2>
            <p className="text-[#A1A1A1] text-lg max-w-sm">Enterprise-grade secure terminal access for The Yard & Sunday Theory.</p>
          </div>
        </div>

        {/* Right: Interaction */}
        <div className="bg-[#2A2A2A] p-12 rounded-[50px] shadow-2xl border border-white/5 overflow-hidden">
          {!isEmailSubmitted ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E9C891]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#E9C891]/20">
                  <User size={32} className="text-[#E9C891]" />
                </div>
                <p className="text-[10px] font-black text-[#E9C891] uppercase tracking-[0.3em] mb-2">Security Port</p>
                <h3 className="text-3xl font-bold text-white tracking-tight italic uppercase">Identity Verification</h3>
              </div>
              
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">Authorized Email Address</label>
                   <div className="relative group">
                      <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#E9C891] transition-colors" />
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. alex@theyard.com"
                        className={`w-full bg-white/5 border-2 rounded-[25px] pl-16 pr-6 py-6 text-white font-bold outline-none transition-all ${error ? 'border-red-500' : 'border-white/5 focus:border-[#E9C891] focus:bg-white/10'}`}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                   </div>
                </div>
                {error && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-pulse">Account Identity Refused</p>}
                <button 
                  type="submit"
                  className="w-full bg-[#E9C891] text-[#1A1A1A] py-6 rounded-[25px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  Verify Access <ArrowRight size={18} />
                </button>
              </form>
              <div className="pt-8 border-t border-white/5 flex items-center justify-center gap-4 text-white/20">
                 <ShieldCheck size={16} />
                 <p className="text-[9px] font-bold uppercase tracking-widest italic">Terminal ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => { setIsEmailSubmitted(false); handleClear(); setSelectedProfile(null); }}
                  className="text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-[#E9C891] flex items-center gap-2 transition-colors"
                >
                  <ChevronRight size={14} className="rotate-180" /> Change Login
                </button>
                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Validated Identity</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <img src={selectedProfile?.avatar} className="w-28 h-28 rounded-[40px] border-4 border-[#E9C891]/20 shadow-2xl object-cover" alt="" />
                  <div className="absolute -bottom-1 -right-1 p-2 bg-[#E9C891] rounded-2xl shadow-xl">
                    <KeyRound size={16} className="text-[#1A1A1A]" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{selectedProfile?.name}</h3>
                  <p className="text-sm text-white/30 font-medium tracking-tight mt-1">{selectedProfile?.role} • Secure PIN Required</p>
                </div>
              </div>

              <div className="flex justify-center gap-6 py-4">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-6 h-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${pin.length > i ? 'bg-[#E9C891] border-[#E9C891] scale-125 shadow-[0_0_20px_rgba(233,200,145,0.4)]' : 'border-white/10'} ${error ? 'bg-red-500 border-red-500 animate-shake' : ''}`} 
                  >
                    {pin.length > i && <div className="w-2 h-2 bg-[#1A1A1A] rounded-full" />}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {['1','2','3','4','5','6','7','8','9','C','0', 'X'].map((val, idx) => {
                  if (val === 'X') return (
                    <button key={idx} onClick={handleBackspace} className="h-16 rounded-2xl flex items-center justify-center bg-white/5 text-white/40 hover:text-red-400 hover:bg-white/10 transition-all">
                       <X size={20} />
                    </button>
                  );
                  return (
                    <button
                      key={idx}
                      onClick={() => val === 'C' ? handleClear() : handleInput(val)}
                      className={`h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90 ${val === 'C' ? 'bg-white/5 text-white/20 hover:text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-[9px] font-bold text-white/10 uppercase tracking-widest italic">Terminal Biometric Failover Engaged</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
