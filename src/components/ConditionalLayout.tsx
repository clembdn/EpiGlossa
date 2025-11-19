"use client"

import { usePathname } from 'next/navigation'
import NavbarWrapper from './NavbarWrapper'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't show navbar on auth pages
  const isAuthPage = pathname?.startsWith('/auth')
  
  return (
    <>
      {children}
      {!isAuthPage && <NavbarWrapper />}
    </>
  )
}
