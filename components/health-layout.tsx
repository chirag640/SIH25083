import React from 'react'
import { SkipLink } from '@/components/ui/accessibility'

interface HealthLayoutProps {
  children: React.ReactNode
  showSkipLink?: boolean
}

const HealthLayout: React.FC<HealthLayoutProps> = ({ 
  children, 
  showSkipLink = true 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {showSkipLink && (
        <SkipLink href="#main-content">
          Skip to main content
        </SkipLink>
      )}
      
      <div className="flex flex-col min-h-screen">
        <main 
          id="main-content" 
          className="flex-1"
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export { HealthLayout }
