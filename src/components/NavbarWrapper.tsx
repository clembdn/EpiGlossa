'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Hide navbar on TEPITECH BLANC test page
  if (pathname === '/train/toeic-blanc/test') {
    return null;
  }
  
  return <Navbar />;
}
