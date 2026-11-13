import { createFileRoute } from '@tanstack/react-router';
import { AdminPayments } from '@/components/academy/AdminPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/admin/payments')({head:()=>pageHead('Review payments','Private receipt review and payment approval.'),component:AdminPayments});