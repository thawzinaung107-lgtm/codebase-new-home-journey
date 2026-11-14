export type StatusTone='ready'|'published'|'progress'|'failed'|'draft'|'none';
export function statusTone(label:string):StatusTone{
  if(/fail|interrupted|unavailable/i.test(label))return 'failed';
  if(/^Published$/.test(label))return 'published';
  if(/Ready/.test(label))return 'ready';
  if(/Processing|Uploading|Paused/.test(label))return 'progress';
  if(/Waiting/.test(label))return 'none';
  return 'draft';
}
export const toneClass:Record<StatusTone,string>={ready:'bg-success-soft text-success',published:'bg-foreground text-background',progress:'bg-warning-soft text-warning',failed:'bg-danger-soft text-destructive',draft:'bg-surface text-foreground',none:'border border-dashed text-muted-foreground'};
/** Moves needed to bring item from index `from` to `to`: direction and count. */
export function reorderSteps(from:number,to:number):{direction:'up'|'down';count:number}|null{if(from===to||from<0||to<0)return null;return {direction:to<from?'up':'down',count:Math.abs(to-from)};}
