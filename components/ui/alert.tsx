
import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  title?: string;
}

const variants = {
  default: "bg-blue-50 text-blue-900 border-blue-200 [&>svg]:text-blue-600 dark:bg-blue-900/20 dark:text-blue-100 dark:border-blue-800 dark:[&>svg]:text-blue-400",
  destructive: "bg-red-50 text-red-900 border-red-200 [&>svg]:text-red-600 dark:bg-red-900/20 dark:text-red-100 dark:border-red-800 dark:[&>svg]:text-red-400",
  success: "bg-green-50 text-green-900 border-green-200 [&>svg]:text-green-600 dark:bg-green-900/20 dark:text-green-100 dark:border-green-800 dark:[&>svg]:text-green-400",
  warning: "bg-amber-50 text-amber-900 border-amber-200 [&>svg]:text-amber-600 dark:bg-amber-900/20 dark:text-amber-100 dark:border-amber-800 dark:[&>svg]:text-amber-400",
};

const icons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(({ className, variant = 'default', title, children, ...props }, ref) => {
  const Icon = icons[variant];

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-5 [&>svg]:w-5",
        variants[variant],
        className
      )}
      {...props}
    >
      <Icon />
      {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
      <div className="text-sm [&_p]:leading-relaxed">{children}</div>
    </div>
  );
});
Alert.displayName = "Alert";

export { Alert };
