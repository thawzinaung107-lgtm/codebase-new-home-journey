import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/academy/PageShell';
import { academyQuery } from '@/lib/lms-query';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/about')({loader:({context})=>context.queryClient.ensureQueryData(academyQuery),head:()=>pageHead('About','Practical self-paced learning at AI Marketing Academy.'),component:About});
function About(){const {data}=useSuspenseQuery(academyQuery);return <PageShell><div className="max-w-3xl"><h1 className="text-3xl font-semibold">AI Marketing Academy</h1><p className="mt-6 whitespace-pre-wrap leading-7 text-muted-foreground">{data.settings.find(s=>s.key==='about')?.value||'Practical recorded courses in AI marketing strategy and AI content creation. Learn at your own pace and build skills for real-world marketing.'}</p></div></PageShell>;}