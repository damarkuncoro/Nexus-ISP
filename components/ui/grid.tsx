
import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none' | string;
  rows?: 1 | 2 | 3 | 4 | 5 | 6 | 'none' | string;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | string;
  flow?: 'row' | 'col' | 'row-dense' | 'col-dense';
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'baseline' | 'stretch';
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch';
  placeItems?: 'start' | 'end' | 'center' | 'stretch';
  placeContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch';
  inline?: boolean;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(({
  className,
  cols,
  rows,
  gap,
  flow,
  alignItems,
  justifyItems,
  alignContent,
  justifyContent,
  placeItems,
  placeContent,
  inline = false,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        inline ? 'inline-grid' : 'grid',
        
        // Template Columns
        cols && (typeof cols === 'number' ? `grid-cols-${cols}` : cols),
        
        // Template Rows
        rows && (typeof rows === 'number' ? `grid-rows-${rows}` : rows),
        
        // Gap
        typeof gap === 'number' ? `gap-${gap}` : gap,

        // Auto Flow
        flow === 'row' && 'grid-flow-row',
        flow === 'col' && 'grid-flow-col',
        flow === 'row-dense' && 'grid-flow-row-dense',
        flow === 'col-dense' && 'grid-flow-col-dense',

        // Align Items
        alignItems === 'start' && 'items-start',
        alignItems === 'end' && 'items-end',
        alignItems === 'center' && 'items-center',
        alignItems === 'baseline' && 'items-baseline',
        alignItems === 'stretch' && 'items-stretch',

        // Justify Items
        justifyItems === 'start' && 'justify-items-start',
        justifyItems === 'end' && 'justify-items-end',
        justifyItems === 'center' && 'justify-items-center',
        justifyItems === 'stretch' && 'justify-items-stretch',

        // Align Content
        alignContent === 'start' && 'content-start',
        alignContent === 'end' && 'content-end',
        alignContent === 'center' && 'content-center',
        alignContent === 'between' && 'content-between',
        alignContent === 'around' && 'content-around',
        alignContent === 'evenly' && 'content-evenly',
        alignContent === 'baseline' && 'content-baseline',
        alignContent === 'stretch' && 'content-stretch',

        // Justify Content
        justifyContent === 'start' && 'justify-start',
        justifyContent === 'end' && 'justify-end',
        justifyContent === 'center' && 'justify-center',
        justifyContent === 'between' && 'justify-between',
        justifyContent === 'around' && 'justify-around',
        justifyContent === 'evenly' && 'justify-evenly',
        justifyContent === 'stretch' && 'justify-stretch',

        // Place Items (shorthand)
        placeItems === 'start' && 'place-items-start',
        placeItems === 'end' && 'place-items-end',
        placeItems === 'center' && 'place-items-center',
        placeItems === 'stretch' && 'place-items-stretch',

        // Place Content (shorthand)
        placeContent === 'start' && 'place-content-start',
        placeContent === 'end' && 'place-content-end',
        placeContent === 'center' && 'place-content-center',
        placeContent === 'between' && 'place-content-between',
        placeContent === 'around' && 'place-content-around',
        placeContent === 'evenly' && 'place-content-evenly',
        placeContent === 'stretch' && 'place-content-stretch',

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Grid.displayName = "Grid";

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto';
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'auto';
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full' | 'auto';
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'auto';
  rowEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'auto';
  order?: number | 'first' | 'last' | 'none';
  justifySelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  placeSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
}

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(({
  className,
  colSpan,
  colStart,
  colEnd,
  rowSpan,
  rowStart,
  rowEnd,
  order,
  justifySelf,
  alignSelf,
  placeSelf,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Col Span
        colSpan === 'full' && 'col-span-full',
        colSpan === 'auto' && 'col-auto',
        typeof colSpan === 'number' && `col-span-${colSpan}`,

        // Col Start
        colStart === 'auto' && 'col-start-auto',
        typeof colStart === 'number' && `col-start-${colStart}`,

        // Col End
        colEnd === 'auto' && 'col-end-auto',
        typeof colEnd === 'number' && `col-end-${colEnd}`,

        // Row Span
        rowSpan === 'full' && 'row-span-full',
        rowSpan === 'auto' && 'row-auto',
        typeof rowSpan === 'number' && `row-span-${rowSpan}`,

        // Row Start
        rowStart === 'auto' && 'row-start-auto',
        typeof rowStart === 'number' && `row-start-${rowStart}`,

        // Row End
        rowEnd === 'auto' && 'row-end-auto',
        typeof rowEnd === 'number' && `row-end-${rowEnd}`,

        // Order
        order === 'first' && 'order-first',
        order === 'last' && 'order-last',
        order === 'none' && 'order-none',
        typeof order === 'number' && `order-${order}`,

        // Justify Self
        justifySelf === 'auto' && 'justify-self-auto',
        justifySelf === 'start' && 'justify-self-start',
        justifySelf === 'end' && 'justify-self-end',
        justifySelf === 'center' && 'justify-self-center',
        justifySelf === 'stretch' && 'justify-self-stretch',

        // Align Self
        alignSelf === 'auto' && 'self-auto',
        alignSelf === 'start' && 'self-start',
        alignSelf === 'end' && 'self-end',
        alignSelf === 'center' && 'self-center',
        alignSelf === 'stretch' && 'self-stretch',
        alignSelf === 'baseline' && 'self-baseline',

        // Place Self
        placeSelf === 'auto' && 'place-self-auto',
        placeSelf === 'start' && 'place-self-start',
        placeSelf === 'end' && 'place-self-end',
        placeSelf === 'center' && 'place-self-center',
        placeSelf === 'stretch' && 'place-self-stretch',

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
GridItem.displayName = "GridItem";

export { Grid, GridItem };
