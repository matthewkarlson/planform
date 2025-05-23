'use client';

import { useState, use, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, Home, Building2, DraftingCompass, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/auth';
import { signOut } from '@/app/(login)/actions';

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

  // Get the user's initials for the avatar fallback
  const initials = user?.name ? 
    user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
    getInitials(user?.email || '');

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user?.name || ''} />
          <AvatarFallback className="bg-blue-900 text-white">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1 bg-gray-900 text-white border-gray-700">
        {/* User Info Section */}
        <div className="px-2 py-1.5 border-b border-gray-700 mb-1">
          {user?.name && (
            <p className="font-medium text-sm text-white">{user.name}</p>
          )}
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{user?.email}</p>
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

function MinimalHeader() {
  return (
    <header className="bg-black text-white h-[68px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center h-full">
        <Link href="/" className="flex items-center">
          <DraftingCompass className="h-6 w-6 text-blue-500" />
          <span className="ml-2 text-xl font-semibold text-white">PLANFORM.AI</span>
        </Link>
        
        <div className="flex items-center">
          <Suspense fallback={<div className="h-9 w-9 rounded-full bg-gray-800 animate-pulse" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home'},
    {href: '/dashboard/agency', icon: Building2, label: 'Agency'},
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' }
  ];

  return (
    <>
      <MinimalHeader />
      <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
          <div className="flex items-center">
            <span className="font-medium">Settings</span>
          </div>
          <Button
            className="-mr-3"
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden h-full">
          {/* Sidebar */}
          <aside
            className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${
              isSidebarOpen ? 'block' : 'hidden'
            } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <nav className="h-full overflow-y-auto p-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className={`shadow-none my-1 w-full justify-start ${
                      pathname === item.href ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
        </div>
      </div>
    </>
  );
}
