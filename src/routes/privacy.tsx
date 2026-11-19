import { createFileRoute } from '@tanstack/react-router';
import { PageShell } from '@/components/academy/PageShell';
import { pageHead } from '@/lib/metadata';
import { COMPANY } from '@/lib/company-info';
export const Route=createFileRoute('/privacy')({head:()=>pageHead('Privacy Policy','How Collin AI Marketing Academy collects and protects your information.'),component:Privacy});
const items=[['Information we collect','Your Google account name and email, payment receipts you submit, course progress and registered device records.'],['How we use it','To verify payments, grant course access, enforce the device limit and provide support.'],['Sharing','We do not sell or share your personal information with third parties, except service providers needed to run the platform.'],['Security','Receipts are stored privately and course videos are delivered through secure, time-limited links.']];
function Privacy(){return <PageShell><div className="max-w-3xl"><h1 className="text-3xl font-semibold">Privacy Policy</h1>{items.map(([h,p],i)=><section key={h} className="mt-8"><h2 className="font-semibold">{i+1}. {h}</h2><p className="mt-2 leading-7 text-muted-foreground">{p}</p></section>)}<p className="mt-10 text-sm text-muted-foreground">Contact: <a className="underline" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p></div></PageShell>;}
