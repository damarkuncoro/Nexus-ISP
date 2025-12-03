
import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { Search, Mail, Building, Trash2, MapPin, Wifi, ChevronRight } from 'lucide-react';
import { CustomerStatusBadge } from './StatusBadges';
import { Flex, FlexItem } from './ui/flex';
import { Grid, GridItem } from './ui/grid';
import { Input } from './ui/input';

interface CustomerListProps {
  customers: Customer[];
  onDelete: (id: string) => void;
  onSelect?: (customer: Customer) => void;
  initialSearch?: string;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onDelete, onSelect, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Flex align="center" className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            className="pl-10"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Flex>

      <ul className="divide-y divide-gray-100">
        {filteredCustomers.map((customer) => (
          <li 
            key={customer.id} 
            onClick={() => onSelect && onSelect(customer)}
            className={`hover:bg-gray-50 transition-colors duration-150 group ${onSelect ? 'cursor-pointer' : ''}`}
          >
            <Flex align="center" justify="between" className="px-4 py-4 sm:px-6">
              <FlexItem grow className="min-w-0">
                <Flex align="center" gap={3}>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{customer.name}</h3>
                  <CustomerStatusBadge status={customer.account_status} />
                  {customer.company && (
                     <Flex as="span" align="center" className="text-xs text-gray-400">
                        <Building className="w-3 h-3 mr-1" />
                        {customer.company}
                     </Flex>
                  )}
                </Flex>
                
                <Grid cols={1} className="sm:grid-cols-2 mt-2 gap-2 text-sm text-gray-500">
                  <Flex align="center">
                    <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </Flex>
                  {customer.subscription_plan && (
                    <Flex align="center">
                      <Wifi className="flex-shrink-0 mr-1.5 h-4 w-4 text-primary-400" />
                      <span className="font-medium text-gray-700">{customer.subscription_plan}</span>
                    </Flex>
                  )}
                  {customer.address && (
                    <Flex align="center" className="col-span-1 sm:col-span-2">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="truncate">{customer.address}</span>
                    </Flex>
                  )}
                </Grid>
              </FlexItem>
              
              <Flex align="center" gap={4} className="ml-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(customer.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Customer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                {onSelect && (
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                )}
              </Flex>
            </Flex>
          </li>
        ))}
        {filteredCustomers.length === 0 && (
          <li className="px-4 py-12 text-center text-gray-500 text-sm">
            {customers.length === 0 
              ? "No subscribers yet. Create one to get started." 
              : "No subscribers found matching your search."}
          </li>
        )}
      </ul>
    </div>
  );
};
