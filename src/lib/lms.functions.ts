import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import { codeSchema, courseSchema, generateCode, hashValue, hasActiveAccess } from './lms-rules';

export const getPublicAcademy = createServerFn({method:'GET'}).handler(async () => {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Academy unavailable');
  const db = createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{
    const headers=new Headers(init?.headers); if(headers.get('Authorization')===`Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey',key); return fetch(input,{...init,headers});
  }}});
  const [courses,modules,lessons,settings,cms] = await Promise.all([db.from('courses').select('*').order('created_at'),db.from('modules').select('*').order('position'),db.from('lessons').select('*').order('position'),db.from('academy_settings').select('*'),db.from('cms_sections').select('*').order('position')]);
  for (const r of [courses,modules,lessons,settings,cms]) if(r.error) throw new Error('Academy data unavailable');
  return {courses:courses.data??[],modules:modules.data??[],lessons:lessons.data??[],settings:settings.data??[],cms:cms.data??[]};
});
export const getStudent = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const db=context.supabase;
  const [profile,roles,enrollments,orders,devices,progress] = await Promise.all([db.from('profiles').select('*').eq('id',context.userId).single(),db.from('user_roles').select('role').eq('user_id',context.userId),db.from('enrollments').select('*').eq('user_id',context.userId),db.from('orders').select('*').eq('user_id',context.userId).order('created_at',{ascending:false}),db.from('registered_devices').select('id,user_id,name,created_at,last_seen,revoked_at').eq('user_id',context.userId).order('created_at'),db.from('lesson_progress').select('*').eq('user_id',context.userId)]);
  for(const r of [profile,roles,enrollments,orders,devices,progress]) if(r.error) throw new Error(r.error.message);
  return {profile:profile.data,admin:roles.data?.some(r=>r.role==='admin')??false,enrollments:enrollments.data??[],orders:orders.data??[],devices:devices.data??[],progress:progress.data??[]};
});
const deviceSchema=z.object({token:z.string().min(32).max(100),name:z.string().trim().min(1).max(100)});
export const registerDevice=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(deviceSchema).handler(async({data,context})=>{
  const session=context.claims['session_id']; if(typeof session!=='string') throw new Error('Sign in again to register your device');
  const r=await context.supabase.rpc('lms_register_device',{p_hash:await hashValue(data.token),p_session:session,p_name:data.name}); if(r.error) throw new Error(r.error.message); return r.data;
});
export const revokeDevice=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid()})).handler(async({data,context})=>{
  const r=await context.supabase.rpc('lms_revoke_device',{p_id:data.id}); if(r.error)throw new Error(r.error.message); return {ok:true};
});
export const redeemCode=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({code:codeSchema})).handler(async({data,context})=>{
  const r=await context.supabase.rpc('lms_redeem',{p_hash:await hashValue(data.code)}); if(r.error)throw new Error(r.error.message); if(!r.data)throw new Error('Code unavailable or attempt limit reached. Check your code or try again in 15 minutes.'); return {id:r.data};
});
export const submitOrder=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({courseId:z.string().uuid(),receipt:z.string().max(500),reference:z.string().trim().max(200)})).handler(async({data,context})=>{
  if(!data.receipt.startsWith(context.userId+'/'))throw new Error('Invalid receipt');
  const filename=data.receipt.split('/')[1]; if(!filename)throw new Error('Invalid receipt');
  const {data:files,error}=await context.supabase.storage.from('payment-receipts').list(context.userId,{search:filename});
  if(error||!files?.some(f=>`${context.userId}/${f.name}`===data.receipt))throw new Error('Upload your receipt first');
  const r=await context.supabase.rpc('lms_submit_order',{p_course:data.courseId,p_receipt:data.receipt,p_reference:data.reference}); if(r.error)throw new Error(r.error.message); return {id:r.data};
});
export const getReceipt=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({orderId:z.string().uuid()})).handler(async({data,context})=>{
  const order=await context.supabase.from('orders').select('receipt_path').eq('id',data.orderId).single(); if(order.error)throw new Error('Receipt not available');
  const r=await context.supabase.storage.from('payment-receipts').createSignedUrl(order.data.receipt_path,60); if(r.error)throw new Error('Receipt not available');
  const publicUrl=process.env['VITE_SUPABASE_URL']; const serverUrl=process.env['SUPABASE_URL'];
  return {url:publicUrl&&serverUrl?r.data.signedUrl.replace(serverUrl,publicUrl):r.data.signedUrl};
});
export const getAdmin=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'}); if(role.error||!role.data)throw new Error('Admin access required');
  const db=context.supabase;
  const [courses,modules,lessons,orders,students,enrollments,devices,cms,settings,audit]=await Promise.all([db.from('courses').select('*').order('created_at'),db.from('modules').select('*').order('position'),db.from('lessons').select('*').order('position'),db.from('orders').select('*').order('created_at',{ascending:false}),db.from('profiles').select('*'),db.from('enrollments').select('*'),db.from('registered_devices').select('id,user_id,name,created_at,last_seen,revoked_at'),db.from('cms_sections').select('*').order('position'),db.from('academy_settings').select('*'),db.from('audit_events').select('*').order('created_at',{ascending:false}).limit(200)]);
  for(const r of [courses,modules,lessons,orders,students,enrollments,devices,cms,settings,audit])if(r.error)throw new Error(r.error.message);
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const codes=await supabaseAdmin.from('redeem_codes').select('id,course_id,order_id,assigned_to,expires_at,redeemed_by,redeemed_at,revoked_at,created_at').order('created_at',{ascending:false}); if(codes.error)throw new Error(codes.error.message);
  return {courses:courses.data??[],modules:modules.data??[],lessons:lessons.data??[],orders:orders.data??[],students:students.data??[],enrollments:enrollments.data??[],devices:devices.data??[],cms:cms.data??[],settings:settings.data??[],audit:audit.data??[],codes:codes.data??[]};
});
export const saveCourse=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(courseSchema).handler(async({data,context})=>{
  const {id,...values}=data; if(values.price_approved&&values.price_mmk===null)throw new Error('An approved price is required'); const r=id?await context.supabase.from('courses').update(values).eq('id',id).select().single():await context.supabase.from('courses').insert(values).select().single(); if(r.error)throw new Error(r.error.message); return r.data;
});
export const saveModule=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid().optional(),course_id:z.string().uuid(),title:z.string().trim().min(1).max(160),position:z.number().int().min(0)})).handler(async({data,context})=>{
  const {id,...values}=data; const r=await context.supabase.from('modules').upsert({...values,...(id?{id}:{})}).select().single(); if(r.error)throw new Error(r.error.message); return r.data;
});
export const saveLesson=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid().optional(),module_id:z.string().uuid(),title:z.string().trim().min(1).max(160),position:z.number().int().min(0),duration_seconds:z.number().int().min(0),status:z.enum(['draft','published'])})).handler(async({data,context})=>{
  const {id,...values}=data; const r=await context.supabase.from('lessons').upsert({...values,...(id?{id}:{})}).select().single();if(r.error)throw new Error(r.error.message);return r.data;
});
export const reviewOrder=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid(),approve:z.boolean(),reason:z.string().trim().max(1000),expires:z.string().datetime()})).handler(async({data,context})=>{
  const code=generateCode(); const hash=await hashValue(code);
  const r=await context.supabase.rpc('lms_review_order',{p_order:data.id,p_approve:data.approve,p_reason:data.reason,p_hash:hash,p_expires:data.expires}); if(r.error)throw new Error(r.error.message);
  if(!data.approve)return {code:null};
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const issued=await supabaseAdmin.from('redeem_codes').select('code_hash').eq('id',r.data).single();
  return {code:issued.data?.code_hash===hash?code:null};
});
export const issueCode=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({courseId:z.string().uuid(),studentId:z.string().uuid().nullable(),expires:z.string().datetime()})).handler(async({data,context})=>{
  if(!data.studentId)throw new Error('Choose the student who will receive this code');
  const code=generateCode();const r=await context.supabase.rpc('lms_issue_code',{p_course:data.courseId,p_student:data.studentId,p_hash:await hashValue(code),p_expires:data.expires});if(r.error)throw new Error(r.error.message);return {code};
});
export const reissueCode=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid(),expires:z.string().datetime()})).handler(async({data,context})=>{const code=generateCode();const r=await context.supabase.rpc('lms_reissue_code',{p_id:data.id,p_hash:await hashValue(code),p_expires:data.expires});if(r.error)throw new Error(r.error.message);return {code};});
export const revokeCode=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid()})).handler(async({data,context})=>{const r=await context.supabase.rpc('lms_revoke_code',{p_id:data.id});if(r.error)throw new Error(r.error.message);return {ok:true};});
export const manageAccess=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid(),expires:z.string().datetime(),revoke:z.boolean()})).handler(async({data,context})=>{const r=await context.supabase.rpc('lms_manage_access',{p_id:data.id,p_expires:data.expires,p_revoke:data.revoke});if(r.error)throw new Error(r.error.message);return {ok:true};});
export const saveSetting=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({key:z.enum(['payment_instructions','support_email','about','faq','refund_policy','privacy_policy','terms']),value:z.string().max(10000),published:z.boolean()})).handler(async({data,context})=>{if(data.key==='payment_instructions'&&data.published&&!data.value.trim())throw new Error('Real receiving instructions are required');const r=await context.supabase.from('academy_settings').upsert(data);if(r.error)throw new Error(r.error.message);return {ok:true};});
export const saveCms=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({key:z.string().regex(/^promotion-[123]$/),title:z.string().min(1).max(160),body:z.string().max(1000),image:z.string().max(2000),position:z.number().int().min(0).max(2),published:z.boolean()})).handler(async({data,context})=>{const r=await context.supabase.from('cms_sections').upsert(data);if(r.error)throw new Error(r.error.message);return {ok:true};});
export const getLearning=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({courseId:z.string().uuid(),token:z.string().min(32).max(100)})).handler(async({data,context})=>{
  const session=context.claims['session_id']; if(typeof session!=='string')throw new Error('Sign in again');
  const device=await context.supabase.from('registered_devices').select('id').eq('token_hash',await hashValue(data.token)).eq('session_id',session).eq('user_id',context.userId).is('revoked_at',null).maybeSingle();
  if(!device.data)throw new Error('Register this device before watching lessons');
  const access=await context.supabase.from('enrollments').select('*').eq('course_id',data.courseId).eq('user_id',context.userId).maybeSingle();
  if(!access.data||!hasActiveAccess(access.data))return {available:false,reason:'Your course access is expired or not active.'};
  return {available:false,reason:'Lessons are not ready for playback yet. Your course access is saved.'};
});
export const saveProgress=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({lessonId:z.string().uuid(),position:z.number().int().min(0),completed:z.boolean(),token:z.string().min(32).max(100)})).handler(async({data,context})=>{
  const session=context.claims['session_id'];if(typeof session!=='string')throw new Error('Sign in again');
  const r=await context.supabase.rpc('lms_save_progress',{p_lesson:data.lessonId,p_position:data.position,p_completed:data.completed,p_hash:await hashValue(data.token),p_session:session});if(r.error)throw new Error(r.error.message);return {ok:true};
});