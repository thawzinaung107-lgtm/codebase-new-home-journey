import { createFileRoute } from '@tanstack/react-router';
import { AdminSettings } from '@/components/academy/AdminPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/admin/settings')({head:()=>pageHead('Settings and audit','Academy payment settings, public content and audit history.'),component:AdminSettings});