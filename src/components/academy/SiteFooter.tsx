import { Link } from '@tanstack/react-router';
import { COMPANY } from '@/lib/company-info';
export function SiteFooter({className=''}:{className?:string}){
  return <footer className={`border-t py-6 text-sm text-muted-foreground ${className}`}>
    <div className="flex flex-wrap gap-x-6 gap-y-2"><span className="font-medium text-foreground">COLLIN AI MARKETING ACADEMY</span><Link to="/faq">FAQ & Contact</Link><Link to="/about">About</Link><Link to="/how-it-works">How it works</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link></div>
    <div className="mt-4 space-y-1 text-[13px]"><p><a className="underline" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p><p>{COMPANY.address}</p><p>{COMPANY.copyright}</p></div>
  </footer>;
}
