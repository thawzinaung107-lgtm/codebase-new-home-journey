import { createFileRoute } from '@tanstack/react-router';
import { AdminCourses } from '@/components/academy/AdminPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/admin/courses')({head:()=>pageHead('Manage courses','Admin course and lesson management.'),component:AdminCourses});