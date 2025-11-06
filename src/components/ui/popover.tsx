'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Popover as PopoverPrimitive } from 'radix-ui';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content> & {
  variant?: 'default' | 'unstyled';
};

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  variant = 'default',
  ...props
}: PopoverContentProps) {
  const motionClasses =
    'z-50 outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2';
  const surfaceClasses =
    'w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md shadow-black/5';

  return (
    <PopoverPrimitive.PopoverPortal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          motionClasses,
          variant === 'default' ? surfaceClasses : 'w-auto',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.PopoverPortal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverContent, PopoverTrigger, PopoverAnchor };
