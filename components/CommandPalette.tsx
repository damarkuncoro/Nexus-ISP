
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Ticket as TicketIcon, LayoutDashboard, Server, Users, Wifi, Settings, 
  CreditCard, Package, LogOut, Bell, UserPlus, FileText, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import { Customer, Ticket } from '../types';

interface CommandPaletteProps {
  onNavigate: (view: any) => void;
  actions: {
    createTicket: () => void;
    createCustomer: () => void;
    createDevice: () => void;
    createPlan: () => void;
    logout: () => void;
  };
  customers?: Customer[];
  tickets?: Ticket[];
  onSelectCustomer?: (customerId: string) => void;
  onSelectTicket?: (ticket: Ticket) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  group: string;
  action: () => void;
  shortcut?: string;
  role?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  onNavigate, 
  actions, 
  customers = [], 
  tickets = [],
  onSelectCustomer,
  onSelectTicket
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { hasPermission } = useAuth();

  // Define static commands
  const staticCommands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'nav-dash', label: 'Go to Dashboard', icon: LayoutDashboard, group: 'Navigation', action: () => onNavigate('dashboard') },
    { id: 'nav-alerts', label: 'Go to NOC Alerts', icon: Bell, group: 'Navigation', action: () => onNavigate('alerts') },
    { id: 'nav-tickets', label: 'Go to Tickets', icon: TicketIcon, group: 'Navigation', action: () => onNavigate('tickets') },
    { id: 'nav-cust', label: 'Go to Subscribers', icon: Users, group: 'Navigation', action: () => onNavigate('customers') },
    { id: 'nav-net', label: 'Go to Network Devices', icon: Server, group: 'Navigation', action: () => onNavigate('network'), role: 'manage_network' },
    { id: 'nav-inv', label: 'Go to Inventory', icon: Package, group: 'Navigation', action: () => onNavigate('inventory'), role: 'manage_network' },
    { id: 'nav-plans', label: 'Go to Service Plans', icon: Wifi, group: 'Navigation', action: () => onNavigate('plans'), role: 'manage_settings' },
    { id: 'nav-fin', label: 'Go to Finance & Billing', icon: CreditCard, group: 'Navigation', action: () => onNavigate('finance'), role: 'view_billing' },
    { id: 'nav-set', label: 'Go to Settings', icon: Settings, group: 'Navigation', action: () => onNavigate('settings'), role: 'manage_settings' },

    // Actions
    { id: 'act-ticket', label: 'Create New Ticket', icon: TicketIcon, group: 'Actions', action: actions.createTicket, shortcut: 'C T' },
    { id: 'act-cust', label: 'Register Subscriber', icon: UserPlus, group: 'Actions', action: actions.createCustomer, shortcut: 'C S' },
    { id: 'act-dev', label: 'Add Network Device', icon: Server, group: 'Actions', action: actions.createDevice, role: 'manage_network' },
    
    // System
    { id: 'sys-logout', label: 'Log Out', icon: LogOut, group: 'System', action: () => { actions.logout(); }, shortcut: 'Alt Q' }
  ], [onNavigate, actions, hasPermission]);

  const filteredCommands = useMemo(() => {
    // 1. Filter static commands
    const staticMatches = staticCommands.filter(cmd => {
      const matchesSearch = cmd.label.toLowerCase().includes(query.toLowerCase());
      const matchesRole = !cmd.role || hasPermission(cmd.role as any);
      return matchesSearch && matchesRole;
    });

    if (!query) return staticMatches;

    // 2. Search Customers (limit 3)
    const customerMatches: CommandItem[] = customers
        .filter(c => 
            c.name.toLowerCase().includes(query.toLowerCase()) || 
            c.email.toLowerCase().includes(query.toLowerCase()) ||
            c.company?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map(c => ({
            id: `cust-${c.id}`,
            label: c.name,
            description: c.email,
            icon: User,
            group: 'Subscribers',
            action: () => onSelectCustomer && onSelectCustomer(c.id)
        }));

    // 3. Search Tickets (limit 3)
    const ticketMatches: CommandItem[] = tickets
        .filter(t => 
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.id.includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map(t => ({
            id: `tick-${t.id}`,
            label: t.title,
            description: `#${t.id.slice(0,8)} • ${t.status.replace('_', ' ')}`,
            icon: FileText,
            group: 'Tickets',
            action: () => onSelectTicket && onSelectTicket(t)
        }));

    return [...staticMatches, ...customerMatches, ...ticketMatches];
  }, [query, customers, tickets, hasPermission, staticCommands, onSelectCustomer, onSelectTicket]);

  // Toggle Open/Close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation Logic
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Reset index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (command: CommandItem) => {
    command.action();
    setIsOpen(false);
    setQuery('');
  };

  // Group commands for rendering
  const groupedCommands = useMemo(() => {
      const groups: Record<string, CommandItem[]> = {};
      filteredCommands.forEach(cmd => {
          if (!groups[cmd.group]) groups[cmd.group] = [];
          groups[cmd.group].push(cmd);
      });
      // Sort groups logic if needed, but iteration order usually preserves insertion order
      return groups;
  }, [filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
        <div className="flex items-center px-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            className="w-full py-4 text-base bg-transparent border-none outline-none placeholder:text-gray-400 text-gray-900"
            placeholder="Type a command, customer name, or ticket ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 font-mono">Esc</div>
        </div>

        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No results found.
            </div>
          ) : (
            <div className="space-y-1">
              {Object.entries(groupedCommands).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                      {group}
                    </div>
                    {items.map((item) => {
                      const isActive = filteredCommands.indexOf(item) === selectedIndex;
                      const Icon = item.icon;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(filteredCommands.indexOf(item))}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                            isActive ? "bg-primary-50 text-primary-900" : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary-600" : "text-gray-400")} />
                            <div className="flex flex-col min-w-0">
                                <span className={cn("text-sm truncate", isActive && "font-medium")}>{item.label}</span>
                                {item.description && <span className={cn("text-xs truncate", isActive ? "text-primary-600/70" : "text-gray-400")}>{item.description}</span>}
                            </div>
                          </div>
                          {item.shortcut && (
                            <span className="text-xs text-gray-400 font-mono tracking-wider ml-4">{item.shortcut}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <div className="flex gap-2">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
            </div>
            <span>Nexus ISP Manager</span>
        </div>
      </div>
    </div>
  );
};
