import { createFileRoute, Outlet } from '@tanstack/react-router';
import { adminQuery } from '@/lib/lms-query';
import { Workspace } from '@/components/academy/Workspace';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/admin')({head:()=>pageHead('Admin workspace','Role-protected academy management.'),loader:({context})=>context.queryClient.ensureQueryData(adminQuery),component:()=> <Outlet/>,errorComponent:()=> <Workspace title="Admin access required" subtitle="This account does not have permission to manage the academy."><p className="text-sm text-muted-foreground">Use your student workspace or sign in with an authorized admin account.</p></Workspace>});