import React, { useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
}

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-full max-w-sm space-y-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        const colorClass = colors[toast.type];

        return (
          <Toast
            key={toast.id}
            message={toast.message}
            onDismiss={() => removeToast(toast.id)}
            icon={<Icon className="h-5 w-5" />}
            className={colorClass}
          />
        );
      })}
    </div>
  );
};

interface ToastProps {
  message: string;
  onDismiss: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss, icon, className }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={cn(
        "pointer-events-auto w-full overflow-hidden rounded-lg border shadow-lg ring-1 ring-black ring-opacity-5 flex items-start p-4 animate-in slide-in-from-bottom-4 duration-300",
        className
    )}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-3 flex-1 pt-0.5">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <div className="ml-4 flex flex-shrink-0">
        <button
          onClick={onDismiss}
          className="inline-flex rounded-md bg-transparent text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span className="sr-only">Close</span>
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
