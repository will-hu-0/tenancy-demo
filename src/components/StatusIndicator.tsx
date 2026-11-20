import React from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface StatusIndicatorProps {
  status:
    | 'Paid'
    | 'Unpaid'
    | 'Overdue'
    | 'Completed'
    | 'Active'
    | 'Expiring Soon'
    | 'Renewed'
    | 'SIGNED'
    | 'PENDING';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  switch (status) {
    case 'Paid':
    case 'Active':
    case 'Completed':
    case 'SIGNED':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] bg-[#ECFDF5] border border-[#BBF7D0] px-2.5 py-1 rounded-md whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          {status === 'SIGNED' ? 'Signed' : status}
        </span>
      );
    case 'Renewed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-brand-soft border border-brand-line px-2.5 py-1 rounded-md whitespace-nowrap">
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          Renewed
        </span>
      );
    case 'Unpaid':
    case 'Expiring Soon':
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C2410C] bg-[#FFF7ED] border border-[#FED7AA] px-2.5 py-1 rounded-md whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {status === 'Unpaid' ? 'Due' : status === 'PENDING' ? 'Pending' : 'Expiring Soon'}
        </span>
      );
    case 'Overdue':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 rounded-md whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Overdue
        </span>
      );
  }
};
