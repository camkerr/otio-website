'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import * as SheetPrimitive from '@radix-ui/react-dialog';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-1200 bg-black/80',
      'data-[state=open]:animate-sheet-overlay-in',
      'data-[state=closed]:animate-sheet-overlay-out',
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-[1200] gap-4 bg-background shadow-lg',
  {
    defaultVariants: {
      side: 'right',
    },
    variants: {
      side: {
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=open]:[animation:var(--animate-sheet-slide-in-from-bottom)] data-[state=closed]:[animation:var(--animate-sheet-slide-out-to-bottom)]',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=open]:[animation:var(--animate-sheet-slide-in-from-left)] data-[state=closed]:[animation:var(--animate-sheet-slide-out-to-left)] sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=open]:[animation:var(--animate-sheet-slide-in-from-right)] data-[state=closed]:[animation:var(--animate-sheet-slide-out-to-right)] sm:max-w-sm',
        top: 'inset-x-0 top-0 border-b data-[state=open]:[animation:var(--animate-sheet-slide-in-from-top)] data-[state=closed]:[animation:var(--animate-sheet-slide-out-to-top)]',
      },
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
  VariantProps<typeof sheetVariants> {
  showCloseButton?: boolean;
}

const SheetContent = React.forwardRef<React.ComponentRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = 'right', className, children, showCloseButton = true, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          sheetVariants({ side }),
          // Layout for sticky header/footer
          'flex flex-col max-h-full',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            className={cn(
              // Base button styles - aligned with header
              'absolute top-[calc((var(--top-nav-height)-2rem)/2)] right-4 z-10',
              'inline-flex items-center justify-center',
              'h-8 w-8', // Larger click target
              'rounded-md',
              // Colors and states
              'text-muted-foreground',
              'bg-background dark:bg-muted',
              // Skeumorphic shadows - default neutral/raised
              '[box-shadow:var(--sidebar-shadow-raised)]',
              // Hover state - slightly more raised
              'hover:text-foreground',
              'hover:[box-shadow:var(--sidebar-shadow-md)]',
              // Active/pressed state - inset (recessed)
              'active:[box-shadow:var(--sidebar-shadow-inset)]',
              // Focus state
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'focus:[box-shadow:var(--sidebar-shadow-raised)]',
              // Transitions
              'transition-all duration-200',
              // Disabled state
              'disabled:pointer-events-none disabled:opacity-50',
              // Icon sizing
              '[&_svg]:h-4 [&_svg]:w-4'
            )}
          >
            <X />
            <span className="sr-only">Close sheet</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-left bg-background',
      // Sticky header styles
      'shrink-0 p-6',
      // Border
      'border-b',
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

const SheetBody = ({
  className,
  variant = 'scrollable',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'scrollable' | 'static';
}) => {
  const [scrollState, setScrollState] = React.useState({
    canScrollDown: false,
    canScrollUp: false,
  });
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const checkScrollPosition = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const threshold = 1; // Small threshold to account for rounding

    setScrollState({
      canScrollDown: scrollTop < scrollHeight - clientHeight - threshold,
      canScrollUp: scrollTop > threshold,
    });
  }, []);

  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element || variant !== 'scrollable') return;

    // Initial check
    checkScrollPosition();

    // Add scroll listener
    element.addEventListener('scroll', checkScrollPosition, { passive: true });

    // Add resize observer to handle content changes
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition, variant]);

  if (variant === 'static') {
    return (
      <div
        className={cn('flex-1 p-6 py-0 overflow-hidden', className)}
        {...props}
      />
    );
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Top shadow */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none',
          'bg-linear-to-b from-background from-30% via-background/70 to-transparent',
          'shadow-[inset_0_8px_16px_-8px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_8px_16px_-8px_rgba(100,116,139,0.2)]',
          'transition-opacity duration-200 ease-out',
          scrollState.canScrollUp ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Scrollable content */}
      <div
        className={cn(
          // Base styles
          'flex-1 p-6 py-0 min-h-0',
          // Scrolling styles
          'overflow-y-auto',
          // Custom scrollbar styling
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40',
          className
        )}
        ref={scrollRef}
        {...props}
      />

      {/* Bottom shadow */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute bottom-0 left-0 right-0 h-8 z-10 pointer-events-none',
          'bg-linear-to-t from-background from-30% via-background/70 to-transparent',
          'shadow-[inset_0_-8px_16px_-8px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_-8px_16px_-8px_rgba(100,116,139,0.2)]',
          'transition-opacity duration-200 ease-out',
          scrollState.canScrollDown ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};
SheetBody.displayName = 'SheetBody';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-4 sm:flex-row sm:justify-end',
      // Sticky footer styles
      'shrink-0 p-6',
      // Border
      'border-t',
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    className={cn('text-lg font-semibold text-foreground', className)}
    ref={ref}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    className={cn('text-sm text-muted-foreground', className)}
    ref={ref}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};