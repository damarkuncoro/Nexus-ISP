
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface DropdownMenuProps {
  children: React.ReactNode;
}

const DropdownContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ className, onClick, children, asChild, ...props }, ref) => {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      e.stopPropagation(); // Prevent card click
      context.setOpen(!context.open);
    };

    if (asChild && React.isValidElement(children)) {
       const child = children as React.ReactElement<any>;
       return React.cloneElement(child, {
           onClick: handleClick,
           ref,
           className: cn(className, child.props.className)
       });
    }

    return (
      <button ref={ref} onClick={handleClick} className={cn(className)} {...props}>
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' | 'center' }>(
  ({ className, children, align = 'end', ...props }, ref) => {
    const context = React.useContext(DropdownContext);
    const contentRef = useRef<HTMLDivElement>(null);

    if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          context.setOpen(false);
        }
      };
      if (context.open) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [context.open]);

    if (!context.open) return null;

    const alignClass = align === 'end' ? 'right-0' : align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2';

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 origin-top-right",
          alignClass,
          className
        )}
        {...props}
      >
        <div className="py-1">{children}</div>
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownContext);
    
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(e);
        e.stopPropagation();
        context?.setOpen(false);
    }

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer flex items-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </div>
  )
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-px bg-gray-100 my-1", className)} {...props} />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
