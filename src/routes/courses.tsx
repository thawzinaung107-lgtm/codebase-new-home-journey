import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageShell } from '@/components/academy/PageShell';
import { CourseCatalogSection } from '@/components/home/CourseCatalogSection';
import { CourseSearchAndFiltersSection } from '@/components/home/CourseSearchAndFiltersSection';
import { pageHead } from '@/lib/metadata';
import { academyQuery } from '@/lib/lms-query';
export const Route=createFileRoute('/courses')({loader:({context})=>context.queryClient.ensureQueryData(academyQuery),head:()=>pageHead('All courses','Browse practical recorded AI marketing and content courses.'),component:CoursesPage});
function CoursesPage(){const [query,setQuery]=useState('');const [filter,setFilter]=useState('All courses');return <PageShell><h1 className="text-3xl font-semibold">All courses</h1><div className="my-6"><CourseSearchAndFiltersSection query={query} onQueryChange={setQuery} selectedFilter={filter} onFilterChange={setFilter}/></div><CourseCatalogSection query={query} selectedFilter={filter} onReset={()=>{setQuery('');setFilter('All courses');}}/></PageShell>;}