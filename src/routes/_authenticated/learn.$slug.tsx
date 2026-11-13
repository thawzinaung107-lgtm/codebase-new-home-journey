import { createFileRoute } from '@tanstack/react-router';
import { academyQuery, studentQuery } from '@/lib/lms-query';
import { LearningPage } from '@/components/academy/StudentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/learn/$slug')({loader:({context})=>Promise.all([context.queryClient.ensureQueryData(studentQuery),context.queryClient.ensureQueryData(academyQuery)]),head:()=>pageHead('Learning player','Learn your course and resume saved lesson progress.'),component:()=> <LearningPage slug={Route.useParams().slug}/>});