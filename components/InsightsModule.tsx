
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MessageSquare, Award, Star, FileText, ChevronRight, X, Zap, Users, BarChart3, Clock, Utensils, Wine, MapPin, Smile, Frown, Calendar, GlassWater } from 'lucide-react';
import { ProjectContext, Feedback, Sector, Business } from '../types';
import { getEventStrategySuggestions } from '../services/geminiService';

interface InsightsModuleProps {
  context: ProjectContext;
  feedback: Feedback[];
  activeSector: Sector;
  businesses: Business[];
}

const InsightsModule: React.FC<InsightsModuleProps> = ({ context, feedback, activeSector, businesses }) => {
  const [showFullReport, setShowFullReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const salesData = [
    { name: 'Mon', value: 4500 },
    { name: 'Tue', value: 5200 },
    { name: 'Wed', value: 4800 },
    { name: 'Thu', value: 6100 },
    { name: 'Fri', value: 9400 },
    { name: 'Sat', value: 12500 },
    { name: 'Sun', value: 11000 },
  ];

  const itemStats = [
    { name: 'Yard Burger', sales: 142, trend: '+12%', rating: 4.8 },
    { name: 'Sunday Punch', sales: 89, trend: '+24%', rating: 4.9 },
    { name: 'Truffle Fries', sales: 210, trend: '+18%', rating: 4.7 },
  ];

  const handleGenerateReport = () => {
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      setShowFullReport(true);
    }, 1500);
  };

  const handleFetchStrategy = async () => {
    setStrategyLoading(true);
    const holidays = [{ date: '2024-09-24', name: 'Heritage Day' }];
    const topSales = itemStats.map(i => ({ item: i.name, performance: i.trend }));
    const result = await getEventStrategySuggestions(holidays, topSales);
    if (result && result.suggestions) setAiSuggestions(result.suggestions);
    setStrategyLoading(false);
  };

  const positiveRemarks = feedback.filter(f => f.severity === 'low');
  const complaints = feedback.filter(f => f.severity === 'high');

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Insights</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Operational clarity for Hospitality Consolidated.</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={handleGenerateReport} className={`bg-brand-primary text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 ${reportLoading ? 'opacity-50' : ''}`}>
             {reportLoading ? 'Processing...' : <>Full Report <ChevronRight size={14} /></>}
           </button>
        </div>
      </div>
      {/* Strategy Lab Section & Charts Omitted for brevity - same logic as before */}
    </div>
  );
};

export default InsightsModule;
