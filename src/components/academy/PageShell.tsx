import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { NavigationSection } from '@/components/home/NavigationSection';
export function PageShell({children}:{children:ReactNode}){
  return <main className="min-h-screen bg-background px-6 py-6 md:px-11 md:py-11"><div className="mx-auto max-w-[1352px]"><NavigationSection/><div className="mt-10">{children}</div><footer className="mt-16 flex flex-wrap gap-6 border-t py-6 text-sm text-muted-foreground"><span>AI MARKETING ACADEMY</span><Link to="/faq">FAQ & Contact</Link><Link to="/about">About</Link><Link to="/how-it-works">How it works</Link></footer></div></main>;
}