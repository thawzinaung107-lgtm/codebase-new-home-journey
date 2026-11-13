import { defineTool, ToolError } from '@lovable.dev/mcp-js';
import { supabaseForUser } from '../supabase';
export default defineTool({
  name: 'my_learning', title: 'Read my learning access',
  description: 'Read only the caller’s course enrollments and saved progress; does not register devices or unlock playback.',
  inputSchema: {}, annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_, ctx) => {
    const userId = ctx.getUserId();
    if (!userId) throw new ToolError('Sign in to read your learning access.');
    const db = supabaseForUser(ctx);
    const [access, progress] = await Promise.all([
      db.from('enrollments').select('id,course_id,expires_at,revoked_at').eq('user_id', userId).limit(100),
      db.from('lesson_progress').select('lesson_id,position_seconds,completed').eq('user_id', userId).limit(200),
    ]);
    if (access.error || progress.error) throw new ToolError('Your learning access could not be loaded.');
    return { content: [{ type: 'text', text: 'Your saved access and progress only. Device registration is a separate browser action. Lesson streaming remains unavailable.' }], structuredContent: {
      enrollments: (access.data ?? []).map(e => ({ id: e.id, course_id: e.course_id, expires_at: e.expires_at, revoked_at: e.revoked_at })),
      progress: (progress.data ?? []).map(p => ({ lesson_id: p.lesson_id, position_seconds: p.position_seconds, completed: p.completed })),
    } };
  },
});