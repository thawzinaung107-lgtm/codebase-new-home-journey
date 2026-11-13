import { createFileRoute } from '@tanstack/react-router';
import { academyQuery, studentQuery } from '@/lib/lms-query';
import { StudentCourses } from '@/components/academy/StudentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/dashboard')({loader:({context})=>Promise.all([context.queryClient.ensureQueryData(studentQuery),context.queryClient.ensureQueryData(academyQuery)]),head:()=>pageHead('My learning','Your enrolled courses, progress and payment status.'),component:()=> <StudentCourses dashboard/>});