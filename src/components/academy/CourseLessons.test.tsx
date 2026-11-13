import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const calls = vi.hoisted(() => ({ create: vi.fn(), start: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn, createServerFn: () => { const b: any = { middleware: () => b, inputValidator: () => b, handler: () => b }; return b; } }));
vi.mock('@/lib/bunny-lessons.functions', () => ({ createLessonUpload: calls.create, resumeLessonUpload: vi.fn(), refreshLessonVideos: vi.fn().mockResolvedValue([]), setLessonPublished: vi.fn(), moveLesson: vi.fn(), deleteCourseLesson: vi.fn(), updateLessonDetails: vi.fn() }));
vi.mock('tus-js-client', () => ({ Upload: class { constructor(public file: File, public opts: any) {} findPreviousUploads = async () => []; resumeFromPreviousUpload() {} start() { calls.start(this.opts); } abort() { return Promise.resolve(); } } }));
import { CourseLessons } from './CourseLessons';

const wrap = (ui: React.ReactNode) => render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);
const lesson = { id: 'l1', module_id: 'm', title: 'Welcome', description: '', position: 0, status: 'draft', video_status: 'processing', duration_seconds: 0, auto_publish: true };

describe('Add lesson upload form', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('shows an empty course with an upload call to action', () => {
    wrap(<CourseLessons courseId="c" courseTitle="Strategy" lessons={[]} />);
    expect(screen.getByText('No lessons yet')).toBeInTheDocument();
  });
  it('rejects non-video files and keeps Upload disabled', async () => {
    wrap(<CourseLessons courseId="c" courseTitle="Strategy" lessons={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /Add lesson/ }));
    fireEvent.change(document.querySelector('input[type=file].sr-only')!, { target: { files: [new File(['x'], 'notes.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose an MP4');
    expect(screen.getByRole('button', { name: /Upload lesson/ })).toBeDisabled();
  });
  it('double-clicking Upload creates one lesson and starts one direct upload with presigned headers only', async () => {
    let resolve!: (v: unknown) => void;
    calls.create.mockImplementation(() => new Promise(r => { resolve = r; }));
    wrap(<CourseLessons courseId="c" courseTitle="Strategy" lessons={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /Add lesson/ }));
    fireEvent.change(document.querySelector('input[type=file].sr-only')!, { target: { files: [new File(['video'], 'Intro lesson.mp4', { type: 'video/mp4' })] } });
    expect((screen.getByLabelText('Lesson title') as HTMLInputElement).value).toBe('Intro lesson');
    const button = screen.getByRole('button', { name: /Upload lesson/ });
    fireEvent.click(button); fireEvent.click(button);
    resolve({ lessonId: 'l1', videoId: '32d140e2-e4f4-4eec-9d53-20371e9be607', libraryId: '759', expirationTime: 2000000000, signature: 'sig', filetype: 'video/mp4', title: 'Intro lesson', fresh: true });
    await waitFor(() => expect(calls.start).toHaveBeenCalledTimes(1));
    expect(calls.create).toHaveBeenCalledTimes(1);
    const opts = calls.start.mock.calls[0]![0];
    expect(opts.endpoint).toBe('https://video.bunnycdn.com/tusupload');
    expect(Object.keys(opts.headers).sort()).toEqual(['AuthorizationExpire', 'AuthorizationSignature', 'LibraryId', 'VideoId']);
    expect(opts.retryDelays.length).toBeGreaterThan(5);
    expect(opts.metadata).toEqual({ filetype: 'video/mp4', title: 'Intro lesson' });
  });
  it('shows processing status for lessons still encoding', () => {
    wrap(<CourseLessons courseId="c" courseTitle="Strategy" lessons={[lesson]} />);
    expect(screen.getByText(/^Processing/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
  });
  it('offers Publish only once the video is ready', () => {
    wrap(<CourseLessons courseId="c" courseTitle="Strategy" lessons={[{ ...lesson, video_status: 'ready', auto_publish: false }]} />);
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
  });
});
