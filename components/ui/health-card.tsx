import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const healthCardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border hover:shadow-lg",
        primary: "border-blue-200 bg-blue-50/50 hover:shadow-lg hover:shadow-blue-100/50",
        secondary: "border-green-200 bg-green-50/50 hover:shadow-lg hover:shadow-green-100/50",
        accent: "border-orange-200 bg-orange-50/50 hover:shadow-lg hover:shadow-orange-100/50",
        elevated: "border-0 shadow-lg hover:shadow-xl",
        interactive: "border-border hover:shadow-lg hover:scale-105 cursor-pointer",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface HealthCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof healthCardVariants> {}

const HealthCard = React.forwardRef<HTMLDivElement, HealthCardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(healthCardVariants({ variant, size, className }))}
      {...props}
    />
  )
)
HealthCard.displayName = "HealthCard"

const HealthCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2", className)}
    {...props}
  />
))
HealthCardHeader.displayName = "HealthCardHeader"

const HealthCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
HealthCardTitle.displayName = "HealthCardTitle"

const HealthCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
HealthCardDescription.displayName = "HealthCardDescription"

const HealthCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-4", className)} {...props} />
))
HealthCardContent.displayName = "HealthCardContent"

const HealthCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
HealthCardFooter.displayName = "HealthCardFooter"

export {
  HealthCard,
  HealthCardHeader,
  HealthCardFooter,
  HealthCardTitle,
  HealthCardDescription,
  HealthCardContent,
}
