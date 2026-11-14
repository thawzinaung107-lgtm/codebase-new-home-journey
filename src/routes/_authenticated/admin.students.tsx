import { createFileRoute } from '@tanstack/react-router';
import { AdminStudents } from '@/components/academy/AdminStudentsPage';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/admin/students')({head:()=>pageHead('Manage students','Student enrollment access and device controls.'),component:AdminStudents});