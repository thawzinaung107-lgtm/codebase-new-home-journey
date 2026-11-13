import { createFileRoute } from '@tanstack/react-router';
import { academyQuery, studentQuery } from '@/lib/lms-query';
import { PaymentsPage } from '@/components/academy/StudentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/payments')({loader:({context})=>Promise.all([context.queryClient.ensureQueryData(studentQuery),context.queryClient.ensureQueryData(academyQuery)]),head:()=>pageHead('Payments','Submit manual payment receipts and check approval status.'),component:PaymentsPage});