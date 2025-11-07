import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: React.ReactNode;
  labelPosition?: 'top' | 'bottom';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefix, suffix, label, labelPosition = 'top', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && labelPosition === 'top' && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="relative flex items-center">
          {prefix && (
            <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">{prefix}</div>
          )}
          <input
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background transition-all duration-200 hover:ring-1 hover:ring-ring/20 hover:shadow-md file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              prefix && 'pl-6',
              suffix && 'pr-8',
              className,
            )}
            ref={ref}
            type={type}
            {...props}
          />
          {suffix && (
            <div className="pointer-events-none absolute right-3 flex items-center text-muted-foreground">{suffix}</div>
          )}
        </div>
        {label && labelPosition === 'bottom' && <label className="text-sm text-muted-foreground">{label}</label>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
