import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface HealthIconProps {
  icon: LucideIcon
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const HealthIcon: React.FC<HealthIconProps> = ({ 
  icon: Icon, 
  variant = 'default', 
  size = 'md', 
  className 
}) => {
  const baseClasses = 'rounded-xl flex items-center justify-center transition-all duration-300'
  
  const variantClasses = {
    default: 'bg-slate-100 text-slate-600',
    primary: 'bg-blue-100 text-blue-600',
    secondary: 'bg-green-100 text-green-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-orange-100 text-orange-600',
    danger: 'bg-red-100 text-red-600',
  }
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  }

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      <Icon className={iconSizes[size]} />
    </div>
  )
}

export { HealthIcon }
