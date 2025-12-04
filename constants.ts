
// Supabase Configuration
// Note: In a production environment, these should be environment variables.
// However, per the user's request and prompt context, they are included here for the generated app to function immediately.

export const SUPABASE_URL = "https://ihqptcjerwcgwibxeyqc.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlocXB0Y2plcndjZ3dpYnhleXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTA4NTcsImV4cCI6MjA4MDIyNjg1N30.C0IHrSJ6qEcEKQGLNMUR8FVeAcq7Cava_HZrt39YtjA";

export const APP_NAME = "Cakramedia ISP Manager";

export const SETUP_SQL = `-- 0. Reset Schema (DROP ALL TABLES)
-- WARNING: This will delete all existing data!
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.ticket_comments CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.network_interfaces CASCADE;
DROP TABLE IF EXISTS public.network_devices CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.ticket_categories CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.network_alerts CASCADE;
DROP TABLE IF EXISTS public.knowledge_articles CASCADE;
DROP TABLE IF EXISTS public.subnets CASCADE;

-- 1. Create Plans Table
create table public.plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  download_speed text,
  upload_speed text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Ticket Categories Table
create table public.ticket_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,
  sla_hours int default 24 not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Departments Table
create table public.departments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  location text,
  manager_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Customers Table (ISP Enhanced)
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  
  -- Identity
  type text default 'residential' not null check (type in ('residential', 'corporate')),
  identity_number text, -- KTP or NPWP
  
  -- Profile
  company text,
  address text,
  coordinates text, -- lat,long
  
  -- Service
  subscription_plan text,
  plan_id uuid references public.plans(id) on delete set null,
  
  -- Statuses
  account_status text default 'lead' not null check (account_status in ('lead', 'active', 'suspended', 'pending', 'cancelled')),
  installation_status text default 'pending_survey' not null check (installation_status in ('pending_survey', 'survey_completed', 'survey_failed', 'scheduled', 'installed')),
  
  -- Technical
  odp_port text,
  survey_notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Tickets Table (ISP Enhanced with UUID)
create table public.tickets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'open' not null check (status in ('open', 'assigned', 'in_progress', 'resolved', 'verified', 'closed')),
  priority text default 'medium' not null check (priority in ('low', 'medium', 'high')),
  category text default 'internet_issue' not null, -- Dynamic category allowed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references public.customers(id) on delete set null,
  is_escalated boolean default false,
  assigned_to text,
  due_date timestamp with time zone,
  resolution_notes text,
  root_cause text
);

-- 6. Create Invoices Table
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) on delete cascade not null,
  invoice_number text not null,
  amount numeric not null,
  status text default 'pending' not null check (status in ('paid', 'pending', 'overdue', 'cancelled')),
  issued_date date default CURRENT_DATE not null,
  due_date date not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Payment Methods Table
create table public.payment_methods (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) on delete cascade not null,
  type text not null check (type in ('credit_card', 'bank_transfer')),
  last_four text,
  expiry_date text,
  bank_name text,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Ticket Comments Table
create table public.ticket_comments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  content text not null,
  author_name text default 'Support Agent',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create Network Devices Table
create table public.network_devices (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  ip_address text,
  type text not null,
  status text default 'online',
  location text,
  last_check timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  model text,
  serial_number text,
  firmware_version text,
  mac_address text,
  vlan_id text,
  pppoe_username text
);

-- 9b. Create Network Interfaces Table
create table public.network_interfaces (
  id uuid default gen_random_uuid() primary key,
  device_id uuid references public.network_devices(id) on delete cascade not null,
  name text not null,
  ip_address text,
  mac_address text,
  status text default 'up' check (status in ('up', 'down')),
  type text default 'ethernet',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Create Employees Table (ISP Enhanced)
create table public.employees (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  role text default 'support' not null check (role in ('admin', 'manager', 'support', 'technician')),
  status text default 'active' not null check (status in ('active', 'inactive', 'on_leave')),
  phone text,
  department text,
  avatar_url text,
  identity_number text,
  address text,
  hire_date date,
  certifications text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Create System Settings Table
create table public.system_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Create Inventory Items Table
create table public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  sku text not null,
  category text not null,
  quantity int default 0 not null,
  unit text default 'pcs',
  min_quantity int default 5,
  cost_price numeric default 0,
  location text,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Create Network Alerts Table
create table public.network_alerts (
  id uuid default gen_random_uuid() primary key,
  device_name text not null,
  severity text not null check (severity in ('critical', 'warning', 'info')),
  message text not null,
  source text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Create Knowledge Base Articles Table
create table public.knowledge_articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text not null,
  tags text[] default '{}',
  author_name text not null,
  views int default 0,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Create Subnets Table (IPAM)
create table public.subnets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cidr text not null,
  gateway text,
  vlan_id text,
  location text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. Create Audit Logs Table
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  entity text not null,
  entity_id text,
  details text,
  performed_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. Create Indexes
create index tickets_customer_id_idx on public.tickets(customer_id);
create index customers_plan_id_idx on public.customers(plan_id);
create index invoices_customer_id_idx on public.invoices(customer_id);
create index payment_methods_customer_id_idx on public.payment_methods(customer_id);
create index ticket_comments_ticket_id_idx on public.ticket_comments(ticket_id);
create index network_devices_customer_id_idx on public.network_devices(customer_id);
create index network_interfaces_device_id_idx on public.network_interfaces(device_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at);
create index inventory_sku_idx on public.inventory_items(sku);
create index network_alerts_timestamp_idx on public.network_alerts(timestamp);
create index kb_category_idx on public.knowledge_articles(category);
create index subnets_cidr_idx on public.subnets(cidr);

-- 18. Enable RLS
alter table public.customers enable row level security;
alter table public.tickets enable row level security;
alter table public.plans enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_methods enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.network_devices enable row level security;
alter table public.network_interfaces enable row level security;
alter table public.employees enable row level security;
alter table public.ticket_categories enable row level security;
alter table public.system_settings enable row level security;
alter table public.departments enable row level security;
alter table public.inventory_items enable row level security;
alter table public.network_alerts enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.subnets enable row level security;
alter table public.audit_logs enable row level security;

-- 19. Create Policies
create policy "Public Access Customers" on public.customers for all using (true);
create policy "Public Access Tickets" on public.tickets for all using (true);
create policy "Public Access Plans" on public.plans for all using (true);
create policy "Public Access Invoices" on public.invoices for all using (true);
create policy "Public Access Payment Methods" on public.payment_methods for all using (true);
create policy "Public Access Comments" on public.ticket_comments for all using (true);
create policy "Public Access Network Devices" on public.network_devices for all using (true);
create policy "Public Access Network Interfaces" on public.network_interfaces for all using (true);
create policy "Public Access Employees" on public.employees for all using (true);
create policy "Public Access Categories" on public.ticket_categories for all using (true);
create policy "Public Access Settings" on public.system_settings for all using (true);
create policy "Public Access Departments" on public.departments for all using (true);
create policy "Public Access Inventory" on public.inventory_items for all using (true);
create policy "Public Access Alerts" on public.network_alerts for all using (true);
create policy "Public Access Articles" on public.knowledge_articles for all using (true);
create policy "Public Access Subnets" on public.subnets for all using (true);
create policy "Public Access Audit" on public.audit_logs for all using (true);

-- 20. Seed Data
insert into public.plans (name, price, download_speed, upload_speed) values 
('Home Fiber Starter', 29.99, '50 Mbps', '10 Mbps'),
('Home Fiber Plus', 49.99, '100 Mbps', '50 Mbps'),
('Business Pro', 99.99, '1 Gbps', '1 Gbps');

insert into public.employees (name, email, role, department, status, hire_date, certifications) values 
('Admin User', 'admin@nexus-isp.com', 'admin', 'Management', 'active', '2023-01-15', 'MTCNA, MTCRE, CCNA'),
('John Tech', 'john@nexus-isp.com', 'technician', 'Field Ops', 'active', '2023-05-20', 'FO Certified'),
('Sarah Support', 'sarah@nexus-isp.com', 'support', 'Customer Service', 'active', '2024-02-10', NULL);

insert into public.ticket_categories (name, code, sla_hours, description) values
('Internet Issue', 'internet_issue', 4, 'Connectivity problems, slow speeds, packet loss.'),
('Billing', 'billing', 24, 'Invoice inquiries, payment issues, plan changes.'),
('Hardware', 'hardware', 48, 'Router malfunction, cable breaks, equipment replacement.'),
('Installation', 'installation', 72, 'New service setup, moving services.'),
('Other', 'other', 24, 'General inquiries and feedback.');

insert into public.departments (name, description, location, manager_name) values
('Field Operations', 'Technicians and on-site support', 'HQ - Ground Floor', 'Mike Chief'),
('Customer Service', 'Helpdesk and billing support', 'HQ - 1st Floor', 'Sarah Lead'),
('Network Engineering', 'Core network infrastructure management', 'HQ - Server Room', 'Alex Net');

insert into public.system_settings (key, value, description) values
('currency', 'USD', 'Default currency code for the application');

insert into public.inventory_items (name, sku, category, quantity, unit, min_quantity, cost_price, location) values
('ONU/ONT Huawei HG8245H', 'DEV-ONU-001', 'Device', 45, 'pcs', 10, 35.00, 'Warehouse A - Shelf 2'),
('Fiber Drop Cable 1 Core', 'CBL-DROP-1C', 'Cable', 2500, 'meters', 500, 0.15, 'Warehouse B - Rack 1'),
('Fiber Patch Cord SC-UPC 3m', 'ACC-PC-SC-3M', 'Accessory', 120, 'pcs', 20, 2.50, 'Warehouse A - Bin 4'),
('MikroTik RB750Gr3', 'DEV-RTR-750', 'Device', 12, 'pcs', 5, 55.00, 'Warehouse A - Secure 1'),
('Splicing Protection Sleeve', 'ACC-SPL-SLV', 'Accessory', 500, 'pcs', 100, 0.05, 'Technician Van 1');

insert into public.network_alerts (device_name, severity, message, source, timestamp) values
('Core-Router-01', 'critical', 'High CPU Usage (98%)', 'Zabbix', now()),
('OLT-North-District', 'warning', 'PON Port 3 Signal Low', 'Huawei NCE', now() - interval '1 hour'),
('Distribution-Switch-B', 'info', 'Configuration Saved', 'Syslog', now() - interval '2 hours');

insert into public.knowledge_articles (title, content, category, tags, author_name) values 
('Troubleshooting Slow Internet Speeds', '1. Verify signal strength (>-25dBm).\n2. Check for bandwidth hogs on the local network.\n3. Restart the ONU/ONT.\n4. Verify plan provisioning in OLT.', 'Troubleshooting', '{"slow", "internet", "guide"}', 'Admin User'),
('Configuring PPPoE on MikroTik', 'Go to PPP -> Interface. Add New PPPoE Client. Select Ether1 (WAN). Enter Username/Password from CRM.', 'Provisioning', '{"mikrotik", "pppoe", "setup"}', 'Alex Net'),
('Fiber Cut Escalation Protocol', 'If a fiber cut is confirmed:\n1. Create a Critical Ticket.\n2. Notify Field Ops Manager.\n3. Send SMS blast to affected ODP area.', 'SOP', '{"fiber", "outage", "emergency"}', 'Mike Chief'),
('Billing Cycle Explanation', 'Invoices are generated on the 1st of each month. Payment is due by the 15th. Suspension occurs on the 20th if unpaid.', 'Billing', '{"invoice", "policy"}', 'Sarah Support');

-- IPAM Seed Data (Interconnected with potential devices)
insert into public.subnets (name, cidr, gateway, vlan_id, description, location) values
('Management LAN', '192.168.1.0/24', '192.168.1.1', '10', 'Core network infrastructure and servers', 'HQ Server Room'),
('Customer Pool A', '10.20.100.0/24', '10.20.100.1', '100', 'PPPoE Pool for North District', 'OLT-North'),
('Public WiFi', '172.16.50.0/24', '172.16.50.1', '50', 'Guest network', 'HQ Lobby');

insert into public.audit_logs (action, entity, details, performed_by) values
('system', 'System', 'System initialized with default data', 'System');`;
