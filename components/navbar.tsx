import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { NotificationsDropdown } from './notifications-dropdown';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Maestro-Ya
        </Link>
        
        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
}