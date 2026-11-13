import { queryOptions } from '@tanstack/react-query';
import { getPublicAcademy, getStudent, getAdmin } from './lms.functions';
export const academyQuery = queryOptions({queryKey:['academy'],queryFn:()=>getPublicAcademy()});
export const studentQuery = queryOptions({queryKey:['student'],queryFn:()=>getStudent()});
export const adminQuery = queryOptions({queryKey:['admin'],queryFn:()=>getAdmin()});