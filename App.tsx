
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import PresenceHub from './components/PresenceHub';
import EventModule from './components/EventModule';
import InsightsModule from './components/InsightsModule';
import NewEventForm from './components/NewEventForm';
import POSModule from './components/POSModule';
import KitchenDisplay from './components/KitchenDisplay';
import BillModule from './components/BillModule';
import MenuManagementModule from './components/MenuManagementModule';
import ShiftPlanner from './components/ShiftPlanner';
import BreakLockout from './components/BreakLockout';
import TicketingModule from './components/TicketingModule';
import PayrollModule from './components/PayrollModule';
import ReportsModule from './components/ReportsModule';
import SocialIntelModule from './components/SocialIntelModule';
import CalendarModule from './components/CalendarModule';
import MeetingHub from './components/MeetingHub';
import ProcurementModule from './components/ProcurementModule';

// HOTEL COMPONENTS
import HotelDashboard from './components/HotelDashboard';
import HotelGuestModule from './components/HotelGuestModule';
import HotelHousekeepingModule from './components/HotelHousekeepingModule';
import HotelDiningModule from './components/HotelDiningModule';
import HotelFacilitiesModule from './components/HotelFacilitiesModule';
import HotelVipModule from './components/HotelVipModule';
import HotelOpsModule from './components/HotelOpsModule';
import EventExecutionModule from './components/EventExecutionModule';

import { 
  Task, TeamMember, PresenceStatus, AppMode, ProjectContext, UserRole, Order, Event,
  Responsibility, Shift, Business, Sector, Room, Booking, HousekeepingTask, MaintenanceTicket, 
  IncidentReport, VipResidencyProtocol, CrossDomainSignal, Feedback, StockDelivery, MenuItem, Performer,
  SocialLink, PayrollRecord, Meeting, ProcurementOrder, Supplier
} from './types';

const INITIAL_BUSINESSES: Business[] = [
  { id: 'b1', name: 'The Yard on Herschel', prefix: 'TY', primaryColor: '#AF431D', accentColor: '#E9C891', themeBg: '#F4F2F0', sector: Sector.THE_YARD },
  { id: 'b2', name: 'Sunday Theory', prefix: 'ST', primaryColor: '#8B8635', accentColor: '#E9C891', themeBg: '#F2F1ED', sector: Sector.SUNDAY_THEORY },
  { id: 'h1', name: 'The THIRD Space', prefix: 'T3S', primaryColor: '#28374a', accentColor: '#E2E8F0', themeBg: '#F8FAFC', sector: Sector.HOTEL }
];

const INITIAL_ROOMS: Room[] = [
  { id: 'r1', roomNumber: '101', type: 'The Nest', floor: 1, status: 'vacant-clean', isVipRoom: false, miniBarStatus: 'full' },
  { id: 'r2', roomNumber: '102', type: 'The Haven', floor: 1, status: 'vacant-clean', isVipRoom: false, miniBarStatus: 'full' },
  { id: 'r3', roomNumber: '201', type: 'The Residence', floor: 2, status: 'vacant-clean', isVipRoom: true, miniBarStatus: 'full' },
  { id: 'r4', roomNumber: '404', type: 'The Sanctuary', floor: 2, status: 'vacant-clean', isVipRoom: true, miniBarStatus: 'full' },
];

const INITIAL_TEAM: TeamMember[] = [
  { 
    id: 'u1', name: 'Alex Herschel', email: 'alex@theyard.com', role: UserRole.OWNER, 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', 
    status: PresenceStatus.AT_DESK, context: 'b1', pin: '1234', defaultContext: 'b1',
    responsibilities: Object.values(Responsibility), baseHourlyRate: 250, overtimeMultiplier: 1.5, overtimeThreshold: 40,
    birthday: '09-24', assignedSector: Sector.THE_YARD, assignedBusinesses: ['b1', 'b2', 'h1'],
    payType: 'monthly',
    hoursPerWeek: 40,
    keyRoles: 'Strategic Director, Executive Owner'
  }
];

const getPersistentData = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null || saved === 'undefined' || saved === 'null') return defaultValue;
    return JSON.parse(saved);
  } catch (e) { return defaultValue; }
};

const App: React.FC = () => {
  const [businesses] = useState<Business[]>(() => getPersistentData('trk_biz', INITIAL_BUSINESSES));
  const [team, setTeam] = useState<TeamMember[]>(() => getPersistentData('trk_team', INITIAL_TEAM));
  const [user, setUser] = useState<TeamMember>(() => getPersistentData('trk_user', INITIAL_TEAM[0]));
  const [appMode, setAppMode] = useState<AppMode>(() => getPersistentData('trk_mode', AppMode.TRACKLY));
  const [activeTab, setActiveTab] = useState(() => getPersistentData('trk_tab', 'dashboard')); 
  const [context, setContext] = useState<ProjectContext>(() => getPersistentData('trk_ctx', 'b1'));
  const [activeSector, setActiveSector] = useState<Sector>(() => getPersistentData('trk_sector', Sector.THE_YARD));
  
  const [pendingSetupSignal, setPendingSetupSignal] = useState<CrossDomainSignal | null>(null);

  const [tasks, setTasks] = useState<Task[]>(() => getPersistentData('trk_tasks', []));
  const [events, setEvents] = useState<Event[]>(() => getPersistentData('trk_events', []));
  const [orders, setOrders] = useState<Order[]>(() => getPersistentData('trk_orders', []));
  const [shifts, setShifts] = useState<Shift[]>(() => getPersistentData('trk_shifts', []));
  const [procurement, setProcurement] = useState<ProcurementOrder[]>(() => getPersistentData('trk_procure', []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getPersistentData('trk_suppliers', []));
  const [feedback, setFeedback] = useState<Feedback[]>(() => getPersistentData('trk_feedback', []));
  const [signals, setSignals] = useState<CrossDomainSignal[]>(() => getPersistentData('trk_signals', []));
  const [rooms, setRooms] = useState<Room[]>(() => getPersistentData('trk_rooms', INITIAL_ROOMS));
  const [bookings, setBookings] = useState<Booking[]>(() => getPersistentData('trk_bookings', []));
  const [hkTasks, setHkTasks] = useState<HousekeepingTask[]>(() => getPersistentData('trk_hk', []));
  const [maintTickets, setMaintTickets] = useState<MaintenanceTicket[]>(() => getPersistentData('trk_maint', []));
  const [vipProtocols, setVipProtocols] = useState<VipResidencyProtocol[]>(() => getPersistentData('trk_vip_res', []));
  const [incidents, setIncidents] = useState<IncidentReport[]>(() => getPersistentData('trk_incidents', []));
  const [menu, setMenu] = useState<MenuItem[]>(() => getPersistentData('trk_menu', []));
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => getPersistentData('trk_social', []));
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => getPersistentData('trk_payroll', []));
  const [meetings, setMeetings] = useState<Meeting[]>(() => getPersistentData('trk_meetings', []));

  useEffect(() => {
    const biz = businesses.find(b => b.sector === activeSector);
    if (biz) {
      document.documentElement.style.setProperty('--brand-primary', biz.primaryColor);
      document.documentElement.style.setProperty('--brand-accent', biz.accentColor);
      document.documentElement.style.setProperty('--brand-bg', biz.themeBg);
      
      if (activeSector === Sector.THE_YARD) {
          document.documentElement.style.setProperty('--brand-hospitality-gradient', 'linear-gradient(135deg, #AF431D 0%, #7d2f14 100%)');
      } else if (activeSector === Sector.SUNDAY_THEORY) {
          document.documentElement.style.setProperty('--brand-hospitality-gradient', 'linear-gradient(135deg, #8B8635 0%, #5e5a24 100%)');
      } else {
          document.documentElement.style.removeProperty('--brand-hospitality-gradient');
      }
    }
  }, [activeSector, businesses]);

  useEffect(() => {
    const dataMap = { 
      trk_team: team, trk_user: user, trk_mode: appMode, trk_tab: activeTab, trk_ctx: context, trk_sector: activeSector, 
      trk_tasks: tasks, trk_events: events, trk_orders: orders, trk_signals: signals,
      trk_rooms: rooms, trk_bookings: bookings, trk_hk: hkTasks, trk_maint: maintTickets, 
      trk_vip_res: vipProtocols, trk_incidents: incidents, trk_menu: menu, trk_shifts: shifts,
      trk_social: socialLinks, trk_payroll: payrollRecords, trk_feedback: feedback, trk_meetings: meetings,
      trk_procure: procurement, trk_suppliers: suppliers
    };
    Object.entries(dataMap).forEach(([key, val]) => localStorage.setItem(key, JSON.stringify(val)));
  }, [team, user, appMode, activeTab, context, activeSector, tasks, events, orders, signals, rooms, bookings, hkTasks, maintTickets, vipProtocols, incidents, menu, shifts, socialLinks, payrollRecords, feedback, meetings, procurement, suppliers]);

  const activeSectorBusinessIds = useMemo(() => {
    return businesses.filter(b => b.sector === activeSector).map(b => b.id);
  }, [activeSector, businesses]);

  const contextTeam = useMemo(() => team.filter(m => 
    m.role === UserRole.OWNER || m.assignedBusinesses.some(bid => activeSectorBusinessIds.includes(bid))
  ), [team, activeSectorBusinessIds]);

  const sectorShifts = useMemo(() => shifts.filter(s => activeSectorBusinessIds.includes(s.context)), [shifts, activeSectorBusinessIds]);
  const sectorTasks = useMemo(() => tasks.filter(t => activeSectorBusinessIds.includes(t.context)), [tasks, activeSectorBusinessIds]);
  const sectorEvents = useMemo(() => events.filter(e => activeSectorBusinessIds.includes(e.context)), [events, activeSectorBusinessIds]);
  const sectorMeetings = useMemo(() => meetings.filter(m => activeSectorBusinessIds.includes(m.context)), [meetings, activeSectorBusinessIds]);
  const sectorProcurement = useMemo(() => procurement.filter(p => activeSectorBusinessIds.includes(p.context)), [procurement, activeSectorBusinessIds]);
  const sectorFeedback = useMemo(() => feedback.filter(f => activeSectorBusinessIds.includes(context)), [feedback, activeSectorBusinessIds, context]);
  
  const sectorPayroll = useMemo(() => payrollRecords.filter(pr => {
    const member = team.find(t => t.id === pr.memberId);
    return member?.assignedBusinesses.some(bid => activeSectorBusinessIds.includes(bid));
  }), [payrollRecords, team, activeSectorBusinessIds]);

  const activeBusiness = businesses.find(b => b.sector === activeSector)!;
  const hospitalityStyleBusinesses = businesses.filter(b => b.sector === Sector.THE_YARD || b.sector === Sector.SUNDAY_THEORY);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'progress'>) => {
    setTasks(prev => [...prev, { ...taskData, id: `t-${Date.now()}`, progress: 0 } as Task]);
  };

  const handleHospitalityEventCreation = (eventData: any) => {
    const newEvent = {...eventData, id: `ev-${Date.now()}`} as Event;
    setEvents(prev => [newEvent, ...prev]); 

    if (newEvent.performers && newEvent.performers.length > 0) {
      const stayRequired = newEvent.performers.filter(p => p.needsAccommodation);
      stayRequired.forEach(performer => {
        const signal: CrossDomainSignal = {
          id: `sig-${Date.now()}-${performer.id}`,
          sourceSector: activeSector,
          targetSector: Sector.HOTEL,
          type: 'artist-booking',
          acknowledged: false,
          payload: {
            artistName: performer.name,
            eventDate: newEvent.date,
            rider: performer.rider || ['Artist Preferred Water', 'Premium Fruit Platter'], 
            sourceBrand: activeBusiness.name, 
            managementEmail: performer.managementEmail,
            managementPhone: performer.managementPhone
          }
        };
        setSignals(prev => [...prev, signal]);
      });
    }
    setActiveTab('events');
  };

  const handleAddVipProtocol = (protocol: Partial<VipResidencyProtocol>) => {
    const newProtocol = { ...protocol, id: `vip-p-${Date.now()}` } as VipResidencyProtocol;
    setVipProtocols(prev => [...prev, newProtocol]);
  };

  const handleAddBooking = (booking: Partial<Booking>) => {
    setBookings(prev => [...prev, { ...booking, id: `bk-${Date.now()}` } as Booking]);
  };

  const handleSignalAuthFromDashboard = (id: string) => {
    const sig = signals.find(s => s.id === id);
    if (sig) {
        setPendingSetupSignal(sig);
        setActiveTab('vip-residency');
    }
  };

  const renderContent = () => {
    if (appMode === AppMode.POS) {
       switch (activeTab) {
          case 'kds': return <KitchenDisplay orders={orders} onCompleteOrder={(id, s) => setOrders(prev => prev.map(o => o.id === id ? {...o, [s === 'kitchen' ? 'kitchenStatus' : 'barStatus']: 'ready'} : o))} onCollectOrder={(id, s) => setOrders(prev => prev.map(o => o.id === id ? {...o, [s === 'kitchen' ? 'kitchenCollected' : 'barCollected']: true} : o))} />;
          case 'bills': return <BillModule orders={orders} context={context} activeBusiness={activeBusiness} onUpdateStatus={(id, s, pm) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: s, paymentMethod: pm} : o))} />;
          case 'menu-manager': return <MenuManagementModule menu={menu} context={context} onAdd={(m) => setMenu(prev => [...prev, {...m, id: `m-${Date.now()}`} as MenuItem])} onUpdate={(id, u) => setMenu(prev => prev.map(m => m.id === id ? {...m, ...u} : m))} onDelete={(id) => setMenu(prev => prev.filter(m => m.id !== id))} />;
          default: return <POSModule menu={menu} context={context} activeBusiness={activeBusiness} onPlaceOrder={(o) => setOrders(prev => [...prev, {...o, id: `ord-${Date.now()}`, timestamp: new Date().toISOString(), serverName: user.name} as Order])} orders={orders} />;
       }
    }

    if (activeSector === Sector.HOTEL) {
      switch (activeTab) {
        case 'inventory': return <HotelOpsModule rooms={rooms} team={contextTeam} onUpdateRoom={(id, u) => setRooms(prev => prev.map(r => r.id === id ? {...r, ...u} : r))} onAddRoom={(r) => setRooms(prev => [...prev, {...r, id: `r-${Date.now()}`} as Room])} user={user} />;
        case 'guest-management': return <HotelGuestModule bookings={bookings} rooms={rooms} signals={signals} onAckSignal={(id) => setSignals(prev => prev.map(s => s.id === id ? {...s, acknowledged: true} : s))} onAddBooking={handleAddBooking} onUpdateBooking={(id, u) => { setBookings(prev => prev.map(b => b.id === id ? {...b, ...u} : b)); if(u.roomId) setRooms(prev => prev.map(r => r.id === u.roomId ? {...r, status: 'occupied'} : r)); }} onDeleteBooking={(id) => setBookings(prev => prev.filter(b => b.id !== id))} />;
        case 'housekeeping': return <HotelHousekeepingModule rooms={rooms} tasks={hkTasks} team={contextTeam} onUpdateRoom={(id, s) => setRooms(prev => prev.map(r => r.id === id ? {...r, status: s} : r))} onAddTask={(t) => setHkTasks(prev => [...prev, {...t, id: `hk-${Date.now()}`} as HousekeepingTask])} onUpdateTask={(id, u) => setHkTasks(prev => prev.map(t => t.id === id ? {...t, ...u} : t))} />;
        case 'facilities': return <HotelFacilitiesModule tickets={maintTickets} onAddTicket={(t) => setMaintTickets(prev => [...prev, {...t, id: `maint-${Date.now()}`} as MaintenanceTicket])} onUpdateStatus={(id, s) => setMaintTickets(prev => prev.map(t => t.id === id ? {...t, status: s} : t))} />;
        case 'hotel-dining': return <HotelDiningModule bookings={bookings} context={context} orders={orders} onAddOrder={(o) => setOrders(prev => [...prev, {...o, id: `ord-${Date.now()}`} as Order])} />;
        case 'vip-residency': return <HotelVipModule protocols={vipProtocols} rooms={rooms} team={contextTeam} signals={signals} onAddProtocol={handleAddVipProtocol} onAddBooking={handleAddBooking} onAckSignal={(id) => setSignals(prev => prev.map(s => s.id === id ? {...s, acknowledged: true} : s))} onAddTask={handleAddTask} pendingSignal={pendingSetupSignal} onClearPendingSignal={() => setPendingSetupSignal(null)} />;
        case 'staff': return <PresenceHub team={contextTeam} user={user} businesses={businesses} activeBusiness={activeBusiness} onAddMember={(m) => setTeam(prev => [...prev, {...m, id: `u-${Date.now()}`, status: PresenceStatus.AT_DESK} as TeamMember])} onUpdateMember={(id, u) => { setTeam(prev => prev.map(m => m.id === id ? {...m, ...u} : m)); if(id === user.id) setUser(prev => ({...prev, ...u})); }} onDeleteMember={(id) => setTeam(prev => prev.filter(m => m.id !== id))} />;
        case 'tasks': return <TaskBoard tasks={sectorTasks} team={contextTeam} events={sectorEvents} menu={menu} shifts={sectorShifts} context={context} activeSector={activeSector} businesses={businesses} user={user} onAddTask={handleAddTask} onUpdateTask={(id, u) => setTasks(prev => prev.map(t => t.id === id ? {...t, ...u} : t))} onDeleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))} onUpdateStatus={(id, s) => setTasks(prev => prev.map(t => t.id === id ? {...t, status: s} : t))} onUpdatePresence={(s, e) => { const u = {status: s, statusExpiresAt: e}; setUser(prev => ({...prev, ...u})); setTeam(prev => prev.map(m => m.id === user.id ? {...m, ...u} : m)); }} />;
        case 'calendar': return <CalendarModule events={sectorEvents} meetings={sectorMeetings} team={contextTeam} context={context} onAddMeeting={(m) => setMeetings(prev => [...prev, {...m, id: `mt-${Date.now()}`} as Meeting])} onUpdateMeeting={(id, u) => setMeetings(prev => prev.map(m => m.id === id ? {...m, ...u} : m))} onDeleteMeeting={(id) => setMeetings(prev => prev.filter(m => m.id !== id))} onJoinMeeting={() => {}} />;
        case 'meeting-hub': return <MeetingHub meetings={sectorMeetings} team={contextTeam} currentUser={user} context={context} onAddMeeting={(m) => setMeetings(prev => [...prev, {...m, id: `mt-${Date.now()}`} as Meeting])} />;
        case 'deliveries': return <ProcurementModule orders={sectorProcurement} suppliers={suppliers} team={contextTeam} events={sectorEvents} menu={menu} context={context} activeSector={activeSector} businesses={businesses} currentUser={user} onUpdateOrderStatus={(id, s) => setProcurement(prev => prev.map(o => o.id === id ? {...o, status: s} : o))} onAddOrder={(o) => setProcurement(prev => [...prev, {...o, id: `po-${Date.now()}`} as ProcurementOrder])} onAddSupplier={(s) => setSuppliers(prev => [...prev, {...s, id: `sup-${Date.now()}`} as Supplier])} onUpdateSupplier={(id, u) => setSuppliers(prev => prev.map(s => s.id === id ? {...s, ...u} : s))} onDeleteSupplier={(id) => setSuppliers(prev => prev.filter(s => s.id !== id))} />;
        case 'insights': return <InsightsModule context={context} feedback={sectorFeedback} activeSector={activeSector} businesses={businesses} />;
        case 'social-intel': return <SocialIntelModule links={socialLinks} context={context} onAddLink={(l) => setSocialLinks(prev => [...prev, {...l, id: `sl-${Date.now()}`} as SocialLink])} onDeleteLink={(id) => setSocialLinks(prev => prev.filter(l => l.id !== id))} onInjectTasks={(ts) => setTasks(prev => [...prev, ...ts])} onInjectFeedback={(fs) => setFeedback(prev => [...prev, ...fs])} />;
        case 'payroll': return <PayrollModule team={contextTeam} shifts={sectorShifts} payrollRecords={sectorPayroll} context={context} activeSector={activeSector} businesses={businesses} onUpdateMemberPay={(id, u) => setTeam(prev => prev.map(t => t.id === id ? {...t, ...u} : t))} onProcessCycle={(recs) => setPayrollRecords(prev => [...prev, ...recs])} />;
        case 'reports': return <ReportsModule orders={orders} procurement={sectorProcurement} payroll={sectorPayroll} feedback={sectorFeedback} socialLinks={socialLinks} context={context} activeSector={activeSector} businesses={businesses} />;
        case 'shifts': return <ShiftPlanner shifts={sectorShifts} team={contextTeam} activeSector={activeSector} businesses={hospitalityStyleBusinesses} currentUser={user} onAddShift={(s) => setShifts(prev => [...prev, {...s, id: `s-${Date.now()}`} as Shift])} onUpdateShift={(id, u) => setShifts(prev => prev.map(s => s.id === id ? {...s, ...u} : s))} onDeleteShift={(id) => setShifts(prev => prev.filter(s => s.id !== id))} />;
        case 'break': return <BreakLockout workTimeInMinutes={0} maxWorkTime={240} showDashboard={true} />;
        default: return <HotelDashboard rooms={rooms} bookings={bookings} tickets={maintTickets} incidents={incidents} signals={signals} onAckSignal={handleSignalAuthFromDashboard} />;
      }
    }

    // UNIFIED HOSPITALITY VIEWS (The Yard & Sunday Theory)
    switch (activeTab) {
      case 'execution': return <EventExecutionModule events={sectorEvents} context={context} currentUser={user} onUpdateChecklist={(eid, tid, s) => setEvents(prev => prev.map(e => e.id === eid ? {...e, checklists: e.checklists.map(c => c.id === tid ? {...c, status: s} : c)} : e))} onSignBrief={(eid, type, sig) => setEvents(prev => prev.map(e => e.id === eid ? {...e, briefs: {...e.briefs, signatures: {...e.briefs?.signatures, [type]: sig}}} : e))} />;
      case 'tasks': return <TaskBoard tasks={sectorTasks} team={contextTeam} events={sectorEvents} menu={menu} shifts={sectorShifts} context={context} activeSector={activeSector} businesses={businesses} user={user} onAddTask={handleAddTask} onUpdateTask={(id, u) => setTasks(prev => prev.map(t => t.id === id ? {...t, ...u} : t))} onDeleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))} onUpdateStatus={(id, s) => setTasks(prev => prev.map(t => t.id === id ? {...t, status: s} : t))} onUpdatePresence={(s, e) => { const u = {status: s, statusExpiresAt: e}; setUser(prev => ({...prev, ...u})); setTeam(prev => prev.map(m => m.id === user.id ? {...m, ...u} : m)); }} />;
      case 'deliveries': return <ProcurementModule orders={sectorProcurement} suppliers={suppliers} team={contextTeam} events={sectorEvents} menu={menu} context={context} activeSector={activeSector} businesses={businesses} currentUser={user} onUpdateOrderStatus={(id, s) => setProcurement(prev => prev.map(o => o.id === id ? {...o, status: s} : o))} onAddOrder={(o) => setProcurement(prev => [...prev, {...o, id: `po-${Date.now()}`} as ProcurementOrder])} onAddSupplier={(s) => setSuppliers(prev => [...prev, {...s, id: `sup-${Date.now()}`} as Supplier])} onUpdateSupplier={(id, u) => setSuppliers(prev => prev.map(s => s.id === id ? {...s, ...u} : s))} onDeleteSupplier={(id) => setSuppliers(prev => prev.filter(s => s.id !== id))} />;
      case 'ticketing': return <TicketingModule events={sectorEvents} context={context} />;
      case 'events': return <EventModule events={sectorEvents} currentUser={user} shifts={sectorShifts} team={contextTeam} context={context} activeBusiness={activeBusiness} businesses={hospitalityStyleBusinesses} onUpdateEvent={(id, u) => setEvents(prev => prev.map(e => e.id === id ? {...e, ...u} : e))} onEdit={() => {}} onDelete={(id) => setEvents(prev => prev.filter(e => e.id !== id))} onCreateNew={() => setActiveTab('create-event')} />;
      case 'meeting-hub': return <MeetingHub meetings={sectorMeetings} team={contextTeam} currentUser={user} context={context} onAddMeeting={(m) => setMeetings(prev => [...prev, {...m, id: `mt-${Date.now()}`} as Meeting])} />;
      case 'calendar': return <CalendarModule events={sectorEvents} meetings={sectorMeetings} team={contextTeam} context={context} onAddMeeting={(m) => setMeetings(prev => [...prev, {...m, id: `mt-${Date.now()}`} as Meeting])} onUpdateMeeting={(id, u) => setMeetings(prev => prev.map(m => m.id === id ? {...m, ...u} : m))} onDeleteMeeting={(id) => setMeetings(prev => prev.filter(m => m.id !== id))} onJoinMeeting={() => {}} />;
      case 'insights': return <InsightsModule context={context} feedback={sectorFeedback} activeSector={activeSector} businesses={businesses} />;
      case 'staff': return <PresenceHub team={contextTeam} user={user} businesses={businesses} activeBusiness={activeBusiness} onAddMember={(m) => setTeam(prev => [...prev, {...m, id: `u-${Date.now()}`, status: PresenceStatus.AT_DESK} as TeamMember])} onUpdateMember={(id, u) => { setTeam(prev => prev.map(m => m.id === id ? {...m, ...u} : m)); if(id === user.id) setUser(prev => ({...prev, ...u})); }} onDeleteMember={(id) => setTeam(prev => prev.filter(m => m.id !== id))} />;
      case 'payroll': return <PayrollModule team={contextTeam} shifts={sectorShifts} payrollRecords={sectorPayroll} context={context} activeSector={activeSector} businesses={businesses} onUpdateMemberPay={(id, u) => setTeam(prev => prev.map(t => t.id === id ? {...t, ...u} : t))} onProcessCycle={(recs) => setPayrollRecords(prev => [...prev, ...recs])} />;
      case 'reports': return <ReportsModule orders={orders} procurement={sectorProcurement} payroll={sectorPayroll} feedback={sectorFeedback} socialLinks={socialLinks} context={context} activeSector={activeSector} businesses={businesses} />;
      case 'social-intel': return <SocialIntelModule links={socialLinks} context={context} onAddLink={(l) => setSocialLinks(prev => [...prev, {...l, id: `sl-${Date.now()}`} as SocialLink])} onDeleteLink={(id) => setSocialLinks(prev => prev.filter(l => l.id !== id))} onInjectTasks={(ts) => setTasks(prev => [...prev, ...ts])} onInjectFeedback={(fs) => setFeedback(prev => [...prev, ...fs])} />;
      case 'shifts': return <ShiftPlanner shifts={sectorShifts} team={contextTeam} activeSector={activeSector} businesses={hospitalityStyleBusinesses} currentUser={user} onAddShift={(s) => setShifts(prev => [...prev, {...s, id: `s-${Date.now()}`} as Shift])} onUpdateShift={(id, u) => setShifts(prev => prev.map(s => s.id === id ? {...s, ...u} : s))} onDeleteShift={(id) => setShifts(prev => prev.filter(s => s.id !== id))} />;
      case 'break': return <BreakLockout workTimeInMinutes={0} maxWorkTime={240} showDashboard={true} />;
      case 'create-event': return <NewEventForm context={context} activeBusiness={activeBusiness} businesses={hospitalityStyleBusinesses} menu={menu} onSave={handleHospitalityEventCreation} onCancel={() => setActiveTab('events')} />;
      default: return <Dashboard tasks={sectorTasks} emails={[]} team={contextTeam} events={sectorEvents} procurement={sectorProcurement} user={user} setActiveTab={setActiveTab} businesses={hospitalityStyleBusinesses} />;
    }
  };

  return (
    <div className="min-h-screen flex theme-transition bg-brand-bg">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} appMode={appMode} setAppMode={setAppMode} 
        context={context} setContext={setContext} user={user} activeSector={activeSector} 
        onSectorChange={(s) => { setActiveSector(s); const fb = businesses.find(b => b.sector === s); if(fb) setContext(fb.id); setActiveTab('dashboard'); }}
        businesses={businesses}
      />
      <main className="flex-1 md:ml-20 min-h-screen relative flex flex-col pt-16 md:pt-0">
        <header className={`sticky top-0 z-30 transition-all duration-700 border-b border-white/20 px-8 py-4 flex items-center justify-between ${activeSector === Sector.HOTEL ? 'bg-white/80 backdrop-blur-lg' : 'bg-brand-hospitality-gradient'}`}>
           <div className={activeSector !== Sector.HOTEL ? 'text-white' : ''}>
             <p className="text-[8px] font-black opacity-60 uppercase tracking-widest leading-none mb-1">2026 Sector Domain: {activeSector.replace('-', ' ')}</p>
             <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none">{activeBusiness.name}</h2>
           </div>
           <div className="flex items-center gap-3 bg-white/95 backdrop-blur pl-4 pr-1.5 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
             <div className="text-right">
               <p className="text-[9px] font-black text-slate-800 uppercase mb-1">{user.name}</p>
               <p className="text-[7px] font-bold text-brand-primary uppercase tracking-tighter leading-none">{user.role}</p>
             </div>
             <div className="h-8 w-8 rounded-xl border-2 border-brand-primary overflow-hidden shadow-sm">
               <img src={user.avatar} className="h-full w-full object-cover" alt="" />
             </div>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
