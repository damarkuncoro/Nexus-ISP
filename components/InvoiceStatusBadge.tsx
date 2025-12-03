import React from 'react';
import { InvoiceStatus } from '../types';
import { InvoiceStatusBadge as SharedInvoiceBadge } from './StatusBadges';

export const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  return <SharedInvoiceBadge status={status} />;
};