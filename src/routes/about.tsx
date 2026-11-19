import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/academy/PageShell';
import { academyQuery } from '@/lib/lms-query';
import { pageHead } from '@/lib/metadata';
import founder from '@/assets/founder-collin.jpg.asset.json';
import { AUDIENCE, COMPANY, INSTRUCTOR } from '@/lib/company-info';
export const Route=createFileRoute('/about')({loader:({context})=>context.queryClient.ensureQueryData(academyQuery),head:()=>pageHead('About','Meet the instructor behind Collin AI Marketing Academy by Collin Consulting.'),component:About});
function About(){const {data}=useSuspenseQuery(academyQuery);return <PageShell><div className="max-w-4xl">
<h1 className="text-3xl font-semibold">Collin AI Marketing Academy</h1>
<p className="mt-6 whitespace-pre-wrap leading-7 text-muted-foreground">{data.settings.find(s=>s.key==='about')?.value||'Practical recorded courses in AI marketing strategy and AI content creation. Learn at your own pace and build skills for real-world marketing.'}</p>
<h2 className="mt-12 text-xl font-semibold">Your instructor</h2>
<div className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_340px]">
<div className="order-2 md:order-1"><p className="font-medium">{INSTRUCTOR.name}</p><p className="text-sm text-muted-foreground">{INSTRUCTOR.role}</p>
<p className="mt-4 leading-7 text-muted-foreground">{INSTRUCTOR.bio}</p>
<p className="mt-6 text-sm font-semibold tracking-widest">{INSTRUCTOR.philosophy}</p>
<p className="mt-2 leading-7 text-muted-foreground">{INSTRUCTOR.mission}</p></div>
<figure className="order-1 mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border bg-card md:order-2 md:max-w-none"><img src={founder.url} alt={`Portrait of ${INSTRUCTOR.name}`} width={515} height={935} loading="lazy" decoding="async" className="aspect-[4/5] h-auto w-full object-cover object-top"/></figure>
</div>
<h2 className="mt-12 text-xl font-semibold">Who these courses are for</h2>
<ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">{AUDIENCE.map(a=><li key={a}>{a}</li>)}</ul>
<p className="mt-12 text-sm text-muted-foreground">Collin AI Marketing Academy is operated by {COMPANY.name} ({COMPANY.brand}).</p>
</div></PageShell>;}
