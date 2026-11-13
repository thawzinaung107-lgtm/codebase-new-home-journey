import { createFileRoute } from '@tanstack/react-router';
import { AdminOverview } from '@/components/academy/AdminPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/admin/')({head:()=>pageHead('Admin overview','Academy course operations, payment review and reporting.'),component:AdminOverview});