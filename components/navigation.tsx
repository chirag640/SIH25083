"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Heart, 
  Menu, 
  Globe, 
  User, 
  Stethoscope, 
  Search, 
  UserPlus, 
  Phone,
  X
} from 'lucide-react'

interface NavigationProps {
  language: string
  onLanguageChange: (language: string) => void
  translations: any
}

const Navigation: React.FC<NavigationProps> = ({ 
  language, 
  onLanguageChange, 
  translations: t 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    {
      href: '/workers',
      label: t.nav.workerRecords,
      icon: User,
    },
    {
      href: '/doctors',
      label: t.nav.doctorDashboard,
      icon: Stethoscope,
    },
    {
      href: '/workers/search',
      label: t.nav.searchRecords,
      icon: Search,
    },
    {
      href: '/workers/register',
      label: t.nav.registerWorker,
      icon: UserPlus,
    },
    {
      href: '/help',
      label: 'Help & Support',
      icon: Phone,
    },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t.home.title}</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Healthcare for All</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.slice(0, 3).map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center space-x-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-32 border-0 bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ml">മലയാളം</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Primary CTA */}
            <Button asChild variant="default" size="sm" className="hidden md:flex bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <Link href="/workers/register">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold">Healthcare System</h2>
                        <p className="text-sm text-muted-foreground">For Migrant Workers</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 py-6">
                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Mobile CTA */}
                    <div className="mt-8 space-y-4">
                      <Button asChild variant="default" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <Link href="/workers/register" onClick={() => setIsOpen(false)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Register Worker
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/help" onClick={() => setIsOpen(false)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Get Support
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Footer */}
                  <div className="border-t pt-6">
                    <div className="text-center text-sm text-muted-foreground">
                      <p>24/7 Emergency Support</p>
                      <p className="font-medium text-blue-600">1800-XXX-XXXX</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export { Navigation }
