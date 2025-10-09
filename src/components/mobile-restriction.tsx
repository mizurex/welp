"use client"

import React, { useState, useEffect } from 'react'
import { LaptopMinimal, Monitor, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Instrument_Serif } from 'next/font/google'
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"] });

interface MobileRestrictionProps {
  children: React.ReactNode
}

const MobileRestriction: React.FC<MobileRestrictionProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      // Check both user agent and screen size
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileUserAgent || isSmallScreen)
      setIsLoading(false)
    }

    checkDevice()
    
    // Listen for window resize to handle dynamic screen size changes
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 768
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileUserAgent || isSmallScreen)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
        <div className="max-w-md w-full px-6 py-8 bg-white/80 backdrop-blur-md border border-neutral-200 shadow-xl rounded-2xl text-center">
          {/* Brand */}
          <h1 className={`text-4xl tracking-tight text-neutral-900 mb-2 ${instrumentSerif.className}`}>welp</h1>
     

          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200">
              <Smartphone className="h-6 w-6 text-neutral-500" />
            </div>
          </div>

          {/* Message */}
          <p className="text-neutral-700 text-base leading-relaxed">
           <span className={instrumentSerif.className}>  Welp  is not optimized for small screens. Please switch to a desktop or laptop for the best experience.</span> 
          </p>

          {/* Why */}
          <div className="mt-6 space-y-2 text-left">
            <p className="text-sm text-neutral-500">Why desktop only?</p>
            <ul className="text-sm text-neutral-600 space-y-1 list-disc pl-5">
              <li>More space for interactive nodes</li>
              <li>Mouse/trackpad precision for editing nodes</li>
              <li>Smoother performance and navigation</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-8 flex justify-center">
            <Link href="/" passHref>
              <Button className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2 rounded-lg">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default MobileRestriction 