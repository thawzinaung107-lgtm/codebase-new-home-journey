import { createFileRoute } from '@tanstack/react-router';
import { academyQuery, studentQuery } from '@/lib/lms-query';
import { StudentCourses } from '@/components/academy/StudentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/my-courses')({loader:({context})=>Promise.all([context.queryClient.ensureQueryData(studentQuery),context.queryClient.ensureQueryData(academyQuery)]),head:()=>pageHead('My courses','Your unlocked courses and access periods.'),component:()=> <StudentCourses/>});