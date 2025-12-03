
import React, { useState } from 'react';
import { LayoutDashboard, Ticket as TicketIcon, Settings, Menu, X, Bell, Users, Wifi, Server, Briefcase, ChevronDown, User, Shield } from 'lucide-react';
import { APP_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeRole } from '../types';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Flex, FlexItem } from './ui/flex';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings' | 'employees' | 'alerts';
  onViewChange: (view: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings' | 'employees' | 'alerts') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const { currentUser, loginAs, hasPermission } = useAuth();

  const NavItem = ({ view, icon: Icon, label }: { view: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings' | 'employees' | 'alerts', icon: any, label: string }) => {
    if (view === 'settings' && !hasPermission('manage_settings')) return null;
    if (view === 'employees' && !hasPermission('manage_team')) return null;
    
    return (
      <button
        onClick={() => {
          onViewChange(view);
          setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
          currentView === view
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 ${currentView === view ? 'text-primary-600' : 'text-gray-400'}`} />
        {label}
      </button>
    );
  };

  const handleRoleSwitch = (role: EmployeeRole) => {
    loginAs(role);
    setIsProfileMenuOpen(false);
    if (role === EmployeeRole.SUPPORT && (currentView === 'settings' || currentView === 'employees' || currentView === 'network')) {
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

  return (
    <Flex className="min-h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <Flex align="center" className="h-16 px-6 border-b border-gray-100">
          <Flex align="center" gap={2}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Nexus ISP</span>
          </Flex>
        </Flex>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="alerts" icon={Bell} label="NOC Alerts" />
          <NavItem view="tickets" icon={TicketIcon} label="All Tickets" />
          <NavItem view="customers" icon={Users} label="Subscribers" />
          <NavItem view="plans" icon={Wifi} label="Service Plans" />
          <NavItem view="network" icon={Server} label="Network Devices" />
          <NavItem view="employees" icon={Briefcase} label="Team" />
        </div>

        <div className="p-4 border-t border-gray-100">
          <NavItem view="settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Mobile Header */}
      <Flex align="center" justify="between" className="md:hidden fixed w-full bg-white z-20 border-b border-gray-200 h-16 px-4">
        <Flex align="center" gap={2}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            N
          </div>
          <span className="text-lg font-bold text-gray-900">Nexus ISP</span>
        </Flex>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </Flex>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-gray-800 bg-opacity-50 pt-16">
          <div className="bg-white w-full h-auto pb-6 shadow-xl rounded-b-2xl">
            <div className="px-4 py-2 space-y-1">
               <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
               <NavItem view="alerts" icon={Bell} label="NOC Alerts" />
               <NavItem view="tickets" icon={TicketIcon} label="All Tickets" />
               <NavItem view="customers" icon={Users} label="Subscribers" />
               <NavItem view="plans" icon={Wifi} label="Service Plans" />
               <NavItem view="network" icon={Server} label="Network Devices" />
               <NavItem view="employees" icon={Briefcase} label="Team" />
               <div className="border-t border-gray-100 my-2 pt-2">
                 <NavItem view="settings" icon={Settings} label="Settings" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <FlexItem grow className="md:ml-64 pt-16 md:pt-0 min-h-screen" as="main">
        {/* Top Navbar (Desktop) */}
        <Flex align="center" justify="between" className="hidden md:flex h-16 bg-white border-b border-gray-200 px-8 sticky top-0 z-10">
           <div className="text-sm text-gray-500">
              Welcome back, <span className="font-semibold text-gray-900">{currentUser?.name || 'User'}</span>
           </div>
           
           <Flex align="center" gap={4}>
              <div className="relative">
                 <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                 >
                    <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                        <AvatarFallback className={`${getRoleColor(currentUser?.role)} text-xs font-bold`}>
                            {currentUser?.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="text-left hidden lg:block">
                        <p className="text-xs font-bold text-gray-700">{currentUser?.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{currentUser?.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                 </button>

                 {/* Role Switcher / Profile Menu */}
                 {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-50">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Simulate Role</p>
                        </div>
                        <button onClick={() => handleRoleSwitch(EmployeeRole.ADMIN)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-600" /> Admin
                        </button>
                        <button onClick={() => handleRoleSwitch(EmployeeRole.MANAGER)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" /> Manager
                        </button>
                        <button onClick={() => handleRoleSwitch(EmployeeRole.SUPPORT)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-600" /> Support
                        </button>
                        <button onClick={() => handleRoleSwitch(EmployeeRole.TECHNICIAN)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Server className="w-4 h-4 text-orange-600" /> Technician
                        </button>
                    </div>
                 )}
              </div>
           </Flex>
        </Flex>
        
        {children}
      </FlexItem>
    </Flex>
  );
};
