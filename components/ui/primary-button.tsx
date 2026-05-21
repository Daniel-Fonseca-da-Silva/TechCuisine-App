import * as React from 'react';
import { cn } from '@/lib/utils';

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-lime-500 hover:from-amber-600 hover:to-lime-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-105 shadow-lg shadow-lime-500/40 hover:shadow-xl hover:shadow-lime-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(primaryButtonClasses, className)}
      {...props}
    />
  );
}

export { PrimaryButton };
