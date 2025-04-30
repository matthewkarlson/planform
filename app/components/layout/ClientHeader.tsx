'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Header component with no SSR
const Header = dynamic(() => import('@/app/components/layout/Header'), { ssr: false });

type ClientHeaderProps = {
  showNavigation?: boolean;
}

export default function ClientHeader({ showNavigation = true }: ClientHeaderProps) {
  return <Header showNavigation={showNavigation} />;
} 