import { createFileRoute } from '@tanstack/react-router';
import { studentQuery } from '@/lib/lms-query';
import { DevicesPage } from '@/components/academy/StudentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/devices')({loader:({context})=>context.queryClient.ensureQueryData(studentQuery),head:()=>pageHead('Devices','Manage your two registered browser device slots.'),component:DevicesPage});