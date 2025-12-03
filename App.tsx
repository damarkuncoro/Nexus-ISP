
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { TicketList } from './components/TicketList';
import { TicketForm } from './components/forms/TicketForm';
import { TicketDetail } from './components/TicketDetail';
import { CustomerList } from './components/CustomerList';
import { CustomerForm } from './components/forms/CustomerForm';
import { CustomerDetail } from './components/CustomerDetail';
import { PlansView } from './components/PlansView';
import { PlanDetail } from './components/PlanDetail';
import { PlanForm } from './components/forms/PlanForm';
import { NetworkView } from './components/NetworkView';
import { DeviceForm } from './components/forms/DeviceForm';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/forms/EmployeeForm';
import { EmployeeDetail } from './components/EmployeeDetail';
import { SettingsView } from './components/SettingsView';
import { AlertsView } from './components/AlertsView';
import { AccessDenied } from './components/AccessDenied';
import { Ticket, Customer, SubscriptionPlan, NetworkDevice, Employee } from './types';
import { Plus, Loader2 } from 'lucide-react';
import { SETUP_SQL } from './constants';
import { useTickets } from './hooks/useTickets';
import { useCustomers } from './hooks/useCustomers';
import { usePlans } from './hooks/usePlans';
import { useDevices } from './hooks/useDevices';
import { useEmployees } from './hooks/useEmployees';
import { useCategories } from './hooks/useCategories';
import { useSettings } from './hooks/useSettings';
import { useDepartments } from './hooks/useDepartments';
import { useAuth } from './contexts/AuthContext';
import { useToast } from './contexts/ToastContext';
import { getSafeErrorMessage, isSetupError } from './utils/errorHelpers';

type AppView = 
  | 'dashboard' 
  | 'tickets' | 'ticket-form'
  | 'customers' | 'customer-form'
  | 'plans' | 'plan-form'
  | 'network' | 'device-form'
  | 'settings' 
  | 'employees' | 'employee-form'
  | 'alerts';

export const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const toast = useToast();
  
  const { hasPermission } = useAuth();
  const { currency, saveCurrency, loading: settingsLoading } = useSettings();

  const { tickets, loading: ticketsLoading, error: ticketsError, loadTickets, addTicket, editTicket, removeTicket } = useTickets();
  const { customers, loading: customersLoading, error: customersError, loadCustomers, addCustomer, editCustomer, removeCustomer } = useCustomers();
  const { plans, loading: plansLoading, loadPlans, addPlan, removePlan } = usePlans();
  const { devices, loading: devicesLoading, loadDevices, addDevice, editDevice, removeDevice } = useDevices();
  const { employees, loading: employeesLoading, loadEmployees, addEmployee, editEmployee, removeEmployee } = useEmployees();
  const { categories, loading: categoriesLoading, loadCategories } = useCategories();
  const { departments, loading: departmentsLoading, loadDepartments } = useDepartments();

  const loading = ticketsLoading || customersLoading || plansLoading || devicesLoading || employeesLoading || categoriesLoading || departmentsLoading || settingsLoading;
  const globalError = ticketsError || customersError;
  const [setupError, setSetupError] = useState(false);

  const [editingTicket, setEditingTicket] = useState<Partial<Ticket> | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingDevice, setEditingDevice] = useState<NetworkDevice | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deviceCustomerId, setDeviceCustomerId] = useState<string | undefined>(undefined);
  
  const [copied, setCopied] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [customerSearch, setCustomerSearch] = useState(''); 
  const [previousView, setPreviousView] = useState<AppView | null>(null);

  const loadData = useCallback(async () => {
    setSetupError(false);
    try {
      await Promise.all([loadTickets(), loadCustomers(), loadPlans(), loadDevices(), loadEmployees(), loadCategories(), loadDepartments()]);
    } catch (err) {
      console.error("Data load failed via hooks");
    }
  }, [loadTickets, loadCustomers, loadPlans, loadDevices, loadEmployees, loadCategories, loadDepartments]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if ((ticketsError && isSetupError(ticketsError)) || (customersError && isSetupError(customersError))) {
      setSetupError(true);
    }
  }, [ticketsError, customersError]);

  const handleViewChange = (newView: AppView) => {
    setPreviousView(null); 
    setView(newView);
    if (['tickets', 'customers', 'plans', 'employees'].includes(newView)) {
        if (newView !== 'customers') { setSelectedCustomer(null); setCustomerSearch(''); }
        if (newView !== 'plans') setSelectedPlan(null);
        if (newView !== 'tickets') setSelectedTicket(null);
        if (newView !== 'employees') setSelectedEmployee(null);
    }
  };

  const getActiveNav = (): any => {
      const formMap: Record<string, string> = { 'ticket-form': 'tickets', 'customer-form': 'customers', 'plan-form': 'plans', 'device-form': 'network', 'employee-form': 'employees' };
      return formMap[view] || view;
  };

  const handleCustomerClick = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) { setSelectedCustomer(customer); setView('customers'); }
  };

  const handlePlanClick = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) { setSelectedPlan(plan); setView('plans'); }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setPreviousView(view);
    setSelectedTicket(ticket);
    setView('tickets');
  };

  const handleCreateTicket = async (ticketData: any) => { try { await addTicket(ticketData); setView('tickets'); setSelectedTicket(null); toast.success('Ticket created successfully!'); } catch (err) { toast.error("Failed: " + getSafeErrorMessage(err)); }};
  const handleUpdateTicket = async (id: string, updates: any) => {
    try { 
        const updated = await editTicket(id, updates); 
        setView('tickets'); setEditingTicket(null); 
        if (selectedTicket && selectedTicket.id === id) setSelectedTicket(updated);
        toast.success('Ticket updated successfully!');
    } catch (err) { toast.error("Failed: " + getSafeErrorMessage(err)); }
  };
  const handleQuickUpdateTicket = async (id: string, updates: any) => {
    try {
        const updated = await editTicket(id, updates);
        if (selectedTicket && selectedTicket.id === id) setSelectedTicket(updated);
        toast.info('Ticket status updated.');
    } catch (err) { toast.error("Failed to update ticket: " + getSafeErrorMessage(err)); }
  };
  const handleDeleteTicket = async (id: string) => {
    try { 
        await removeTicket(id); 
        if (selectedTicket?.id === id) { setSelectedTicket(null); if (previousView) setView(previousView as any); }
        toast.success('Ticket deleted.');
    } catch (err) { toast.error("Failed to delete ticket."); }
  };

  const handleCreateCustomer = async (d:any) => { try { await addCustomer(d); setView('customers'); toast.success('Customer created.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updatedCustomer = await editCustomer(id, updates);
      if (selectedCustomer && selectedCustomer.id === id) setSelectedCustomer(updatedCustomer);
      toast.success('Customer details saved.');
    } catch (e) { toast.error("Failed to update customer: " + getSafeErrorMessage(e)); throw e; }
  };
  const handleDeleteCustomer = async (id:string) => { try { await removeCustomer(id); if(selectedCustomer?.id===id) setSelectedCustomer(null); loadTickets(); toast.success('Customer deleted.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  
  const handleCreatePlan = async (d:any) => { try { await addPlan(d); setView('plans'); toast.success('Plan created.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleDeletePlan = async (id:string) => { try { await removePlan(id); if(selectedPlan?.id===id) setSelectedPlan(null); toast.success('Plan deleted.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};

  const handleCreateDevice = async (d:any) => { try { await addDevice(d); setView(deviceCustomerId ? 'customers' : 'network'); setDeviceCustomerId(undefined); toast.success('Device added.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleUpdateDevice = async (d:any) => { if(editingDevice) try { await editDevice(editingDevice.id, d); setView(deviceCustomerId ? 'customers' : 'network'); setEditingDevice(null); setDeviceCustomerId(undefined); toast.success('Device updated.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleDeleteDevice = async (id:string) => { try { await removeDevice(id); toast.success('Device removed.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};

  const handleCreateEmployee = async (d:any) => { try { await addEmployee(d); setView('employees'); toast.success('Team member added.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleUpdateEmployee = async (d:any) => { if(editingEmployee) try { await editEmployee(editingEmployee.id, d); setView('employees'); setEditingEmployee(null); if(selectedEmployee?.id===editingEmployee.id) setSelectedEmployee({...selectedEmployee, ...d}); toast.success('Team member updated.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleDeleteEmployee = async (id:string) => { try { await removeEmployee(id); if(selectedEmployee?.id===id) setSelectedEmployee(null); toast.success('Team member removed.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};

  const handleCopySQL = () => { navigator.clipboard.writeText(SETUP_SQL); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const openCreateTicket = (preselectedCustomer?: Customer) => { setEditingTicket(preselectedCustomer ? { customer_id: preselectedCustomer.id } : null); setView('ticket-form'); };
  const openEditTicket = (ticket: Ticket) => { setEditingTicket(ticket); setView('ticket-form'); };
  const openCreateTicketFromAlert = (data: Partial<Ticket>) => { setEditingTicket(data); setView('ticket-form'); };
  const openCreateCustomer = () => { setView('customer-form'); };
  const openCreatePlan = () => { setEditingPlan(null); setView('plan-form'); };
  const openEditPlan = (plan: SubscriptionPlan) => { setEditingPlan(plan); setView('plan-form'); };
  const openCreateDevice = () => { setEditingDevice(null); setView('device-form'); };
  const openEditDevice = (device: NetworkDevice) => { setEditingDevice(device); setView('device-form'); };
  const openCustomerDeviceForm = (customerId: string, device?: NetworkDevice) => { setDeviceCustomerId(customerId); setEditingDevice(device || null); setView('device-form'); };
  const openCreateEmployee = () => { setEditingEmployee(null); setView('employee-form'); };
  const openEditEmployee = (emp: Employee) => { setEditingEmployee(emp); setView('employee-form'); };

  const getPageTitle = () => {
      const titles: Record<string, string> = {
          dashboard: 'Dashboard Overview', alerts: 'Network Alerts',
          customers: selectedCustomer ? 'Subscriber Details' : 'Subscriber Management', 'customer-form': 'Subscriber Form',
          plans: selectedPlan ? 'Plan Details' : 'Service Packages', 'plan-form': editingPlan ? 'Edit Plan' : 'New Plan',
          network: 'Network Infrastructure', 'device-form': editingDevice ? 'Edit Device' : 'New Device',
          settings: 'System Settings',
          tickets: selectedTicket ? 'Ticket Details' : 'Ticket Management', 'ticket-form': editingTicket?.id ? 'Edit Ticket' : 'New Ticket',
          employees: selectedEmployee ? 'Team Member Profile' : 'Team Management', 'employee-form': editingEmployee ? 'Edit Member' : 'New Member',
      };
      return titles[view] || 'Nexus ISP Manager';
  };
const renderContent = () => {
  if (view === 'settings' && !hasPermission('manage_settings')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin" />;
  if ((view === 'employees' || view === 'employee-form') && !hasPermission('manage_team')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin or Manager" />;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (setupError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full border border-red-100">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Database Setup Required</h1>
        <p className="text-gray-600 mb-4">The application database needs to be initialized. Please run the setup SQL in your Supabase dashboard.</p>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm font-mono mb-4 max-h-64">
          {SETUP_SQL}
        </div>
        <button
          onClick={handleCopySQL}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors mr-2"
        >
          {copied ? 'Copied!' : 'Copy SQL'}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Reload After Setup
        </button>
      </div>
    </div>
  );

  switch (view) {
    case 'dashboard':
      return <DashboardView
        tickets={tickets}
        customers={customers}
        plans={plans}
        devices={devices}
        employees={employees}
        onCustomerClick={handleCustomerClick}
        onPlanClick={handlePlanClick}
        onTicketClick={handleTicketClick}
        onCreateTicket={openCreateTicket}
        onCreateCustomer={openCreateCustomer}
        onCreatePlan={openCreatePlan}
        onCreateDevice={openCreateDevice}
        onCreateEmployee={openCreateEmployee}
        onViewChange={handleViewChange}
      />;
    case 'tickets':
      return selectedTicket ? (
        <TicketDetail
          ticket={selectedTicket}
          customers={customers}
          onBack={() => setSelectedTicket(null)}
          onEdit={openEditTicket}
          onUpdate={handleQuickUpdateTicket}
          onDelete={handleDeleteTicket}
        />
      ) : (
        <TicketList
          tickets={tickets}
          customers={customers}
          onTicketClick={handleTicketClick}
          onCreateTicket={openCreateTicket}
          onUpdateTicket={handleQuickUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
        />
      );
    case 'ticket-form':
      return <TicketForm
        ticket={editingTicket}
        customers={customers}
        categories={categories}
        onSubmit={editingTicket?.id ? handleUpdateTicket : handleCreateTicket}
        onCancel={() => setView('tickets')}
      />;
    case 'customers':
      return selectedCustomer ? (
        <CustomerDetail
          customer={selectedCustomer}
          plans={plans}
          devices={devices}
          tickets={tickets}
          onBack={() => setSelectedCustomer(null)}
          onEdit={() => setView('customer-form')}
          onUpdate={handleUpdateCustomer}
          onDelete={handleDeleteCustomer}
          onCreateTicket={openCreateTicket}
          onDeviceForm={openCustomerDeviceForm}
        />
      ) : (
        <CustomerList
          customers={customers}
          search={customerSearch}
          onSearchChange={setCustomerSearch}
          onCustomerClick={handleCustomerClick}
          onCreateCustomer={openCreateCustomer}
        />
      );
    case 'customer-form':
      return <CustomerForm
        customer={selectedCustomer}
        plans={plans}
        onSubmit={selectedCustomer ? (data) => handleUpdateCustomer(selectedCustomer.id, data) : handleCreateCustomer}
        onCancel={() => setView('customers')}
      />;
    case 'plans':
      return selectedPlan ? (
        <PlanDetail
          plan={selectedPlan}
          customers={customers}
          onBack={() => setSelectedPlan(null)}
          onEdit={openEditPlan}
          onDelete={handleDeletePlan}
        />
      ) : (
        <PlansView
          plans={plans}
          onPlanClick={handlePlanClick}
          onCreatePlan={openCreatePlan}
        />
      );
    case 'plan-form':
      return <PlanForm
        plan={editingPlan}
        onSubmit={handleCreatePlan}
        onCancel={() => setView('plans')}
      />;
    case 'network':
      return <NetworkView
        devices={devices}
        customers={customers}
        onCreateDevice={openCreateDevice}
        onEditDevice={openEditDevice}
        onDeleteDevice={handleDeleteDevice}
      />;
    case 'device-form':
      return <DeviceForm
        device={editingDevice}
        customers={customers}
        customerId={deviceCustomerId}
        onSubmit={editingDevice ? handleUpdateDevice : handleCreateDevice}
        onCancel={() => setView(deviceCustomerId ? 'customers' : 'network')}
      />;
    case 'employees':
      return selectedEmployee ? (
        <EmployeeDetail
          employee={selectedEmployee}
          onBack={() => setSelectedEmployee(null)}
          onEdit={openEditEmployee}
          onDelete={handleDeleteEmployee}
        />
      ) : (
        <EmployeeList
          employees={employees}
          departments={departments}
          onEmployeeClick={(emp) => setSelectedEmployee(emp)}
          onCreateEmployee={openCreateEmployee}
        />
      );
    case 'employee-form':
      return <EmployeeForm
        employee={editingEmployee}
        departments={departments}
        onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
        onCancel={() => setView('employees')}
      />;
    case 'settings':
      return <SettingsView
        currency={currency}
        onSaveCurrency={saveCurrency}
        onCopySQL={handleCopySQL}
        copied={copied}
      />;
    case 'alerts':
      return <AlertsView
        onCreateTicket={openCreateTicketFromAlert}
      />;
    default:
      return <DashboardView
        tickets={tickets}
        customers={customers}
        plans={plans}
        devices={devices}
        employees={employees}
        onCustomerClick={handleCustomerClick}
        onPlanClick={handlePlanClick}
        onTicketClick={handleTicketClick}
        onCreateTicket={openCreateTicket}
        onCreateCustomer={openCreateCustomer}
        onCreatePlan={openCreatePlan}
        onCreateDevice={openCreateDevice}
        onCreateEmployee={openCreateEmployee}
        onViewChange={handleViewChange}
      />;
  }
};

return (
  <Layout
    view={view}
    activeNav={getActiveNav()}
    pageTitle={getPageTitle()}
    onViewChange={handleViewChange}
    hasPermission={hasPermission}
  >
    {renderContent()}
  </Layout>
);
};
    