
import React, { forwardRef, ElementType } from 'react';
import { cn } from '../../utils/cn';

export interface FlexProps extends React.HTMLAttributes<HTMLElement> {
  as?: ElementType;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | string;
  inline?: boolean;
}

const Flex = forwardRef<HTMLElement, FlexProps>(({
  className,
  as: Component = 'div',
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap,
  inline = false,
  children,
  ...props
}, ref) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  return (
    <Component
      ref={ref}
      className={cn(
        inline ? 'inline-flex' : 'flex',
        directionClasses[direction],
        wrapClasses[wrap],
        justifyClasses[justify],
        alignClasses[align],
        typeof gap === 'number' ? `gap-${gap}` : gap, // Supports tailwind gap-X classes if passed as string or standard numbers
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
Flex.displayName = "Flex";

export interface FlexItemProps extends React.HTMLAttributes<HTMLElement> {
  as?: ElementType;
  grow?: boolean | number;
  shrink?: boolean | number;
  basis?: string;
  order?: number | 'first' | 'last' | 'none';
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch' | 'baseline';
}

const FlexItem = forwardRef<HTMLElement, FlexItemProps>(({
  className,
  as: Component = 'div',
  grow,
  shrink,
  basis,
  order,
  alignSelf,
  children,
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={cn(
        // Flex Grow
        grow === true && 'grow',
        grow === 0 && 'grow-0',
        grow === 1 && 'grow',
        
        // Flex Shrink
        shrink === true && 'shrink',
        shrink === 0 && 'shrink-0',
        shrink === 1 && 'shrink',
        
        // Flex Basis
        basis && `basis-${basis}`,
        
        // Order
        order === 'first' && 'order-first',
        order === 'last' && 'order-last',
        order === 'none' && 'order-none',
        typeof order === 'number' && `order-${order}`,

        // Align Self
        alignSelf === 'auto' && 'self-auto',
        alignSelf === 'start' && 'self-start',
        alignSelf === 'end' && 'self-end',
        alignSelf === 'center' && 'self-center',
        alignSelf === 'stretch' && 'self-stretch',
        alignSelf === 'baseline' && 'self-baseline',
        
        className
      )}
      style={{ flexBasis: basis && !basis.startsWith('basis-') ? basis : undefined }}
      {...props}
    >
      {children}
    </Component>
  );
});
FlexItem.displayName = "FlexItem";

export { Flex, FlexItem };