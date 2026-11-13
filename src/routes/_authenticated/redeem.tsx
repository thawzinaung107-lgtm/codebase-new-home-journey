import { createFileRoute } from '@tanstack/react-router';
import { RedeemPage } from '@/components/academy/StudentPages';
import { pageHead } from '@/lib/metadata';
export const Route=createFileRoute('/_authenticated/redeem')({head:()=>pageHead('Redeem code','Unlock your course with a single-use academy code.'),component:RedeemPage});