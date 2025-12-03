
import React, { createContext, useContext, useState, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

// --- Root Accordion ---
interface AccordionContextType {
  openItem: string | undefined;
  setOpenItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single'; // Currently supports single open item
  defaultValue?: string;
  collapsible?: boolean;
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(({ 
  children, 
  className, 
  type = 'single', 
  defaultValue,
  collapsible = true,
  ...props 
}, ref) => {
  const [openItem, setOpenItem] = useState<string | undefined>(defaultValue);

  const handleSetOpenItem = (value: string) => {
    if (openItem === value && collapsible) {
        setOpenItem(undefined);
    } else {
        setOpenItem(value);
    }
  };

  return (
    <AccordionContext.Provider value={{ openItem, setOpenItem: handleSetOpenItem }}>
      <div ref={ref} className={cn("space-y-1", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});
Accordion.displayName = "Accordion";

// --- Accordion Item ---
interface AccordionItemContextType {
  value: string;
}
const AccordionItemContext = createContext<AccordionItemContextType | undefined>(undefined);

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(({ 
  children, 
  className, 
  value, 
  ...props 
}, ref) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div 
        ref={ref} 
        className={cn("border-b border-gray-200", className)} 
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
});
AccordionItem.displayName = "AccordionItem";

// --- Accordion Trigger ---
const AccordionTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ 
  children, 
  className, 
  ...props 
}, ref) => {
  const rootContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!rootContext || !itemContext) {
    throw new Error("AccordionTrigger must be used within Accordion and AccordionItem");
  }

  const isOpen = rootContext.openItem === itemContext.value;

  return (
    <button
      ref={ref}
      onClick={() => rootContext.setOpenItem(itemContext.value)}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full text-left text-sm text-gray-900 [&[data-state=open]>svg]:rotate-180",
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      type="button"
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-gray-500" />
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

// --- Accordion Content ---
const AccordionContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ 
  children, 
  className, 
  ...props 
}, ref) => {
  const rootContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!rootContext || !itemContext) {
    throw new Error("AccordionContent must be used within Accordion and AccordionItem");
  }

  const isOpen = rootContext.openItem === itemContext.value;

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all animate-in slide-in-from-top-1 duration-200",
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0 text-gray-600">
        {children}
      </div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
