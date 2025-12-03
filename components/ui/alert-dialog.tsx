import React, { createContext, useContext, useState, useEffect, forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Button, ButtonProps } from './button';

// --- Context ---
interface AlertDialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error("AlertDialog components must be used within an AlertDialog");
  }
  return context;
};

// --- Root ---
interface AlertDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ 
  children, 
  open: controlledOpen, 
  onOpenChange, 
  defaultOpen = false 
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange! : setUncontrolledOpen;

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

// --- Trigger ---
interface AlertDialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const AlertDialogTrigger = forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(({ className, children, onClick, asChild, ...props }, ref) => {
  const { setOpen } = useAlertDialog();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      ref,
      onClick: (e: React.MouseEvent) => {
        if (child.props.onClick) {
          child.props.onClick(e);
        }
        setOpen(true);
        onClick?.(e as any);
      },
      ...props,
      className: cn(className, child.props.className)
    });
  }

  return (
    <button
      ref={ref}
      className={cn(className)}
      onClick={(e) => {
        setOpen(true);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

// --- Content ---
const AlertDialogContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = useAlertDialog();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Prevent scrolling when open
  useEffect(() => {
      if (open) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = '';
      }
      return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        ref={ref}
        role="alertdialog"
        className={cn(
          "relative z-50 grid w-full max-w-lg scale-100 gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg md:w-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

// --- Header ---
const AlertDialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

// --- Title ---
const AlertDialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold text-gray-900", className)} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

// --- Description ---
const AlertDialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

// --- Footer ---
const AlertDialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

// --- Action Button ---
const AlertDialogAction = forwardRef<HTMLButtonElement, ButtonProps>(({ className, onClick, ...props }, ref) => {
  const { setOpen } = useAlertDialog();
  
  return (
    <Button
      ref={ref}
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e);
        // Only close if default wasn't prevented (allowing for async validation handling by user if they prevent default)
        if (!e.defaultPrevented) {
             setOpen(false);
        }
      }}
      {...props}
    />
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

// --- Cancel Button ---
const AlertDialogCancel = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "outline", onClick, ...props }, ref) => {
  const { setOpen } = useAlertDialog();

  return (
    <Button
      ref={ref}
      variant={variant}
      className={cn("mt-2 sm:mt-0", className)}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};