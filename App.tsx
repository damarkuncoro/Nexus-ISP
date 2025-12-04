
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { ClientDashboard } from './components/ClientDashboard';

// Features Imports - Refactored
import { TicketList } from './features/tickets/components/TicketList';
import { TicketForm } from './features/tickets/components/TicketForm';
import { TicketDetail } from './components/TicketDetail'; 

import { CustomerList } from './features/customers/components/CustomerList';
import { CustomerForm } from './features/customers/components/CustomerForm';
import { CustomerDetail } from './components/CustomerDetail';

import { PlansView } from './features/plans/components/PlansView';
import { PlanDetail } from './features/plans/components/PlanDetail';
import { PlanForm } from './features/plans/components/PlanForm';

import { EmployeeList } from './features/employees/components/EmployeeList';
import { EmployeeForm } from './features/employees/components/EmployeeForm';
import { EmployeeDetail } from './features/employees/components/EmployeeDetail';

import { NetworkView } from './features/network/components/NetworkView';
import { DeviceForm } from './features/network/components/DeviceForm';

import { InventoryView } from './features/inventory/components/InventoryView';
import { InventoryForm } from './features/inventory/components/InventoryForm';

import { FinanceView } from './features/billing/components/FinanceView';
import { BillingSection } from './features/billing/components/BillingSection';

import { AlertsView } from './features/alerts/components/AlertsView';

// New Hooks
import { useTickets } from './features/tickets/hooks/useTickets';
import { useCustomers } from './features/customers/hooks/useCustomers';
import { usePlans } from './features/plans/hooks/usePlans';
import { useEmployees } from './features/employees/hooks/useEmployees';
import { useDevices } from './features/network/hooks/useDevices';
import { useInventory } from './features/inventory/hooks/useInventory';
import { useFinance } from './features/billing/hooks/useFinance';

// Old Imports / Components
import { SettingsView } from './components/SettingsView';
import { AccessDenied } from './components/AccessDenied';
import { CommandPalette } from './components/CommandPalette';
import { CoverageMap } from './components/CoverageMap';
import { LoginView } from './components/LoginView';
import { KnowledgeBase } from './components/KnowledgeBase';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { Ticket, Customer, SubscriptionPlan, NetworkDevice, Employee, InventoryItem, EmployeeRole } from './types';
import { Plus, Loader2 } from 'lucide-react';
import { SETUP_SQL } from './constants';

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
  | 'alerts'
  | 'inventory' | 'inventory-form'
  | 'finance'
  | 'map'
  | 'kb'
  | 'reports'
  | 'profile';

export const App: React.FC = () => {
  const { currentUser, hasPermission, logout } = useAuth();
  
  const [view, setView] = useState<AppView>('dashboard');
  const toast = useToast();
  
  const { currency, saveCurrency, loading: settingsLoading } = useSettings();

  // Used new hooks
  const { tickets, loading: ticketsLoading, error: ticketsError, loadTickets, addTicket, editTicket, removeTicket } = useTickets();
  const { customers, loading: customersLoading, error: customersError, loadCustomers, addCustomer, editCustomer, removeCustomer } = useCustomers();
  const { plans, loading: plansLoading, loadPlans, addPlan, removePlan } = usePlans();
  const { employees, loading: employeesLoading, loadEmployees, addEmployee, editEmployee, removeEmployee } = useEmployees();
  const { devices, loading: devicesLoading, loadDevices, addDevice, editDevice, removeDevice } = useDevices();
  const { items: inventoryItems, addItem: addInventoryItem, editItem: editInventoryItem } = useInventory(); 
  const { invoices, loadInvoices } = useFinance();

  // Old hooks (to be migrated)
  const { categories, loading: categoriesLoading, loadCategories } = useCategories();
  const { departments, loading: departmentsLoading, loadDepartments } = useDepartments();

  const loading = ticketsLoading || customersLoading || plansLoading || devicesLoading || employeesLoading || categoriesLoading || departmentsLoading || settingsLoading;
  const globalError = ticketsError || customersError;
  const [setupError, setSetupError] = useState(false);

  const [editingTicket, setEditingTicket] = useState<Partial<Ticket> | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingDevice, setEditingDevice] = useState<Partial<NetworkDevice> | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [deviceCustomerId, setDeviceCustomerId] = useState<string | undefined>(undefined);
  
  const [copied, setCopied] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [customerSearch, setCustomerSearch] = useState(''); 
  const [previousView, setPreviousView] = useState<AppView | null>(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;

    setSetupError(false);
    try {
      await Promise.all([
        loadTickets(), 
        loadCustomers(), 
        loadPlans(), 
        loadDevices(), 
        loadEmployees(), 
        loadCategories(), 
        loadDepartments(),
        loadInvoices()
      ]);
    } catch (err) {
      console.error("Data load failed via hooks");
    }
  }, [currentUser, loadTickets, loadCustomers, loadPlans, loadDevices, loadEmployees, loadCategories, loadDepartments, loadInvoices]);

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

  if (!currentUser) {
      return <LoginView />;
  }

  const getActiveNav = (): any => {
      const formMap: Record<string, string> = { 
        'ticket-form': 'tickets', 
        'customer-form': 'customers', 
        'plan-form': 'plans', 
        'device-form': 'network', 
        'employee-form': 'employees',
        'inventory-form': 'inventory',
        'map': 'map',
        'kb': 'kb',
        'reports': 'reports',
        'profile': 'dashboard' 
      };
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
  const handleUpdateTicket = async (id: string, updates: any) => { try { const updated = await editTicket(id, updates); setView('tickets'); setEditingTicket(null); if (selectedTicket && selectedTicket.id === id) setSelectedTicket(updated); toast.success('Ticket updated successfully!'); } catch (err) { toast.error("Failed: " + getSafeErrorMessage(err)); }};
  const handleQuickUpdateTicket = async (id: string, updates: any) => { try { const updated = await editTicket(id, updates); if (selectedTicket && selectedTicket.id === id) setSelectedTicket(updated); toast.info('Ticket status updated.'); } catch (err) { toast.error("Failed: " + getSafeErrorMessage(err)); }};
  const handleDeleteTicket = async (id: string) => { try { await removeTicket(id); if (selectedTicket?.id === id) { setSelectedTicket(null); if (previousView) setView(previousView as any); } toast.success('Ticket deleted.'); } catch (err) { toast.error("Failed to delete ticket."); }};
  const handleCreateCustomer = async (d:any) => { try { await addCustomer(d); setView('customers'); toast.success('Customer created.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => { try { const updatedCustomer = await editCustomer(id, updates); if (selectedCustomer && selectedCustomer.id === id) setSelectedCustomer(updatedCustomer); toast.success('Customer details saved.'); } catch (e) { toast.error("Failed to update customer: " + getSafeErrorMessage(e)); throw e; }};
  const handleDeleteCustomer = async (id:string) => { try { await removeCustomer(id); if(selectedCustomer?.id===id) setSelectedCustomer(null); loadTickets(); toast.success('Customer deleted.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleCreatePlan = async (d:any) => { try { await addPlan(d); setView('plans'); toast.success('Plan created.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleDeletePlan = async (id:string) => { try { await removePlan(id); if(selectedPlan?.id===id) setSelectedPlan(null); toast.success('Plan deleted.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleCreateDevice = async (d:any) => { try { await addDevice(d); setView(deviceCustomerId ? 'customers' : 'network'); setDeviceCustomerId(undefined); toast.success('Device added.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleUpdateDevice = async (d:any) => { if(editingDevice && editingDevice.id) try { await editDevice(editingDevice.id, d); setView(deviceCustomerId ? 'customers' : 'network'); setEditingDevice(null); setDeviceCustomerId(undefined); toast.success('Device updated.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleDeleteDevice = async (id:string) => { try { await removeDevice(id); toast.success('Device removed.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleCreateEmployee = async (d:any) => { try { await addEmployee(d); setView('employees'); toast.success('Team member added.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleUpdateEmployee = async (d:any) => { if(editingEmployee) try { await editEmployee(editingEmployee.id, d); setView('employees'); setEditingEmployee(null); if(selectedEmployee?.id===editingEmployee.id) setSelectedEmployee({...selectedEmployee, ...d}); toast.success('Team member updated.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleDeleteEmployee = async (id:string) => { try { await removeEmployee(id); if(selectedEmployee?.id===id) setSelectedEmployee(null); toast.success('Team member removed.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleCreateInventory = async (d:any) => { try { await addInventoryItem(d); setView('inventory'); toast.success('Item added.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};
  const handleUpdateInventory = async (d:any) => { if(editingInventory) try { await editInventoryItem(editingInventory.id, d); setView('inventory'); setEditingInventory(null); toast.success('Item updated.'); } catch(e) { toast.error(getSafeErrorMessage(e)); }};

  const handleCopySQL = () => { navigator.clipboard.writeText(SETUP_SQL); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const openCreateTicket = (preselectedCustomer?: Customer) => { setEditingTicket(preselectedCustomer ? { customer_id: preselectedCustomer.id } : null); setView('ticket-form'); };
  const openEditTicket = (ticket: Ticket) => { setEditingTicket(ticket); setView('ticket-form'); };
  const openCreateTicketFromAlert = (data: Partial<Ticket>) => { setEditingTicket(data); setView('ticket-form'); };
  const openCreateCustomer = () => { setView('customer-form'); };
  const openCreatePlan = () => { setEditingPlan(null); setView('plan-form'); };
  const openEditPlan = (plan: SubscriptionPlan) => { setEditingPlan(plan); setView('plan-form'); };
  const openCreateDevice = (defaults?: Partial<NetworkDevice>) => { setEditingDevice(defaults || null); setView('device-form'); };
  const openEditDevice = (device: NetworkDevice) => { setEditingDevice(device); setView('device-form'); };
  const openCustomerDeviceForm = (customerId: string, device?: NetworkDevice) => { setDeviceCustomerId(customerId); setEditingDevice(device || null); setView('device-form'); };
  const openCreateEmployee = () => { setEditingEmployee(null); setView('employee-form'); };
  const openEditEmployee = (emp: Employee) => { setEditingEmployee(emp); setView('employee-form'); };
  const openCreateInventory = () => { setEditingInventory(null); setView('inventory-form'); };
  const openEditInventory = (item: InventoryItem) => { setEditingInventory(item); setView('inventory-form'); };

  const getPageTitle = () => {
      const titles: Record<string, string> = {
          dashboard: currentUser.role === EmployeeRole.CUSTOMER ? 'My Dashboard' : 'Dashboard Overview', 
          alerts: 'Network Alerts',
          customers: selectedCustomer ? 'Subscriber Details' : 'Subscriber Management', 'customer-form': 'Subscriber Form',
          plans: selectedPlan ? 'Plan Details' : 'Service Packages', 'plan-form': editingPlan ? 'Edit Plan' : 'New Plan',
          network: 'Network Infrastructure', 'device-form': editingDevice && editingDevice.id ? 'Edit Device' : 'New Device',
          settings: 'System Settings',
          tickets: selectedTicket ? 'Ticket Details' : 'Ticket Management', 'ticket-form': editingTicket?.id ? 'Edit Ticket' : 'New Ticket',
          employees: selectedEmployee ? 'Team Member Profile' : 'Team Management', 'employee-form': editingEmployee ? 'Edit Member' : 'New Member',
          inventory: 'Warehouse Inventory', 'inventory-form': editingInventory ? 'Edit Item' : 'New Item',
          finance: currentUser.role === EmployeeRole.CUSTOMER ? 'My Billing' : 'Finance & Billing',
          map: 'Service Coverage',
          kb: 'Knowledge Base',
          reports: 'Analytics & Reports',
          profile: 'My Profile'
      };
      return titles[view] || 'Nexus ISP Manager';
  };

  const renderContent = () => {
    const isCustomer = currentUser.role === EmployeeRole.CUSTOMER;

    if (isCustomer) {
       const allowedViews = ['dashboard', 'tickets', 'ticket-form', 'finance', 'kb', 'profile'];
       if (!allowedViews.includes(view)) {
           return <AccessDenied onBack={() => setView('dashboard')} />;
       }
    } else {
        if (view === 'settings' && !hasPermission('manage_settings')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin" />;
        if ((view === 'employees' || view === 'employee-form') && !hasPermission('manage_team')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin or Manager" />;
        if ((view === 'inventory' || view === 'inventory-form') && !hasPermission('manage_network') && !hasPermission('view_billing')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Tech or Admin" />;
        if ((view === 'finance' || view === 'reports') && !hasPermission('view_billing')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Finance/Admin" />;
    }

    if (view === 'ticket-form') return <TicketForm onClose={() => setView('tickets')} onSubmit={editingTicket && editingTicket.id ? (d) => handleUpdateTicket(editingTicket.id!, d) : handleCreateTicket} initialData={editingTicket || undefined} isLoading={false} customers={customers} employees={employees} categories={categories} />;
    if (view === 'customer-form') return <CustomerForm onClose={() => setView('customers')} onSubmit={handleCreateCustomer} plans={plans} currency={currency} />;
    if (view === 'plan-form') return <PlanForm onClose={() => setView('plans')} onSubmit={handleCreatePlan} initialData={editingPlan || undefined} currency={currency} />;
    if (view === 'device-form') return <DeviceForm onClose={() => setView(deviceCustomerId ? 'customers' : 'network')} onSubmit={editingDevice && editingDevice.id ? handleUpdateDevice : handleCreateDevice} initialData={editingDevice as NetworkDevice} customerId={deviceCustomerId} />;
    if (view === 'employee-form') return <EmployeeForm onClose={() => setView('employees')} onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} initialData={editingEmployee || undefined} departments={departments} />;
    if (view === 'inventory-form') return <InventoryForm onClose={() => setView('inventory')} onSubmit={editingInventory ? handleUpdateInventory : handleCreateInventory} initialData={editingInventory || undefined} />;
    
    if (view === 'settings') return <SettingsView connectionStatus={globalError ? 'error' : 'connected'} currency={currency} onCurrencyChange={saveCurrency} />;

    if (globalError) {
        return (
            <div className={`mb-6 rounded-lg p-4 border ${setupError ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex">
                    <div className="ml-3 w-full">
                        <h3 className={`text-sm font-medium ${setupError ? 'text-blue-800' : 'text-red-800'}`}>{setupError ? 'Database Setup Required' : 'Error Occurred'}</h3>
                        {setupError ? (
                            <div className="mt-2 text-sm text-blue-700">
                                <p className="mb-2">Run this SQL in Supabase:</p>
                                <div className="relative group">
                                    <pre className="p-4 bg-gray-800 text-gray-300 rounded-lg text-xs font-mono overflow-x-auto border border-gray-700 max-h-48">{SETUP_SQL}</pre>
                                    <button onClick={handleCopySQL} className="absolute top-2 right-2 px-2 py-1 bg-white/10 text-white text-xs rounded">{copied ? 'Copied' : 'Copy'}</button>
                                </div>
                                <button onClick={loadData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow-sm">Refresh Data</button>
                            </div>
                        ) : ( <p className="mt-2 text-sm text-red-700">{getSafeErrorMessage(globalError)}</p> )}
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin w-8 h-8 text-primary-500" /></div>;

    switch (view) {
        case 'dashboard': 
            return isCustomer ? (
                <ClientDashboard 
                    customer={customers.find(c => c.email === currentUser.email) || customers[0]} 
                    tickets={tickets.filter(t => t.customer_id === (customers.find(c => c.email === currentUser.email)?.id || ''))} 
                    invoices={invoices.filter(i => i.customer_id === (customers.find(c => c.email === currentUser.email)?.id || ''))}
                    currency={currency}
                    onCreateTicket={() => openCreateTicket()}
                    onPayBill={() => setView('finance')}
                />
            ) : (
                <DashboardView tickets={tickets} customers={customers} onTicketClick={handleTicketClick} onViewChange={(v) => handleViewChange(v)} />
            );
        case 'alerts': return <AlertsView onCreateTicket={openCreateTicketFromAlert} />;
        case 'finance': 
            if (isCustomer) {
                const myCustomerProfile = customers.find(c => c.email === currentUser.email);
                if (myCustomerProfile) {
                    return <BillingSection customer={myCustomerProfile} currency={currency} plans={plans} />;
                }
                return <div className="p-8 text-center text-gray-500">Customer profile not found. Please contact support.</div>;
            }
            return <FinanceView customers={customers} plans={plans} currency={currency} />;
        case 'reports': return <ReportsView customers={customers} tickets={tickets} currency={currency} />;
        case 'map': return <CoverageMap customers={customers} onCustomerSelect={handleCustomerClick} />;
        case 'kb': return <KnowledgeBase />;
        case 'profile': return <ProfileView />;
        case 'tickets': 
          const visibleTickets = isCustomer 
            ? tickets.filter(t => t.customer_id === (customers.find(c => c.email === currentUser.email)?.id || '')) 
            : tickets;

          return selectedTicket 
            ? <TicketDetail 
                ticket={selectedTicket} 
                onBack={() => {setSelectedTicket(null); if(previousView) setView(previousView);}} 
                onEdit={openEditTicket} 
                onUpdateStatus={handleQuickUpdateTicket} 
                onDelete={handleDeleteTicket} 
                onCustomerClick={handleCustomerClick} 
                employees={employees} 
              /> 
            : <TicketList 
                tickets={visibleTickets} 
                onEdit={openEditTicket} 
                onDelete={handleDeleteTicket} 
                onCustomerClick={handleCustomerClick} 
                onTicketClick={handleTicketClick} 
              />;
        case 'customers': 
          return selectedCustomer 
            ? <CustomerDetail 
                customer={selectedCustomer} 
                tickets={tickets.filter(t => t.customer_id === selectedCustomer.id)} 
                onBack={() => setSelectedCustomer(null)} 
                onTicketEdit={openEditTicket} 
                onTicketDelete={handleDeleteTicket} 
                currency={currency} 
                onPlanClick={handlePlanClick} 
                onCreateTicket={() => openCreateTicket(selectedCustomer)} 
                onTicketClick={handleTicketClick} 
                devices={devices.filter(d => d.customer_id === selectedCustomer.id)} 
                onAddDevice={() => openCustomerDeviceForm(selectedCustomer.id)} 
                onEditDevice={(d) => openCustomerDeviceForm(selectedCustomer.id, d)} 
                onDeleteDevice={handleDeleteDevice} 
                plans={plans} 
                onUpdateCustomer={handleUpdateCustomer} 
              /> 
            : <CustomerList 
                customers={customers} 
                onDelete={handleDeleteCustomer} 
                onSelect={setSelectedCustomer} 
                initialSearch={customerSearch} 
              />;
        case 'plans': 
          return selectedPlan 
            ? <PlanDetail 
                plan={selectedPlan} 
                customers={customers} 
                onBack={() => setSelectedPlan(null)} 
                onEdit={openEditPlan} 
                onDelete={handleDeletePlan} 
                onCustomerClick={handleCustomerClick} 
                currency={currency} 
              /> 
            : <PlansView 
                plans={plans} 
                customers={customers} 
                onSelectPlan={setSelectedPlan} 
                currency={currency} 
              />;
        case 'network': 
          return <NetworkView 
            devices={devices} 
            onAddDevice={openCreateDevice} 
            onEditDevice={openEditDevice} 
            onDeleteDevice={handleDeleteDevice} 
            onRefresh={loadDevices} 
          />;
        case 'employees': 
          return selectedEmployee 
            ? <EmployeeDetail 
                employee={selectedEmployee} 
                assignedTickets={tickets.filter(t => t.assigned_to === selectedEmployee.name)} 
                onBack={() => setSelectedEmployee(null)} 
                onEdit={openEditEmployee} 
                onDelete={handleDeleteEmployee} 
                onTicketClick={handleTicketClick} 
              /> 
            : <EmployeeList 
                employees={employees} 
                departments={departments} 
                onEdit={openEditEmployee} 
                onDelete={handleDeleteEmployee} 
                onSelect={setSelectedEmployee} 
              />;
        case 'inventory':
          return <InventoryView onAddItem={openCreateInventory} onEditItem={openEditInventory} currency={currency} />;
        default: return null;
    }
  };

  const shouldShowAddButton = () => {
      const isCustomer = currentUser.role === EmployeeRole.CUSTOMER;
      if (isCustomer) {
          return view === 'tickets';
      }

      const formViews = ['ticket-form', 'customer-form', 'plan-form', 'device-form', 'employee-form', 'inventory-form', 'map', 'kb', 'reports', 'profile'];
      if (formViews.includes(view) || globalError || selectedCustomer || selectedPlan || selectedTicket || selectedEmployee) return false;
      
      const permissionMap: Record<string, boolean> = {
          dashboard: false, settings: false, alerts: false, finance: false, map: false, kb: false, reports: false, profile: false,
          employees: hasPermission('manage_team'),
          plans: hasPermission('manage_settings'),
          network: hasPermission('manage_network'),
          inventory: hasPermission('manage_network'),
      };
      if (permissionMap[view] === false) return false;
      
      return true;
  };

  return (
    <>
      <CommandPalette 
        onNavigate={handleViewChange}
        actions={{
          createTicket: () => openCreateTicket(),
          createCustomer: openCreateCustomer,
          createDevice: () => openCreateDevice(),
          createPlan: openCreatePlan,
          logout: logout
        }}
        customers={customers}
        tickets={tickets}
        onSelectCustomer={handleCustomerClick}
        onSelectTicket={handleTicketClick}
      />
      <Layout currentView={getActiveNav()} onViewChange={(v) => handleViewChange(v as AppView)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!view.includes('form') && view !== 'profile' && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{getPageTitle()}</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {currentUser.role === EmployeeRole.CUSTOMER ? 'Manage your account' : 'Manage your ISP operations'}
                </p>
              </div>
              {shouldShowAddButton() && (
                <button 
                  onClick={() => { 
                    if (view === 'customers') openCreateCustomer(); 
                    else if (view === 'plans') openCreatePlan(); 
                    else if (view === 'employees') openCreateEmployee(); 
                    else if (view === 'network') openCreateDevice(); 
                    else if (view === 'inventory') openCreateInventory();
                    else openCreateTicket(); 
                  }} 
                  className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {view === 'customers' ? 'New Customer' : 
                  view === 'plans' ? 'New Plan' : 
                  view === 'employees' ? 'New Member' : 
                  view === 'network' ? 'New Device' : 
                  view === 'inventory' ? 'New Item' : 'New Ticket'}
                </button>
              )}
            </div>
          )}
          {renderContent()}
        </div>
      </Layout>
    </>
  );
};
