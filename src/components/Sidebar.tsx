'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { User } from 'lucide-react';

export default function Sidebar() {
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Listen for clicks on the mobile menu button
  useEffect(() => {
    const handleMobileMenuClick = (e: CustomEvent) => {
      setIsMobileOpen(e.detail.isOpen);
    };

    window.addEventListener('toggleMobileMenu' as any, handleMobileMenuClick);
    return () => {
      window.removeEventListener('toggleMobileMenu' as any, handleMobileMenuClick);
    };
  }, []);

  // Apply padding to main content when sidebar is visible
  useEffect(() => {
    if (session && pathname !== '/') {
      // Add padding to main content
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.classList.add('md:pl-64');
      }

      return () => {
        // Remove padding when component unmounts
        if (mainElement) {
          mainElement.classList.remove('md:pl-64');
        }
      };
    }
  }, [session, pathname]);

  // Don't render on the home page
  if (!session || pathname === '/') return null;

  return (
    <>
      <div className={`fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg z-40 transition-transform duration-300 transform 
        md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Mobile close button - only visible on mobile */}
          <div className="md:hidden flex justify-end p-2">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Fermer le menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {/* Top section */}
          <div className="p-4">
            <div className="mb-8 flex items-center gap-2">
              <Image src="/logo.webp" alt="Hubys Logo" width={40} height={40} />
              <Link href="/profile" className="text-2xl font-bold text-black">
                Hubys
              </Link>
            </div>
            <nav>
              <Link
                href="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-[#fff3eb] rounded-lg flex items-center gap-4"
              >
                <User />
                Profil
              </Link>
              {/* Ajoutez d'autres liens de navigation ici */}
            </nav>
          </div>

          {/* Bottom section with logout button */}
          <div className="mt-auto p-4 border-t">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 flex items-center gap-2 justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay - only visible when sidebar is open on mobile */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black opacity-30 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
