'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  ...props
}: GlassCardProps) {
  const variantClasses = {
    default: 'bg-[#232323] border-[#2a2a2a] after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/5 after:to-black/5 after:pointer-events-none',
    primary: 'bg-primary/10 border-primary/30 after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/5 after:to-primary/10 after:pointer-events-none',
    secondary: 'bg-secondary/90 border-secondary/50 after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/5 after:to-black/5 after:pointer-events-none',
  };

  return (
    <div
      className={cn(
        'rounded-md border shadow-sm p-4 relative overflow-hidden',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function GlassCardDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function GlassCardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function GlassCardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
