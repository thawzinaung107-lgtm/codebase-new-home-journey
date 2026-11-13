import { createFileRoute } from '@tanstack/react-router';
import { AdminCodes } from '@/components/academy/AdminPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/admin/codes')({head:()=>pageHead('Manage codes','Issue and revoke single-use course codes.'),component:AdminCodes});