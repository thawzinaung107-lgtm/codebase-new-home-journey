import { defineTool, ToolError } from '@lovable.dev/mcp-js';
import { supabaseForUser } from '../supabase';
export default defineTool({
  name: 'list_courses', title: 'List academy courses',
  description: 'Read published course titles and demo offer status; no payment or lesson playback access.',
  inputSchema: {}, annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_, ctx) => {
    const { data, error } = await supabaseForUser(ctx).from('courses').select('id,title,slug,price_mmk,price_approved,access_days').eq('status', 'published').limit(50);
    if (error) throw new ToolError('Courses could not be loaded.');
    const courses = (data ?? []).map(c => ({ id: c.id, title: c.title, slug: c.slug, price_mmk: c.price_mmk, price_approved: c.price_approved, access_days: c.access_days }));
    return { content: [{ type: 'text', text: 'Published catalog only. Unapproved prices and access periods are demo settings, not payment offers. Protected lesson playback remains unconfigured.' }], structuredContent: { courses } };
  },
});