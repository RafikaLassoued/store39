import * as React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost' | 'whatsapp' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
  }
>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-gradient-to-l from-[#8b1a2b] to-[#a0253a] text-white hover:from-[#7a1525] hover:to-[#8f1f33] shadow-lg shadow-[#8b1a2b]/20 focus:ring-[#8b1a2b]/50':
            variant === 'default',
          'border-2 border-[#8b1a2b]/20 text-[#8b1a2b] hover:bg-[#8b1a2b]/5 focus:ring-[#8b1a2b]/50':
            variant === 'outline',
          'text-[#8b1a2b] hover:bg-[#8b1a2b]/5 focus:ring-[#8b1a2b]/50':
            variant === 'ghost',
          'bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/20 focus:ring-[#25D366]/50':
            variant === 'whatsapp',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50':
            variant === 'danger',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-8 py-3.5 text-base': size === 'lg',
          'p-2': size === 'icon',
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };
