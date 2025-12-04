
export enum TicketStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  VERIFIED = 'verified',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Keep enum for code references / default fallbacks, but data will drive UI
export enum TicketCategory {
  INTERNET = 'internet_issue',
  BILLING = 'billing',
  HARDWARE = 'hardware',
  INSTALLATION = 'installation',
  OTHER = 'other',
}

export interface TicketCategoryConfig {
  id: string;
  name: string;
  code: string;
  sla_hours: number;
  description: string;
  created_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  location?: string; // e.g., "HQ - Floor 2"
  manager_name?: string;
  created_at?: string;
}

export enum CustomerStatus {
  LEAD = 'lead', // New: Prospective customer
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending', // Pending Billing/Activation
  CANCELLED = 'cancelled',
}

export enum CustomerType {
  RESIDENTIAL = 'residential',
  CORPORATE = 'corporate',
}

export enum InstallationStatus {
  PENDING_SURVEY = 'pending_survey',
  SURVEY_COMPLETED = 'survey_completed',
  SURVEY_FAILED = 'survey_failed',
  SCHEDULED = 'scheduled',
  INSTALLED = 'installed',
}

export enum InvoiceStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  WARNING = 'warning',
  MAINTENANCE = 'maintenance',
}

export enum DeviceType {
  ROUTER = 'router',
  SWITCH = 'switch',
  OLT = 'olt',
  SERVER = 'server',
  CPE = 'cpe',
  OTHER = 'other',
}

export enum EmployeeRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPPORT = 'support',
  TECHNICIAN = 'technician',
  CUSTOMER = 'customer',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  download_speed: string;
  upload_speed: string;
  created_at: string;
}

export interface Customer {
  id: string; 
  name: string;
  email: string;
  phone: string; // Added
  
  // Identity
  type: CustomerType; // Residential vs Corporate
  identity_number?: string; // KTP / NPWP
  
  // Profile
  company?: string;
  address?: string;
  coordinates?: string; // Lat,Long
  
  // Technical / Infrastructure
  installation_status: InstallationStatus;
  odp_port?: string; // ODP-A-01/2
  survey_notes?: string;

  // Service
  subscription_plan?: string; 
  plan_id?: string; 
  account_status: CustomerStatus;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  phone?: string;
  department?: string;
  avatar_url?: string;
  // ISP Specific Enhancements
  identity_number?: string; // KTP
  address?: string;
  hire_date?: string; // ISO Date String
  certifications?: string; // Comma-separated list
  created_at: string;
}

export interface Ticket {
  id: string; 
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string; 
  created_at: string;
  customer_id?: string | null; 
  customer?: Customer;
  is_escalated?: boolean; 
  assigned_to?: string;
  due_date?: string;
  resolution_notes?: string;
  root_cause?: string; 
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  issued_date: string;
  due_date: string;
  description?: string; 
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  type: 'credit_card' | 'bank_transfer';
  last_four?: string;
  expiry_date?: string;
  bank_name?: string;
  is_default: boolean;
  created_at: string;
}

export interface NetworkInterface {
  id: string;
  device_id: string;
  name: string; // e.g. ether1, wlan0
  ip_address?: string;
  mac_address?: string;
  status: 'up' | 'down';
  type?: string; // e.g. ethernet, vlan, wifi
}

export interface NetworkDevice {
  id: string;
  customer_id?: string; 
  name: string;
  ip_address: string;
  type: DeviceType;
  status: DeviceStatus;
  location?: string;
  last_check: string;
  created_at: string;
  model?: string;
  serial_number?: string;
  firmware_version?: string;
  // New ISP Technical Fields
  mac_address?: string;
  vlan_id?: string;
  pppoe_username?: string;
  // Relationship
  interfaces?: NetworkInterface[];
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string; // Device, Cable, Accessory, Tool
  quantity: number;
  unit: string; // pcs, meters, box
  min_quantity: number;
  cost_price: number;
  location?: string; // Shelf A1, Van 2
  description?: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  device_name: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  source: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string; // e.g., Troubleshooting, Billing
  tags: string[]; // e.g., ["fiber", "slow-speed"]
  author_name: string;
  views: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subnet {
  id: string;
  name: string;
  cidr: string; // e.g. 192.168.1.0/24
  gateway?: string;
  vlan_id?: string;
  location?: string;
  description?: string;
  created_at: string;
}

export type TicketStats = {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  highPriority: number;
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  SYSTEM = 'system'
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: string; // e.g. 'Ticket', 'Customer', 'Device'
  entity_id?: string;
  details?: string;
  performed_by: string; // User Name or Email
  created_at: string;
}
