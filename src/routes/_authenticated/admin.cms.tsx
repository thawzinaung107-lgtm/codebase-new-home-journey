import { createFileRoute } from '@tanstack/react-router';
import { AdminCms } from '@/components/academy/AdminPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/admin/cms')({head:()=>pageHead('Homepage content','Manage approved academy promotions.'),component:AdminCms});