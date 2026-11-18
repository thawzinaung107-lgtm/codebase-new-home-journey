import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { FileText, LoaderCircle, Maximize2, RefreshCw, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';
import { getReceipt } from '@/lib/lms.functions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ReceiptPreview({ orderId, receiptPath, course, amount }: {
  orderId: string; receiptPath: string; course: string; amount: number;
}) {
  const receipt = useServerFn(getReceipt);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pdf = /\.pdf$/i.test(receiptPath);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setUrl(null);
    receipt({ data: { orderId } }).then(result => {
      if (active) setUrl(result.url);
    }).catch(() => {
      if (active) setFailed(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [orderId, open, attempt, receipt]);

  return <Dialog open={open} onOpenChange={value => { setOpen(value); setZoom(false); }}>
    <DialogTrigger asChild>
      <Button type="button" variant="outline" aria-label={`Preview receipt for ${course}`} title="Preview receipt"
        className="group relative mt-4 size-24 overflow-hidden rounded-md bg-surface p-0">
        {loading ? <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none text-muted-foreground" /> : url && !pdf && !failed ?
          <img src={url} alt="Receipt thumbnail" className="size-full object-contain p-1" onError={() => setFailed(true)} /> :
          <div className="flex flex-col items-center gap-1 text-muted-foreground"><FileText className="size-6" /><span className="text-xs">{pdf ? 'PDF' : 'Receipt'}</span></div>}
        <span className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1 border-t bg-background/95 py-1 text-xs"><Maximize2 className="size-3" />Preview</span>
      </Button>
    </DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-lg p-4 sm:p-6">
      <DialogHeader className="pr-7 text-left">
        <DialogTitle>Receipt preview</DialogTitle>
        <DialogDescription className="break-words">{course} · {amount.toLocaleString()} MMK</DialogDescription>
      </DialogHeader>
      <div className="flex min-h-64 max-h-[60dvh] items-center justify-center overflow-auto rounded-md border bg-surface" aria-busy={loading}>
        {loading ? <div role="status" className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />Loading receipt…</div> : failed || !url ?
          <div role="alert" className="p-6 text-center"><p className="text-sm text-muted-foreground">Receipt preview unavailable.</p><Button variant="outline" className="mt-4" onClick={() => setAttempt(value => value + 1)}><RefreshCw />Retry</Button></div> : pdf ?
          <object data={url} type="application/pdf" aria-label="Payment receipt PDF" className="h-[60dvh] w-full"><div className="p-6 text-center"><FileText className="mx-auto mb-3 size-8 text-muted-foreground" /><Button asChild variant="outline"><a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink />Open PDF</a></Button></div></object> :
          <img src={url} alt="Payment receipt" className={zoom ? 'w-[200%] max-w-none shrink-0 self-start' : 'max-h-[60dvh] w-full object-contain'} onError={() => setFailed(true)} />}
      </div>
      {!loading && url && <div className="flex items-center justify-end gap-2">
        {!pdf && !failed && <Button type="button" variant="outline" size="icon" aria-label={zoom ? 'Zoom out receipt' : 'Zoom in receipt'} title={zoom ? 'Zoom out' : 'Zoom in'} onClick={() => setZoom(value => !value)}>{zoom ? <ZoomOut /> : <ZoomIn />}</Button>}
        <Button asChild variant="outline" size="icon" title="Open receipt file" aria-label="Open receipt file"><a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink /></a></Button>
      </div>}
    </DialogContent>
  </Dialog>;
}