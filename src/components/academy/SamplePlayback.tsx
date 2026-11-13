import sampleVideo from '@/assets/academy-sample-flower.mp4.asset.json';

export function SamplePlayback() {
  return <section className="mt-8 border-t pt-6">
    <h2 className="text-xl font-semibold">Sample video</h2>
    <p className="mb-4 mt-2 text-sm text-muted-foreground">Temporary stock footage · not a course lesson</p>
    <video controls playsInline preload="metadata" className="aspect-video w-full rounded-lg bg-hero" aria-label="Sample stock video">
      <source src={sampleVideo.url} type="video/mp4" />
      Your browser does not support video playback.
    </video>
  </section>;
}