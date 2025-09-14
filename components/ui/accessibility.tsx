import React from 'react'
import { cn } from '@/lib/utils'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  ariaLabel?: string
  children: React.ReactNode
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  ariaLabel,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95',
  ].join(' ')

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-600 hover:border-blue-700',
    secondary: 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-600 hover:border-green-700',
    outline: 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border-2 border-transparent',
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]', // Minimum 36px height for touch targets
    md: 'px-4 py-2 text-base min-h-[44px]', // Minimum 44px height for accessibility
    lg: 'px-6 py-3 text-lg min-h-[48px]', // Larger touch targets
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

interface AccessibleLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
  external?: boolean
  ariaLabel?: string
}

const AccessibleLink: React.FC<AccessibleLinkProps> = ({
  href,
  children,
  external = false,
  ariaLabel,
  className,
  ...props
}) => {
  const baseClasses = [
    'text-blue-600 hover:text-blue-800 underline underline-offset-2',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
    'transition-colors duration-200',
  ].join(' ')

  return (
    <a
      href={href}
      className={cn(baseClasses, className)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel || (external ? `${children} (opens in new window)` : undefined)}
      {...props}
    >
      {children}
      {external && (
        <span className="sr-only"> (opens in new window)</span>
      )}
    </a>
  )
}

interface SkipLinkProps {
  href: string
  children: React.ReactNode
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-blue-600 text-white px-4 py-2 rounded-lg z-50',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      )}
    >
      {children}
    </a>
  )
}

export { AccessibleButton, AccessibleLink, SkipLink }
