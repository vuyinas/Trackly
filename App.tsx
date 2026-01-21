
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import PresenceHub from './components/PresenceHub';
import EmailHub from './components/EmailHub';
import ShiftPlanner from './components/ShiftPlanner';
import BreakLockout from './components/BreakLockout';
import POSModule from './components/POSModule';
import KitchenDisplay from './components/KitchenDisplay';
import EventModule from './components/EventModule';
import InsightsModule from './components/InsightsModule';
import ProcurementModule from './components/ProcurementModule';
import TicketingModule from './components/TicketingModule';
import EventExecutionModule from './components/EventExecutionModule';
import NewEventForm from './components/NewEventForm';
import EventSummary from './components/EventSummary';
import BillModule from './components/BillModule';
import MenuManagementModule from './components/MenuManagementModule';
import CalendarModule from './components/CalendarModule';
import MeetingHub from './components/MeetingHub';
import PayrollModule from './components/PayrollModule';
import ReportsModule from './components/ReportsModule';
import Login from './components/Login';
import { 
  Task, 
  Email,
  TeamMember, 
  TaskStatus, 
  PresenceStatus, 
  AppMode, 
  ProjectContext, 
  UserRole, 
  Order, 
  MenuItem, 
  Event, 
  Meeting,
  Responsibility,
  Shift,
  ProcurementOrder,
  Supplier,
  DeliveryCategory,
  Feedback,
  PayrollRecord
} from './types';
import { X, Save, Edit3, ShieldCheck, Lock, Image as ImageIcon } from 'lucide-react';

const INITIAL_FEEDBACK: Feedback[] = [
  { id: 'f1', source: 'customer', category: 'service', severity: 'low', comment: "Alex was incredibly attentive tonight. The best service we've had at The Yard in months!", resolved: true, timestamp: new Date().toISOString() },
  { id: 'f2', source: 'customer', category: 'food', severity: 'high', comment: "Truffle fries were cold and arrived 20 minutes after the burgers. Very disappointing.", resolved: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
];

const INITIAL_TEAM: TeamMember[] = [
  { 
    id: 'u1', 
    name: 'Alex Herschel', 
    email: 'alex@theyard.com',
    role: UserRole.OWNER, 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', 
    status: PresenceStatus.AT_DESK, 
    context: ProjectContext.THE_YARD,
    pin: '1234',
    defaultContext: ProjectContext.THE_YARD,
    responsibilities: Object.values(Responsibility),
    baseHourlyRate: 250,
    overtimeMultiplier: 1.5,
    overtimeThreshold: 40,
    birthday: '05-15'
  },
  { 
    id: 'u2', 
    name: 'Sarah Theory', 
    email: 'sarah@sundaytheory.com',
    role: UserRole.MANAGER, 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200', 
    status: PresenceStatus.ON_SHIFT, 
    context: ProjectContext.SUNDAY_THEORY,
    pin: '0000',
    defaultContext: ProjectContext.SUNDAY_THEORY,
    responsibilities: Object.values(Responsibility),
    baseHourlyRate: 180,
    overtimeMultiplier: 1.5,
    overtimeThreshold: 40,
    birthday: '11-20'
  },
];

const INITIAL_EMAILS: Email[] = [
  { id: 'e1', sender: 'Supplier: Fresh Harvest', subject: 'Inquiry: Weekend Delivery Schedule', receivedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), isResponded: false, urgency: 8 },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't-rec-1',
    title: 'Daily Bar Audit',
    description: 'Ensure all spirit levels are logged and stock counts match POS reports.',
    status: TaskStatus.TODO,
    assignees: ['u2'],
    dueDate: new Date().toISOString(),
    priority: 'high',
    isRecurring: true,
    recurrenceType: 'weekly',
    context: ProjectContext.THE_YARD,
    progress: 0,
    category: 'bar'
  }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Fresh Harvest Co.', category: DeliveryCategory.KITCHEN, contact: 'orders@freshharvest.co.za', reliability: 98, avgLeadTime: '2 Days', catalog: [] },
  { id: 's2', name: 'Elite Beverage Dist.', category: DeliveryCategory.BAR, contact: 'sales@elitebev.com', reliability: 95, avgLeadTime: '3 Days', catalog: [] },
  { id: 's3', name: 'Mainstay Ops Solutions', category: DeliveryCategory.OFFICE, contact: 'support@mainstay.co.za', reliability: 92, avgLeadTime: '5 Days', catalog: [] },
];

const INITIAL_MENU: MenuItem[] = [
  { id: 'm1', name: 'Still Water 500ml', price: 25, category: 'Drinks', stock: 100, context: ProjectContext.THE_YARD, variants: ['Still', 'Sparkling'], availableToStaff: true },
  { id: 'm2', name: 'Assorted Juices', price: 35, category: 'Drinks', stock: 80, context: ProjectContext.THE_YARD, variants: ['Orange', 'Apple', 'Cranberry', 'Mango'], availableToStaff: true },
];

// Helper for persistence
const getSavedData = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const App: React.FC = () => {
  // Persistent Session States
  const [user, setUser] = useState<TeamMember | null>(() => {
    const saved = getSavedData('trackly_active_user', null);
    return saved || INITIAL_TEAM[0]; 
  });

  const [appMode, setAppMode] = useState<AppMode>(() => getSavedData('trackly_app_mode', AppMode.TRACKLY));
  const [activeTab, setActiveTab] = useState(() => getSavedData('trackly_active_tab', 'tasks')); 
  const [context, setContext] = useState<ProjectContext>(() => getSavedData('trackly_active_context', ProjectContext.THE_YARD));
  
  // Persistent Data States
  const [tasks, setTasks] = useState<Task[]>(() => getSavedData('trackly_tasks', INITIAL_TASKS));
  const [meetings, setMeetings] = useState<Meeting[]>(() => getSavedData('trackly_meetings', []));
  const [emails, setEmails] = useState<Email[]>(() => getSavedData('trackly_emails', INITIAL_EMAILS));
  const [orders, setOrders] = useState<Order[]>(() => getSavedData('trackly_orders', []));
  const [menu, setMenu] = useState<MenuItem[]>(() => getSavedData('trackly_menu', INITIAL_MENU));
  const [events, setEvents] = useState<Event[]>(() => getSavedData('trackly_events', []));
  const [procurementOrders, setProcurementOrders] = useState<ProcurementOrder[]>(() => getSavedData('trackly_procurement', []));
  const [team, setTeam] = useState<TeamMember[]>(() => getSavedData('trackly_team', INITIAL_TEAM));
  const [shifts, setShifts] = useState<Shift[]>(() => getSavedData('trackly_shifts', []));
  const [feedback, setFeedback] = useState<Feedback[]>(() => getSavedData('trackly_feedback', INITIAL_FEEDBACK));
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => getSavedData('trackly_payroll', []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getSavedData('trackly_suppliers', INITIAL_SUPPLIERS));
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [workTime, setWorkTime] = useState(0);

  // Sync session and data to LocalStorage
  useEffect(() => localStorage.setItem('trackly_active_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('trackly_app_mode', JSON.stringify(appMode)), [appMode]);
  useEffect(() => localStorage.setItem('trackly_active_tab', JSON.stringify(activeTab)), [activeTab]);
  useEffect(() => localStorage.setItem('trackly_active_context', JSON.stringify(context)), [context]);
  
  useEffect(() => localStorage.setItem('trackly_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('trackly_meetings', JSON.stringify(meetings)), [meetings]);
  useEffect(() => localStorage.setItem('trackly_emails', JSON.stringify(emails)), [emails]);
  useEffect(() => localStorage.setItem('trackly_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('trackly_menu', JSON.stringify(menu)), [menu]);
  useEffect(() => localStorage.setItem('trackly_events', JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem('trackly_procurement', JSON.stringify(procurementOrders)), [procurementOrders]);
  useEffect(() => localStorage.setItem('trackly_team', JSON.stringify(team)), [team]);
  useEffect(() => localStorage.setItem('trackly_shifts', JSON.stringify(shifts)), [shifts]);
  useEffect(() => localStorage.setItem('trackly_feedback', JSON.stringify(feedback)), [feedback]);
  useEffect(() => localStorage.setItem('trackly_payroll', JSON.stringify(payrollRecords)), [payrollRecords]);
  useEffect(() => localStorage.setItem('trackly_suppliers', JSON.stringify(suppliers)), [suppliers]);

  useEffect(() => {
    const root = document.documentElement;
    if (context === ProjectContext.THE_YARD) {
      root.style.setProperty('--brand-primary', '#AF431D');
      root.style.setProperty('--brand-accent', '#E9C891');
      root.style.setProperty('--brand-bg', '#F4F2F0');
    } else {
      root.style.setProperty('--brand-primary', '#8B8635');
      root.style.setProperty('--brand-accent', '#E9C891');
      root.style.setProperty('--brand-bg', '#F2F1ED');
    }
  }, [context]);

  useEffect(() => {
    if (user) {
      const timer = setInterval(() => setWorkTime(p => p + 1), 60000);
      return () => clearInterval(timer);
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTeam(prev => prev.map(m => {
        if (m.status === PresenceStatus.FOCUS && m.statusExpiresAt) {
          if (new Date().getTime() > new Date(m.statusExpiresAt).getTime()) {
            const updated = { ...m, status: PresenceStatus.AT_DESK, statusExpiresAt: undefined };
            if (user?.id === m.id) setUser(updated);
            return updated;
          }
        }
        return m;
      }));
    }, 10000);
    return () => clearInterval(timer);
  }, [user?.id]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'progress'>) => {
    setTasks(prev => [...prev, { ...taskData, id: `task-${Date.now()}`, progress: 0 }]);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    const progressMap: Record<TaskStatus, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 50,
      [TaskStatus.REVIEW]: 90,
      [TaskStatus.DONE]: 100
    };
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, progress: progressMap[status] } : t));
  };

  const handleAddMeeting = (meeting: Omit<Meeting, 'id'>) => {
    setMeetings(prev => [...prev, { ...meeting, id: `meet-${Date.now()}` }]);
  };

  const handleUpdateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleCreateEvent = (eventData: any) => {
    if (editingEventId) {
      setEvents(prev => prev.map(e => e.id === editingEventId ? { ...e, ...eventData } : e));
      setEditingEventId(null);
      setActiveTab('events');
    } else {
      const newEvent: Event = { ...eventData, id: `ev-${Date.now()}`, acknowledgedBy: [] };
      setEvents(prev => [...prev, newEvent]);
      setCreatedEventId(newEvent.id);
      setActiveTab('event-summary');
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleEditEvent = (id: string) => {
    setEditingEventId(id);
    setActiveTab('create-event');
  };

  const handleUpdateChecklist = (eventId: string, itemId: string, status: 'todo' | 'in-progress' | 'done') => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, checklists: e.checklists.map(item => item.id === itemId ? { ...item, status } : item) } : e));
  };

  const handleAcknowledgeBriefing = (eventId: string, mId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, acknowledgedBy: [...(e.acknowledgedBy || []), mId] } : e));
  };

  const handleAddMember = (member: Omit<TeamMember, 'id' | 'status'>) => {
    const newMember: TeamMember = { ...member as TeamMember, id: `u-${Date.now()}`, status: PresenceStatus.OUT_OF_OFFICE };
    setTeam(prev => [...prev, newMember]);
  };

  const handleUpdateMember = (id: string, member: Partial<TeamMember>) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, ...member } : m));
    if (user?.id === id) setUser(prev => prev ? { ...prev, ...member } : null);
  };

  const handleUpdatePresenceStatus = (status: PresenceStatus, expiry?: string) => {
    if (!user) return;
    const updates = { status, statusExpiresAt: expiry };
    setTeam(prev => prev.map(m => m.id === user.id ? { ...m, ...updates } : m));
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleAddProcurementOrder = (order: Omit<ProcurementOrder, 'id' | 'status'>) => {
    setProcurementOrders(prev => [...prev, { ...order, id: `po-${Date.now()}`, status: 'ordered' } as ProcurementOrder]);
  };

  const handleUpdateProcurementStatus = (id: string, status: ProcurementOrder['status']) => {
    setProcurementOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handlePlaceOrder = (orderData: Partial<Order>) => {
    const newOrder = { ...orderData, id: `ord-${Date.now()}`, serverName: user?.name || 'Unknown' } as Order;
    setOrders(prev => [...prev, newOrder]);
  };

  const handleUpdateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleProcessPayroll = (records: PayrollRecord[]) => {
    setPayrollRecords(prev => [...prev, ...records]);
  };

  const handleAddShift = (shift: Omit<Shift, 'id'>) => {
    setShifts(prev => [...prev, { ...shift, id: `shift-${Date.now()}` }]);
  };

  const handleUpdateShift = (id: string, updates: Partial<Shift>) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenu(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    setMenu(prev => [...prev, { ...item, id: `m-${Date.now()}` } as MenuItem]);
  };

  const handleAddSupplier = (supplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: `sup-${Date.now()}`, catalog: supplier.catalog || [] } as Supplier]);
  };

  const handleUpdateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const filteredEvents = useMemo(() => events.filter(e => e.context === context), [events, context]);
  const latestCreatedEvent = useMemo(() => events.find(e => e.id === createdEventId), [events, createdEventId]);
  const editingEvent = useMemo(() => events.find(e => e.id === editingEventId), [events, editingEventId]);
  const isManager = user?.role === UserRole.OWNER || user?.role === UserRole.MANAGER;
  const hasAccess = (resp: Responsibility) => user?.responsibilities.includes(resp);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('trackly_active_user');
    setWorkTime(0);
    setActiveTab('dashboard');
    setShowProfileModal(false);
  };

  const renderContent = () => {
    if (!user) return <Login onLogin={(u) => setUser(u as TeamMember)} profiles={team} />;

    if (appMode === AppMode.POS) {
      switch (activeTab) {
        case 'pos-terminal':
          return hasAccess(Responsibility.POS) ? <POSModule menu={menu} context={context} onPlaceOrder={handlePlaceOrder} /> : <RestrictedSegment resp="POS Terminal" />;
        case 'kds':
          return hasAccess(Responsibility.KDS) ? <KitchenDisplay orders={orders} onCompleteOrder={(id) => handleUpdateOrderStatus(id, 'ready')} onCollectOrder={(id) => handleUpdateOrderStatus(id, 'delivered')} /> : <RestrictedSegment resp="Kitchen Queue" />;
        case 'bills':
          return hasAccess(Responsibility.BILLS) ? <BillModule orders={orders} context={context} onUpdateStatus={handleUpdateOrderStatus} /> : <RestrictedSegment resp="Bill Hub" />;
        case 'menu-manager':
          return hasAccess(Responsibility.MENU_MANAGER) ? <MenuManagementModule menu={menu} context={context} onAdd={handleAddMenuItem} onUpdate={handleUpdateMenuItem} onDelete={(id) => setMenu(prev => prev.filter(m => m.id !== id))} /> : <RestrictedSegment resp="Menu Lab" />;
        default:
          return <POSModule menu={menu} context={context} onPlaceOrder={handlePlaceOrder} />;
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return hasAccess(Responsibility.DASHBOARD) ? (
          <Dashboard 
            tasks={tasks} 
            emails={emails} 
            team={team} 
            user={user} 
            onViewEmails={() => setActiveTab('emails')} 
            onUpdatePresence={handleUpdatePresenceStatus}
          />
        ) : <RestrictedSegment resp="Pulse Dashboard" />;
      case 'tasks':
        return hasAccess(Responsibility.TASKS) ? (
          <TaskBoard 
            tasks={tasks} 
            team={team} 
            events={events} 
            menu={menu} 
            context={context} 
            onUpdateStatus={handleUpdateTaskStatus} 
            onAddTask={handleAddTask} 
            onUpdateTask={handleUpdateTask}
          />
        ) : <RestrictedSegment resp="Operations Board" />;
      case 'emails':
        return <EmailHub emails={emails} />;
      case 'calendar':
        return hasAccess(Responsibility.CALENDAR) ? <CalendarModule events={events} meetings={meetings} team={team} context={context} onAddMeeting={handleAddMeeting} onUpdateMeeting={handleUpdateMeeting} onDeleteMeeting={handleDeleteMeeting} onJoinMeeting={() => setActiveTab('meeting-room')} /> : <RestrictedSegment resp="Calendar" />;
      case 'meeting-room':
        return hasAccess(Responsibility.MEETINGS) ? <MeetingHub meetings={meetings} team={team} currentUser={user} context={context} /> : <RestrictedSegment resp="Meeting Hub" />;
      case 'deliveries':
        return hasAccess(Responsibility.SUPPLY_CHAIN) ? (
          <ProcurementModule 
            orders={procurementOrders} 
            suppliers={suppliers} 
            team={team} 
            events={events} 
            menu={menu} 
            context={context} 
            onUpdateOrderStatus={handleUpdateProcurementStatus} 
            onAddOrder={handleAddProcurementOrder}
            onAddSupplier={handleAddSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        ) : <RestrictedSegment resp="Supply Chain" />;
      case 'events':
        return hasAccess(Responsibility.EVENTS) ? <EventModule events={filteredEvents} onCreateNew={() => { setEditingEventId(null); setActiveTab('create-event'); }} onEdit={handleEditEvent} onDelete={handleDeleteEvent} /> : <RestrictedSegment resp="Events Intelligence" />;
      case 'create-event':
        return hasAccess(Responsibility.EVENTS) ? <NewEventForm context={context} menu={menu} initialData={editingEvent} onCancel={() => setActiveTab('events')} onSave={handleCreateEvent} /> : <RestrictedSegment resp="Event Architect" />;
      case 'event-summary':
        return latestCreatedEvent ? <EventSummary event={latestCreatedEvent} onViewModule={(t) => setActiveTab(t)} onFinish={() => setActiveTab('events')} /> : <Dashboard tasks={tasks} emails={emails} team={team} />;
      case 'ticketing':
        return hasAccess(Responsibility.TICKETING) ? <TicketingModule events={filteredEvents} context={context} /> : <RestrictedSegment resp="Traffic Intelligence" />;
      case 'execution':
        return hasAccess(Responsibility.EXECUTION) ? <EventExecutionModule events={filteredEvents} context={context} memberId={user.id} onUpdateChecklist={handleUpdateChecklist} onAcknowledgeBriefing={handleAcknowledgeBriefing} /> : <RestrictedSegment resp="Execution Hub" />;
      case 'insights':
        return hasAccess(Responsibility.INSIGHTS) ? <InsightsModule context={context} feedback={feedback} /> : <RestrictedSegment resp="Founder Intelligence" />;
      case 'reports':
        return hasAccess(Responsibility.REPORTS) ? <ReportsModule orders={orders} procurement={procurementOrders} payroll={payrollRecords} feedback={feedback} context={context} /> : <RestrictedSegment resp="Executive Reports" />;
      case 'shifts':
        return hasAccess(Responsibility.SHIFT_PLANNER) ? <ShiftPlanner shifts={shifts} team={team} onAddShift={handleAddShift} onUpdateShift={handleUpdateShift} onDeleteShift={handleDeleteShift} /> : <RestrictedSegment resp="Scheduling" />;
      case 'payroll':
        return hasAccess(Responsibility.PAYROLL) ? <PayrollModule team={team} shifts={shifts} payrollRecords={payrollRecords} context={context} onUpdateMemberPay={handleUpdateMember} onProcessCycle={handleProcessPayroll} /> : <RestrictedSegment resp="Financial Command" />;
      case 'team':
        return hasAccess(Responsibility.STAFF) ? <PresenceHub team={team} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={() => {}} isManager={isManager} /> : <RestrictedSegment resp="Staff Hub" />;
      case 'break':
        return hasAccess(Responsibility.WELLNESS) ? <BreakLockout workTimeInMinutes={workTime} maxWorkTime={240} showDashboard={true} onPlanWellness={(w) => handleAddMeeting({ ...w, type: 'wellness', context })} /> : <RestrictedSegment resp="Wellness Monitor" />;
      default:
        return <Dashboard tasks={tasks} emails={emails} team={team} onViewEmails={() => setActiveTab('emails')} />;
    }
  };

  if (!user) return <Login onLogin={(u) => setUser(u as TeamMember)} profiles={team} />;

  return (
    <div className="min-h-screen flex theme-transition">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        appMode={appMode} 
        setAppMode={setAppMode} 
        context={context} 
        setContext={setContext} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 md:ml-20 min-h-screen relative flex flex-col overflow-hidden pt-16 md:pt-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-white/20 px-4 md:px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4 md:gap-6">
              <div>
                 <p className="text-[8px] md:text-[10px] font-black opacity-40 uppercase tracking-widest leading-none mb-1">Building Tracker</p>
                 <h2 className="text-sm md:xl font-black text-brand-primary tracking-tighter uppercase italic leading-none">
                    {context === ProjectContext.THE_YARD ? 'The Yard on Herschel' : 'Sunday Theory'}
                 </h2>
              </div>
           </div>
           
           <div className="flex items-center gap-4 md:gap-6">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none mb-1">Active Trace</p>
                 <p className="text-sm font-mono font-black text-brand-primary leading-none">{tasks.filter(t => t.status !== TaskStatus.DONE).length} Tasks Left</p>
              </div>
              <button onClick={() => setShowProfileModal(true)} className="h-10 w-10 md:h-12 md:w-12 rounded-2xl border-2 border-brand-primary overflow-hidden shadow-lg hover:scale-105 transition-transform"><img src={user.avatar} className="h-full w-full object-cover" alt="" /></button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-[40px] md:rounded-[50px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 md:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">Identity Lab</h3>
                <button onClick={() => setShowProfileModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                 <div className="flex flex-col items-center gap-4 md:gap-6">
                    <div className="relative group">
                       <img src={user.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-[30px] md:rounded-[40px] border-4 md:border-8 border-slate-50 shadow-2xl object-cover transition-all group-hover:brightness-50" alt="" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="text-white" size={24} />
                       </div>
                    </div>
                    <h4 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">{user.name}</h4>
                 </div>
                 
                 <div className="space-y-4 md:space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Identity</label>
                       <input 
                        type="text" 
                        className="w-full px-4 md:px-6 py-3 md:py-4 bg-slate-50 rounded-xl md:rounded-2xl font-bold border-2 border-transparent focus:border-brand-primary outline-none" 
                        value={user.name} 
                        onChange={e => handleUpdateMember(user.id, { name: e.target.value })} 
                       />
                    </div>
                 </div>

                 <div className="flex gap-4">
                   <button onClick={handleLogout} className="flex-1 py-4 md:py-5 bg-red-50 text-red-500 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all text-[10px] md:text-xs">Sign Out</button>
                   <button onClick={() => setShowProfileModal(false)} className="flex-[2] py-4 md:py-5 bg-brand-primary text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-[10px] md:text-xs">Save Changes <Save size={16} /></button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <BreakLockout workTimeInMinutes={workTime} maxWorkTime={240} showDashboard={false} />
    </div>
  );
};

const RestrictedSegment = ({ resp }: { resp: string }) => (
  <div className="p-10 md:p-20 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Lock size={32} /></div>
    <div>
      <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-800">Segment Restricted</h3>
      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px] mt-2">Missing Responsibility: {resp}</p>
    </div>
  </div>
);

export default App;
