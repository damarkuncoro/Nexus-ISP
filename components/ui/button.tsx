
import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const variants = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm border-transparent",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border-transparent",
  outline: "bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm border-transparent",
  link: "text-primary-600 underline-offset-4 hover:underline bg-transparent border-transparent p-0 h-auto",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2 text-sm",
  lg: "h-12 px-8 text-base",
  icon: "h-10 w-10 p-2 flex items-center justify-center",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 border",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
