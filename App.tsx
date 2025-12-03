
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { StatsOverview } from './components/StatsOverview';
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
import { useAuth } from './contexts/AuthContext';
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
  
  // Auth Context
  const { hasPermission } = useAuth();

  // Global Settings Hook
  const { currency, saveCurrency, loading: settingsLoading } = useSettings();

  // Custom Hooks for Data Management
  const { 
    tickets, 
    loading: ticketsLoading, 
    error: ticketsError, 
    loadTickets, 
    addTicket, 
    editTicket, 
    removeTicket 
  } = useTickets();

  const {
    customers,
    loading: customersLoading,
    error: customersError, 
    loadCustomers,
    addCustomer,
    removeCustomer
  } = useCustomers();

  const {
    plans,
    loading: plansLoading,
    loadPlans,
    addPlan,
    removePlan,
  } = usePlans();

  const {
    devices,
    loading: devicesLoading,
    loadDevices,
    addDevice,
    editDevice,
    removeDevice
  } = useDevices();

  const {
    employees,
    loading: employeesLoading,
    loadEmployees,
    addEmployee,
    editEmployee,
    removeEmployee
  } = useEmployees();

  // Hook for Categories
  const {
    categories,
    loading: categoriesLoading,
    loadCategories
  } = useCategories();

  // Aggregate State
  const loading = ticketsLoading || customersLoading || plansLoading || devicesLoading || employeesLoading || categoriesLoading || settingsLoading;
  const globalError = ticketsError || customersError;
  const [setupError, setSetupError] = useState(false);

  // Form & Editing State
  const [editingTicket, setEditingTicket] = useState<Partial<Ticket> | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingDevice, setEditingDevice] = useState<NetworkDevice | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deviceCustomerId, setDeviceCustomerId] = useState<string | undefined>(undefined);
  
  const [copied, setCopied] = useState(false);
  
  // Navigation Selection State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [customerSearch, setCustomerSearch] = useState(''); 
  const [previousView, setPreviousView] = useState<AppView | null>(null); // Track navigation history

  // Initial Data Load
  const loadData = useCallback(async () => {
    setSetupError(false);
    try {
      await Promise.all([loadTickets(), loadCustomers(), loadPlans(), loadDevices(), loadEmployees(), loadCategories()]);
    } catch (err) {
      console.error("Data load failed via hooks");
    }
  }, [loadTickets, loadCustomers, loadPlans, loadDevices, loadEmployees, loadCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (ticketsError && isSetupError(ticketsError)) setSetupError(true);
    if (customersError && isSetupError(customersError)) setSetupError(true);
  }, [ticketsError, customersError]);

  // --- View Handlers ---
  const handleViewChange = (newView: AppView) => {
    setPreviousView(null); 
    setView(newView);
    // Reset selections when moving to main lists
    if (['tickets', 'customers', 'plans', 'employees'].includes(newView)) {
        if (newView !== 'customers') { setSelectedCustomer(null); setCustomerSearch(''); }
        if (newView !== 'plans') setSelectedPlan(null);
        if (newView !== 'tickets') setSelectedTicket(null);
        if (newView !== 'employees') setSelectedEmployee(null);
    }
  };

  // Maps form views to their parent navigation item for sidebar highlighting
  const getActiveNav = (): any => {
      if (view === 'ticket-form') return 'tickets';
      if (view === 'customer-form') return 'customers';
      if (view === 'plan-form') return 'plans';
      if (view === 'device-form') return 'network';
      if (view === 'employee-form') return 'employees';
      return view;
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

  // --- Actions Handlers ---
  const handleCreateTicket = async (ticketData: any) => {
    try { await addTicket(ticketData); setView('tickets'); setSelectedTicket(null); } catch (err) { alert("Failed: " + getSafeErrorMessage(err)); }
  };
  
  const handleUpdateTicket = async (id: string, updates: any) => {
    try { 
        const updated = await editTicket(id, updates); 
        setView('tickets'); setEditingTicket(null); 
        // If we were viewing details, update selection
        if (selectedTicket && selectedTicket.id === id) setSelectedTicket(updated);
    } catch (err) { alert("Failed: " + getSafeErrorMessage(err)); }
  };

  // New handler for in-place updates (Workflow steps) without changing view
  const handleQuickUpdateTicket = async (id: string, updates: any) => {
    try {
        const updated = await editTicket(id, updates);
        // Update the currently viewed ticket immediately so UI reflects changes
        if (selectedTicket && selectedTicket.id === id) {
            setSelectedTicket(updated);
        }
    } catch (err) {
        alert("Failed to update ticket: " + getSafeErrorMessage(err));
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if(!window.confirm("Delete ticket?")) return;
    try { 
        await removeTicket(id); 
        if (selectedTicket?.id === id) { setSelectedTicket(null); if (previousView) setView(previousView as any); }
    } catch (err) { alert("Failed to delete"); }
  };

  const handleCreateCustomer = async (d:any) => { try { await addCustomer(d); setView('customers'); } catch(e) { alert(e); }};
  const handleDeleteCustomer = async (id:string) => { if(window.confirm("Delete customer?")) try { await removeCustomer(id); if(selectedCustomer?.id===id) setSelectedCustomer(null); loadTickets(); } catch(e) { alert(e); }};
  
  const handleCreatePlan = async (d:any) => { try { await addPlan(d); setView('plans'); } catch(e) { alert(e); }};
  const handleDeletePlan = async (id:string) => { if(window.confirm("Delete plan?")) try { await removePlan(id); if(selectedPlan?.id===id) setSelectedPlan(null); } catch(e) { alert(e); }};

  const handleCreateDevice = async (d:any) => { try { await addDevice(d); setView(deviceCustomerId ? 'customers' : 'network'); setDeviceCustomerId(undefined); } catch(e) { alert(e); }};
  const handleUpdateDevice = async (d:any) => { if(editingDevice) try { await editDevice(editingDevice.id, d); setView(deviceCustomerId ? 'customers' : 'network'); setEditingDevice(null); setDeviceCustomerId(undefined); } catch(e) { alert(e); }};
  const handleDeleteDevice = async (id:string) => { if(window.confirm("Delete device?")) try { await removeDevice(id); } catch(e) { alert(e); }};

  const handleCreateEmployee = async (d:any) => { try { await addEmployee(d); setView('employees'); } catch(e) { alert(e); }};
  const handleUpdateEmployee = async (d:any) => { if(editingEmployee) try { await editEmployee(editingEmployee.id, d); setView('employees'); setEditingEmployee(null); if(selectedEmployee?.id===editingEmployee.id) setSelectedEmployee({...selectedEmployee, ...d}); } catch(e) { alert(e); }};
  const handleDeleteEmployee = async (id:string) => { if(window.confirm("Delete employee?")) try { await removeEmployee(id); if(selectedEmployee?.id===id) setSelectedEmployee(null); } catch(e) { alert(e); }};

  const handleCopySQL = () => { navigator.clipboard.writeText(SETUP_SQL); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // --- Form Triggers ---
  const openCreateTicket = (preselectedCustomer?: Customer) => {
    setEditingTicket(preselectedCustomer ? { customer_id: preselectedCustomer.id } : null);
    setView('ticket-form');
  };
  const openEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setView('ticket-form');
  };
  const openCreateTicketFromAlert = (data: Partial<Ticket>) => {
      setEditingTicket(data);
      setView('ticket-form');
  };

  const openCreateCustomer = () => { setView('customer-form'); };
  
  const openCreatePlan = () => { setEditingPlan(null); setView('plan-form'); };
  const openEditPlan = (plan: SubscriptionPlan) => { setEditingPlan(plan); setView('plan-form'); };

  const openCreateDevice = () => { setEditingDevice(null); setView('device-form'); };
  const openEditDevice = (device: NetworkDevice) => { setEditingDevice(device); setView('device-form'); };
  const openCustomerDeviceForm = (customerId: string, device?: NetworkDevice) => {
      setDeviceCustomerId(customerId);
      setEditingDevice(device || null);
      setView('device-form');
  };

  const openCreateEmployee = () => { setEditingEmployee(null); setView('employee-form'); };
  const openEditEmployee = (emp: Employee) => { setEditingEmployee(emp); setView('employee-form'); };


  // Helper for title
  const getPageTitle = () => {
      if (view === 'dashboard') return 'Dashboard Overview';
      if (view === 'alerts') return 'Network Alerts';
      if (view === 'customers') return selectedCustomer ? 'Subscriber Details' : 'Subscriber Management';
      if (view === 'customer-form') return 'Subscriber Form';
      if (view === 'plans') return selectedPlan ? 'Plan Details' : 'Service Packages';
      if (view === 'plan-form') return editingPlan ? 'Edit Plan' : 'New Plan';
      if (view === 'network') return 'Network Infrastructure';
      if (view === 'device-form') return editingDevice ? 'Edit Device' : 'New Device';
      if (view === 'settings') return 'System Settings';
      if (view === 'tickets') return selectedTicket ? 'Ticket Details' : 'Ticket Management';
      if (view === 'ticket-form') return editingTicket?.id ? 'Edit Ticket' : 'New Ticket';
      if (view === 'employees') return selectedEmployee ? 'Team Member Profile' : 'Team Management';
      if (view === 'employee-form') return editingEmployee ? 'Edit Member' : 'New Member';
      return 'Nexus ISP Manager';
  };

  const renderContent = () => {
    if (view === 'settings' && !hasPermission('manage_settings')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin" />;
    if ((view === 'employees' || view === 'employee-form') && !hasPermission('manage_team')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin or Manager" />;

    // Form Views
    if (view === 'ticket-form') return <TicketForm onClose={() => setView('tickets')} onSubmit={editingTicket && editingTicket.id ? (d) => handleUpdateTicket(editingTicket.id!, d) : handleCreateTicket} initialData={editingTicket || undefined} isLoading={false} customers={customers} employees={employees} categories={categories} />;
    if (view === 'customer-form') return <CustomerForm onClose={() => setView('customers')} onSubmit={handleCreateCustomer} plans={plans} currency={currency} />;
    if (view === 'plan-form') return <PlanForm onClose={() => setView('plans')} onSubmit={handleCreatePlan} initialData={editingPlan || undefined} currency={currency} />;
    if (view === 'device-form') return <DeviceForm onClose={() => setView(deviceCustomerId ? 'customers' : 'network')} onSubmit={editingDevice ? handleUpdateDevice : handleCreateDevice} initialData={editingDevice || undefined} customerId={deviceCustomerId} />;
    if (view === 'employee-form') return <EmployeeForm onClose={() => setView('employees')} onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} initialData={editingEmployee || undefined} />;
    if (view === 'settings') return <SettingsView connectionStatus={globalError ? 'error' : 'connected'} currency={currency} onCurrencyChange={saveCurrency} />;

    if (globalError) {
        return (
            <div className={`mb-6 rounded-lg p-4 border ${setupError ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex">
                    <div className="ml-3 w-full">
                        <h3 className={`text-sm font-medium ${setupError ? 'text-blue-800' : 'text-red-800'}`}>
                            {setupError ? 'Database Setup Required' : 'Error Occurred'}
                        </h3>
                        {setupError ? (
                            <div className="mt-2 text-sm text-blue-700">
                                <p className="mb-2">Run this SQL in Supabase:</p>
                                <div className="relative group">
                                    <pre className="p-4 bg-gray-800 text-gray-300 rounded-lg text-xs font-mono overflow-x-auto border border-gray-700 max-h-48">{SETUP_SQL}</pre>
                                    <button onClick={handleCopySQL} className="absolute top-2 right-2 px-2 py-1 bg-white/10 text-white text-xs rounded">{copied ? 'Copied' : 'Copy'}</button>
                                </div>
                                <button onClick={loadData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow-sm">Refresh Data</button>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-red-700">{getSafeErrorMessage(globalError)}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin w-8 h-8 text-primary-500" /></div>;

    switch (view) {
        case 'dashboard': return <><StatsOverview tickets={tickets} /><div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div className="flex justify-between items-center mb-6"><h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2><button onClick={() => setView('tickets')} className="text-primary-600 text-sm font-medium">View All</button></div><TicketList tickets={tickets.slice(0, 5)} onEdit={openEditTicket} onDelete={handleDeleteTicket} onTicketClick={handleTicketClick} compact /></div></>;
        case 'alerts': return <AlertsView onCreateTicket={openCreateTicketFromAlert} />;
        case 'tickets': return selectedTicket ? <TicketDetail ticket={selectedTicket} onBack={() => {setSelectedTicket(null); if(previousView) setView(previousView);}} onEdit={openEditTicket} onUpdateStatus={handleQuickUpdateTicket} onDelete={handleDeleteTicket} onCustomerClick={handleCustomerClick} employees={employees} /> : <TicketList tickets={tickets} onEdit={openEditTicket} onDelete={handleDeleteTicket} onCustomerClick={handleCustomerClick} onTicketClick={handleTicketClick} />;
        case 'customers': return selectedCustomer ? <CustomerDetail customer={selectedCustomer} tickets={tickets.filter(t => t.customer_id === selectedCustomer.id)} onBack={() => setSelectedCustomer(null)} onTicketEdit={openEditTicket} onTicketDelete={handleDeleteTicket} currency={currency} onPlanClick={handlePlanClick} onCreateTicket={() => openCreateTicket(selectedCustomer)} onTicketClick={handleTicketClick} devices={devices.filter(d => d.customer_id === selectedCustomer.id)} onAddDevice={() => openCustomerDeviceForm(selectedCustomer.id)} onEditDevice={(d) => openCustomerDeviceForm(selectedCustomer.id, d)} onDeleteDevice={handleDeleteDevice} plans={plans} /> : <CustomerList customers={customers} onDelete={handleDeleteCustomer} onSelect={setSelectedCustomer} initialSearch={customerSearch} />;
        case 'plans': return selectedPlan ? <PlanDetail plan={selectedPlan} customers={customers} onBack={() => setSelectedPlan(null)} onEdit={openEditPlan} onDelete={handleDeletePlan} onCustomerClick={handleCustomerClick} currency={currency} /> : <PlansView plans={plans} customers={customers} onSelectPlan={setSelectedPlan} currency={currency} />;
        case 'network': return <NetworkView devices={devices} onAddDevice={openCreateDevice} onEditDevice={openEditDevice} onDeleteDevice={handleDeleteDevice} onRefresh={loadDevices} />;
        case 'employees': return selectedEmployee ? <EmployeeDetail employee={selectedEmployee} assignedTickets={tickets.filter(t => t.assigned_to === selectedEmployee.name)} onBack={() => setSelectedEmployee(null)} onEdit={openEditEmployee} onDelete={handleDeleteEmployee} onTicketClick={handleTicketClick} /> : <EmployeeList employees={employees} onEdit={openEditEmployee} onDelete={handleDeleteEmployee} onSelect={setSelectedEmployee} />;
        default: return null;
    }
  };

  const shouldShowAddButton = () => {
      const formViews = ['ticket-form', 'customer-form', 'plan-form', 'device-form', 'employee-form'];
      if (formViews.includes(view)) return false;
      
      if (['dashboard', 'network', 'settings', 'alerts'].includes(view) || globalError || selectedCustomer || selectedPlan || selectedTicket || selectedEmployee) return false;
      if (view === 'employees' && !hasPermission('manage_team')) return false;
      return true;
  };

  return (
    <Layout currentView={getActiveNav()} onViewChange={(v) => handleViewChange(v as AppView)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h1>
            {!view.includes('form') && <p className="mt-1 text-sm text-gray-500">Manage your ISP operations</p>}
          </div>
          {shouldShowAddButton() && (
            <button
              onClick={() => {
                  if (view === 'customers') openCreateCustomer();
                  else if (view === 'plans') openCreatePlan();
                  else if (view === 'employees') openCreateEmployee();
                  else openCreateTicket();
              }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              {view === 'customers' ? 'New Customer' : view === 'plans' ? 'New Plan' : view === 'employees' ? 'New Member' : 'New Ticket'}
            </button>
          )}
        </div>

        {renderContent()}
      </div>
    </Layout>
  );
};
