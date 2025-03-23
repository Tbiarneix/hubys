'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    
    // Dispatch custom event to communicate with Sidebar
    window.dispatchEvent(
      new CustomEvent('toggleMobileMenu', { detail: { isOpen: newState } })
    );
  };

  // Don't render on the home page
  if (!session || pathname === '/') return null;

  return (
    <button
      onClick={toggleSidebar}
      className="md:hidden fixed top-4 left-4 p-2 bg-white hover:bg-gray-100 rounded-lg shadow-lg z-50"
      aria-label="Menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-gray-900"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
    </button>
  );
}
