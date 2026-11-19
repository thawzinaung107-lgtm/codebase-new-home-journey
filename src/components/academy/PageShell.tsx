import type { ReactNode } from 'react';
import { NavigationSection } from '@/components/home/NavigationSection';
import { SiteFooter } from '@/components/academy/SiteFooter';
export function PageShell({children}:{children:ReactNode}){
  return <main className="min-h-screen bg-background px-6 py-6 md:px-11 md:py-11"><div className="mx-auto max-w-[1352px]"><NavigationSection/><div className="mt-10">{children}</div><SiteFooter className="mt-16"/></div></main>;
}

