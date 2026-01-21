
import React, { useState } from 'react';
import { Email } from '../types';
import { Mail, Reply, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react';
import { analyzeEmails } from '../services/geminiService';

interface EmailHubProps {
  emails: Email[];
}

const EmailHub: React.FC<EmailHubProps> = ({ emails }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<any>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeEmails(emails);
    setAiInsight(result);
    setAnalyzing(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Email Inbox Integration</h2>
          <p className="text-slate-500">Never miss critical communications from clients or stakeholders.</p>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {analyzing ? 'Analyzing...' : 'AI Response Priority'}
        </button>
      </div>

      {aiInsight && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-indigo-500 p-1.5 rounded-lg text-white">
              <AlertCircle size={18} />
            </div>
            <h3 className="font-bold text-indigo-900">AI Priority Alert</h3>
          </div>
          <p className="text-indigo-800 mb-4 font-medium">{aiInsight.reason}</p>
          <div className="bg-white/60 p-4 rounded-xl">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Suggested Response Points</p>
            <ul className="space-y-2">
              {aiInsight.suggestedReplyPoints.map((point: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search emails..." 
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-500 transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {emails.map((email) => (
            <div key={email.id} className={`group flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!email.isResponded ? 'bg-indigo-50/20' : ''}`}>
              <div className={`p-2 rounded-xl ${email.isResponded ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'}`}>
                {email.isResponded ? <CheckCircle2 size={20} /> : <Mail size={20} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className={`text-sm ${!email.isResponded ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                    {email.sender}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm truncate ${!email.isResponded ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  {email.subject}
                </p>
              </div>

              <div className="hidden group-hover:flex items-center gap-2">
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Quick Reply">
                  <Reply size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailHub;
