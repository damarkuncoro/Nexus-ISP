
import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
  icon?: LucideIcon | React.ElementType;
}

const variants = {
  default: "border-transparent bg-primary-100 text-primary-800 hover:bg-primary-200",
  secondary: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
  outline: "text-gray-900 border-gray-200",
  destructive: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
  success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
  warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
  info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
};

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = 'default', icon: Icon, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </div>
  );
});
Badge.displayName = "Badge";

export { Badge };
