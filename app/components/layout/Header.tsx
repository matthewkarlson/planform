'use client';

import { ArrowRight, DraftingCompass, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Suspense, use, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/lib/auth';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';

// Helper function to get consistent initials
const getInitials = (email: string): string => {
  if (!email) return 'U';
  // Just use the first letter of the email
  return email[0].toUpperCase();
};

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/sign-in" className="text-white hover:text-blue-400 border border-transparent hover:border-blue-400 py-2 px-4 rounded-md">
          Login
        </Link>
        <Link href="/sign-up" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
          Sign Up
        </Link>
      </div>
    );
  }

  // Get the user's initials for the avatar fallback
  const initials = user.name ? 
    user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
    getInitials(user.email);

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback className="bg-blue-900 text-white">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1 bg-gray-900 text-white border-gray-700">
        {/* User Info Section */}
        <div className="px-2 py-1.5 border-b border-gray-700 mb-1">
          {user.name && (
            <p className="font-medium text-sm text-white">{user.name}</p>
          )}
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{user.email}</p>
        </div>
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
          <Link href="/dashboard" className="flex w-full items-center text-white">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-white">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type HeaderProps = {
  showNavigation?: boolean;
}

export default function Header({ showNavigation = true }: HeaderProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <DraftingCompass className="h-6 w-6 text-blue-500" />
          <span className="ml-2 text-xl font-semibold text-white">PLANFORM.AI</span>
        </Link>
        
        {showNavigation && (
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-white hover:text-blue-400"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="text-white hover:text-blue-400"
            >
              Testimonials
            </button>
            <Link 
              href="/pricing"
              className="text-white hover:text-blue-400"
            >
              Pricing
            </Link>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="text-white hover:text-blue-400"
            >
              FAQ
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9 w-9 rounded-full bg-gray-800 animate-pulse" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
} 