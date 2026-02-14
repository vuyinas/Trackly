
export interface VipResidencyProtocol {
  id: string;
  artistId: string;
  rider: string[];
  securityRequired: boolean;
  transportSchedule: { time: string; from: string; to: string }[];
  privacyNotes: string;
  hospitalityGifting: string[];
  entourageSize: number;
  assignedRoomNumber?: string;
}

export enum Sector {
  THE_YARD = 'the-yard',
  SUNDAY_THEORY = 'sunday-theory',
  HOTEL = 'hotel'
}

export enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  SERVER = 'server',
  KITCHEN = 'kitchen',
  BAR = 'bar',
  HOUSEKEEPING = 'housekeeping',
  SECURITY = 'security'
}

export enum AppMode {
  TRACKLY = 'trackly',
  POS = 'pos'
}

export type ProjectContext = string;

export interface Business {
  id: string;
  name: string;
  prefix: string;
  primaryColor: string;
  accentColor: string;
  themeBg: string;
  sector: Sector;
}

export enum PresenceStatus {
  AT_DESK = 'at-desk',
  LUNCH = 'lunch',
  MEETING = 'meeting',
  OUT_OF_OFFICE = 'out-of-office',
  LEAVE = 'leave',
  ON_SHIFT = 'on-shift',
  FOCUS = 'focus'
}

export enum Responsibility {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  CALENDAR = 'calendar',
  MEETINGS = 'meetings',
  DELIVERIES = 'deliveries',
  EVENTS = 'events',
  INSIGHTS = 'insights',
  SOCIAL = 'social',
  STAFF = 'staff',
  PAYROLL = 'payroll',
  REPORTS = 'reports',
  SHIFTS = 'shifts',
  EXECUTION = 'execution',
  TICKETING = 'ticketing',
  INVENTORY = 'inventory',
  GUEST_LEDGER = 'guest-ledger',
  HOUSEKEEPING = 'housekeeping',
  VIP = 'vip',
  DINING = 'dining',
  FACILITIES = 'facilities'
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: PresenceStatus;
  context: ProjectContext;
  pin: string;
  defaultContext: ProjectContext;
  responsibilities: Responsibility[];
  baseHourlyRate: number;
  payType: 'hourly' | 'monthly';
  hoursPerWeek: number;
  keyRoles: string;
  overtimeMultiplier: number;
  overtimeThreshold: number;
  birthday: string;
  assignedSector: Sector;
  assignedBusinesses: string[];
  statusExpiresAt?: string;
}

export type UserProfile = TeamMember;

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  DONE = 'done'
}

export enum TaskCategory {
  OPS = 'ops',
  MARKETING = 'marketing',
  MAINTENANCE = 'maintenance'
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignees: string[];
  dueDate: string;
  priority: TaskPriority;
  category: TaskCategory;
  isRecurring: boolean;
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly';
  context: ProjectContext;
  progress: number;
  completedAt?: string;
  completedBy?: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  isResponded: boolean;
  content: string;
}

export enum ShiftType {
  PREP = 'prep',
  OPENING = 'opening',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  EVENT = 'event',
  CLOSING = 'closing',
  SECURITY = 'security',
  FRONT_DESK = 'front-desk',
  BREAKFAST = 'breakfast',
  HOUSEKEEPING = 'housekeeping',
  KITCHEN = 'kitchen'
}

export interface Shift {
  id: string;
  memberId: string;
  location: string;
  types: ShiftType[];
  startTime: string;
  endTime: string;
  context: ProjectContext;
  requiresTransport: boolean;
  transportRegion?: string;
  status: 'active' | 'pending-approval';
  source: 'manual' | 'ai';
  approvedBy?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  context: ProjectContext;
  stock: number;
  isHubbly?: boolean;
  availableToStaff?: boolean;
  variants?: string[];
}

export interface OrderItem extends MenuItem {
  quantity: number;
  isStaffMeal?: boolean;
  selectedVariant?: string;
  modifiers?: string[];
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid';
  timestamp: string;
  context: ProjectContext;
  serverName: string;
  isStaffOrder?: boolean;
  paymentMethod?: 'cash' | 'card';
  kitchenStatus?: 'pending' | 'ready';
  barStatus?: 'pending' | 'ready';
  kitchenCollected?: boolean;
  barCollected?: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  sold: number;
  capacity: number;
}

export interface Performer {
  id: string;
  name: string;
  role: string;
  arrivalTime: string;
  performanceStartTime: string;
  performanceEndTime: string;
  rider: string[];
  contact: string;
  needsAccommodation: boolean;
  managementEmail?: string;
  managementPhone?: string;
}

export enum ChecklistCategory {
  PRE_EVENT = 'pre-event',
  DURING_EVENT = 'during-event',
  POST_EVENT = 'post-event'
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: ChecklistCategory;
  department: 'kitchen' | 'bar' | 'office' | 'management';
  assignedRole: UserRole | 'all';
  priority: string;
  targetTime: string;
  status: 'todo' | 'in-progress' | 'done';
  autoGenerated?: boolean;
}

export interface BriefSignature {
  userId: string;
  userName: string;
  signedAt: string;
}

export interface EventBriefs {
  kitchen?: string;
  bar?: string;
  office?: string;
  management?: string;
  signatures?: {
    kitchen?: BriefSignature;
    bar?: BriefSignature;
    office?: BriefSignature;
    management?: BriefSignature;
  };
}

export type OccasionType = 'Birthday' | 'Anniversary' | 'Engagement' | 'Honeymoon' | 'Celebration' | 'Other' | 'None';
export type CorporateType = 'Strategy' | 'Social' | 'Product Launch' | 'Other';

export interface FAndBDetails {
  menuType: 'Buffet' | 'A La Carte';
  billingStrategy: 'Individual Bills' | 'Consolidated';
  budgetAmount: number;
  dietaries: string;
  serviceTimeline: {
    starters: string;
    mains: string;
    desserts: string;
  };
}

export interface Event {
  id: string;
  name: string;
  type: 'Performance' | 'Table Reservation' | 'Celebration' | 'Corporate Event' | 'Themed Night';
  date: string;
  startTime: string;
  endTime: string;
  expectedAttendance: number;
  location: string;
  context: ProjectContext;
  performers?: Performer[];
  isTicketed: boolean;
  ticketing?: {
    tickets: TicketType[];
    historicalShowRate: number;
    walkInEstimate: number;
  };
  checklists: ChecklistItem[];
  briefs?: EventBriefs;
  suggestions?: string[];
  leadGuest?: {
    name: string;
    email: string;
    phone: string;
    internalTable: string;
    occasion: OccasionType;
    corporateType: CorporateType;
    dessertWording: string;
    fAndB: FAndBDetails;
  };
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface AgendaItem {
  timeBlock: string;
  objective: string;
  detail: string;
  responsible: string;
}

export interface HiddenConsideration {
  category: string;
  item: string;
  note: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  engagementType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  attendees: string[];
  agenda?: AgendaItem[];
  considerations?: HiddenConsideration[];
  type: 'meeting' | 'break' | 'wellness';
  context: ProjectContext;
  joinToken?: string;
  notes?: string;
  liveNotes?: string[];
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export enum DeliveryCategory {
  KITCHEN = 'kitchen',
  BAR = 'bar',
  OFFICE = 'office'
}

export interface OrderLineItem {
  name: string;
  quantity: number;
  unit: string;
  currentStock: number;
  suggestedQty: number;
  priceAtOrder: number;
}

export interface ProcurementOrder {
  id: string;
  supplierId: string;
  category: DeliveryCategory;
  dispatchDate: string;
  expectedDate: string;
  expectedTime: string;
  items: OrderLineItem[];
  deliveryFee: number;
  totalCost: number;
  status: 'pending' | 'ordered' | 'delayed' | 'delivered';
  context: ProjectContext;
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: DeliveryCategory;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  reliability: number;
  avgLeadTime: string;
  catalog: {
    id: string;
    name: string;
    price: number;
    unit: string;
  }[];
}

export interface Feedback {
  id: string;
  source: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  comment: string;
  handle: string;
  resolved: boolean;
  timestamp: string;
  isPhysicalFeedback?: boolean;
}

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
  WEBSITE = 'website'
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  followers?: number;
  postsCount?: number;
  topPosts?: {
    title: string;
    reach: number;
    engagement: number;
  }[];
}

export interface PayrollRecord {
  id: string;
  memberId: string;
  periodStart: string;
  periodEnd: string;
  standardHours: number;
  overtimeHours: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'pending' | 'paid';
}

export type RoomStatusType = 'vacant-clean' | 'vacant-dirty' | 'occupied' | 'maintenance' | 'blocker';

export interface Room {
  id: string;
  roomNumber: string;
  type: 'The Nest' | 'The Haven' | 'The Residence' | 'The Sanctuary';
  floor: number;
  status: RoomStatusType;
  isVipRoom: boolean;
  miniBarStatus: 'full' | 'low' | 'empty';
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  pax: number;
  source: string;
  isVip: boolean;
  dietaryNotes: string;
  specialRequests: string;
  hasBreakfast: boolean;
  hasDinner: boolean;
  occasion: OccasionType;
  roomId?: string;
  internalTable?: string;
  welcomePackAssigned?: boolean;
  paymentStatus?: 'pending' | 'paid';
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  assignedTo: string;
  type: 'stay-over' | 'check-out' | 'deep-clean';
  status: 'pending' | 'in-progress' | 'inspected';
  checklist?: string[];
  brief?: string;
  startTime?: string;
  endTime?: string;
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'pool' | 'garden' | 'general';
  priority: TaskPriority;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  isRecurring: boolean;
}

export interface IncidentReport {
  id: string;
  type: string;
  description: string;
  status: 'open' | 'resolved';
  timestamp: string;
}

export interface CrossDomainSignal {
  id: string;
  sourceSector: Sector;
  targetSector: Sector;
  type: 'artist-booking';
  acknowledged: boolean;
  payload: {
    artistName: string;
    eventDate: string;
    rider?: string[];
    sourceBrand?: string;
    managementEmail?: string;
    managementPhone?: string;
  };
}

export interface StockDelivery {
  id: string;
  item: string;
  supplier: string;
  expectedAt: string;
  category: DeliveryCategory;
  status: 'pending' | 'received' | 'delayed' | 'cancelled';
  context: ProjectContext;
  createdBy: string;
}
