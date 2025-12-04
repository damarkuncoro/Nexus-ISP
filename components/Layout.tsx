
import React, { useState } from 'react';
import { LayoutDashboard, Ticket as TicketIcon, Settings, Menu, X, Bell, Users, Wifi, Server, Briefcase, ChevronDown, User, Shield, Package, CircleDollarSign, Search, Map, Moon, Sun, BookOpen, BarChart3, UserCircle } from 'lucide-react';
import { APP_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { EmployeeRole } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Flex, FlexItem } from './ui/flex';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings' | 'employees' | 'alerts' | 'inventory' | 'finance' | 'map' | 'kb' | 'reports' | 'profile';
  onViewChange: (view: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings' | 'employees' | 'alerts' | 'inventory' | 'finance' | 'map' | 'kb' | 'reports' | 'profile') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const { currentUser, loginAs, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const NavItem: React.FC<{ view: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings' | 'employees' | 'alerts' | 'inventory' | 'finance' | 'map' | 'kb' | 'reports', icon: any, label: string }> = ({ view, icon: Icon, label }) => {
    if (view === 'settings' && !hasPermission('manage_settings')) return null;
    if (view === 'employees' && !hasPermission('manage_team')) return null;
    if (view === 'inventory' && !hasPermission('manage_network') && !hasPermission('view_billing')) return null;
    if ((view === 'finance' || view === 'reports') && !hasPermission('view_billing')) return null;
    
    return (
      <button
        onClick={() => {
          onViewChange(view);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
          currentView === view
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 ${currentView === view ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
        {label}
      </button>
    );
  };

  const NavGroup: React.FC<{ title?: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-1">
      {title && <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-4">{title}</p>}
      {children}
    </div>
  );

  const handleRoleSwitch = (role: EmployeeRole) => {
    loginAs(role);
    setIsProfileMenuOpen(false);
    if (role === EmployeeRole.SUPPORT && (currentView === 'settings' || currentView === 'employees' || currentView === 'network' || currentView === 'inventory' || currentView === 'reports')) {
        onViewChange('dashboard');
    }
  };

  const getRoleColor = (role?: EmployeeRole) => {
      switch (role) {
          case EmployeeRole.ADMIN: return 'bg-purple-600 text-white';
          case EmployeeRole.MANAGER: return 'bg-blue-600 text-white';
          case EmployeeRole.TECHNICIAN: return 'bg-orange-600 text-white';
          default: return 'bg-green-600 text-white';
      }
  };

  const NavigationContent = () => (
    <>
      <NavGroup>
        <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
      </NavGroup>

      <NavGroup title="Operations">
        <NavItem view="alerts" icon={Bell} label="NOC Alerts" />
        <NavItem view="map" icon={Map} label="Coverage Map" />
        <NavItem view="tickets" icon={TicketIcon} label="Helpdesk" />
        <NavItem view="network" icon={Server} label="Network Devices" />
      </NavGroup>

      <NavGroup title="Business">
        <NavItem view="customers" icon={Users} label="Subscribers" />
        <NavItem view="plans" icon={Wifi} label="Service Plans" />
        <NavItem view="finance" icon={CircleDollarSign} label="Finance" />
        <NavItem view="reports" icon={BarChart3} label="Analytics" />
      </NavGroup>

      <NavGroup title="Resources">
        <NavItem view="inventory" icon={Package} label="Warehouse" />
        <NavItem view="kb" icon={BookOpen} label="Knowledge Base" />
        <NavItem view="employees" icon={Briefcase} label="Team" />
      </NavGroup>
    </>
  );

  // Trigger Command Palette via fake keyboard event if clicked
  const triggerCommandPalette = () => {
      const event = new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true,
          bubbles: true
      });
      window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <Flex as="aside" direction="col" className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 fixed h-full z-10 transition-colors duration-200">
        <Flex align="center" className="h-16 px-6 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <Flex align="center" gap={2}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Nexus ISP</span>
          </Flex>
        </Flex>
        
        <FlexItem grow className="overflow-y-auto py-6 px-4 custom-scrollbar">
          <NavigationContent />
        </FlexItem>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex-shrink-0">
          <NavItem view="settings" icon={Settings} label="Settings" />
        </div>
      </Flex>
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-200">
            {/* Mobile Header */}
            <Flex align="center" justify="between" className="md:hidden h-16 px-4">
              <Flex align="center" gap={2}>
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">Nexus ISP</span>
              </Flex>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-400"><Menu /></button>
            </Flex>

            {/* Top Navbar (Desktop) */}
            <Flex align="center" justify="between" className="hidden md:flex h-16 px-8">
              <div className="w-64">
                  <button 
                    onClick={triggerCommandPalette}
                    className="w-full flex items-center justify-between bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm rounded-lg px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                      <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search...</span>
                      <span className="text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-1.5 py-0.5 rounded shadow-sm">⌘K</span>
                  </button>
              </div>
              
              <Flex align="center" gap={4}>
                  {/* Theme Toggle */}
                  <button 
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-full transition-colors"
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                  >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </button>

                  <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2" />

                  <div className="text-sm text-gray-500 dark:text-gray-400 pr-2">
                      <span className="hidden lg:inline">Welcome back, </span><span className="font-semibold text-gray-900 dark:text-white">{currentUser?.name || 'User'}</span>
                  </div>

                  <div className="relative">
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-700 shadow-sm">
                            <AvatarImage src={currentUser?.avatar_url} />
                            <AvatarFallback className={`${getRoleColor(currentUser?.role)} text-xs font-bold`}>
                                {currentUser?.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-2 z-50">
                            
                            <div className="p-2">
                                <button onClick={() => { onViewChange('profile'); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                                    <UserCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" /> My Profile
                                </button>
                            </div>

                            <div className="px-4 py-2 border-t border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Simulate Role (Debug)</p>
                            </div>
                            
                            <div className="p-2">
                                <button onClick={() => handleRoleSwitch(EmployeeRole.ADMIN)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-purple-600" /> Admin
                                </button>
                                <button onClick={() => handleRoleSwitch(EmployeeRole.MANAGER)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-600" /> Manager
                                </button>
                                <button onClick={() => handleRoleSwitch(EmployeeRole.SUPPORT)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-600" /> Support
                                </button>
                                <button onClick={() => handleRoleSwitch(EmployeeRole.TECHNICIAN)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                                    <Server className="w-4 h-4 text-orange-600" /> Technician
                                </button>
                            </div>
                        </div>
                    )}
                  </div>
              </Flex>
            </Flex>
          </header>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-10 bg-gray-800 bg-opacity-50 pt-16 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 w-full h-auto pb-6 shadow-xl rounded-b-2xl animate-in slide-in-from-top-4 duration-300 overflow-y-auto max-h-[80vh]">
                <div className="px-4 py-4 space-y-1">
                  <NavigationContent />
                  <div className="border-t border-gray-100 dark:border-slate-800 my-2 pt-2">
                    <NavItem view="settings" icon={Settings} label="Settings" />
                  </div>
                  <div className="border-t border-gray-100 dark:border-slate-800 my-2 pt-4 px-4 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
                      <button onClick={toggleTheme} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                          {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                      </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        
          {/* Main scrollable content area */}
          <FlexItem as="main" grow className="overflow-y-auto bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
            {children}
          </FlexItem>
      </div>
    </div>
  );
};
