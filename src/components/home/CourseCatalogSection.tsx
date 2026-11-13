import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { filterCourses } from "./courses";

const dark = "h-auto rounded-[10px] border border-ink bg-ink p-3 text-sm font-normal leading-[21px] text-primary-foreground hover:bg-ink";

export function CourseCatalogSection({ query, selectedFilter, onReset }: { query: string; selectedFilter: string; onReset: () => void }) {
  const visible = filterCourses(query, selectedFilter);
  if (visible.length === 0) {
    return (
      <div className="flex w-full flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-[22px]">
        <p className="text-[19px] font-medium leading-[28.5px] text-ink">No courses match your search.</p>
        <p className="text-sm leading-[21px] text-muted-foreground">Try a different name or topic, or show all courses.</p>
        <Button type="button" onClick={onReset} className={dark}>Show all courses</Button>
      </div>
    );
  }
  return (
    <div className="grid w-full grid-cols-1 items-start gap-[18px] lg:grid-cols-2">
      {visible.map((c) => (
        <Card key={c.number} className="w-full overflow-hidden rounded-2xl border border-border bg-background shadow-none">
          <CardContent className="flex flex-col items-start gap-4 p-[22px]">
            <div role="img" aria-label={`${c.title} course`} className="aspect-[623/222] w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: `url("${c.image}")` }} />
            <header className="flex w-full flex-col items-start gap-[15px] rounded-[13px] bg-surface p-[22px]">
              <p className="text-[13px] leading-[19.5px] text-muted-foreground">{c.number}</p>
              <h2 className={`font-semibold text-ink ${c.titleClassName}`}>{c.title}</h2>
              <p className="text-sm leading-[21px] text-muted-foreground">RECORDED VIDEO · 1–2 HOURS</p>
            </header>
            <p className="w-full text-sm leading-[21px] text-muted-foreground">{c.description}</p>
            <dl className="flex w-full items-start gap-3.5 text-[13px] leading-[19.5px] text-muted-foreground">
              <div className="w-[120px]"><dt className="sr-only">Format</dt><dd>Self-paced</dd></div>
              <div className="w-[181px]"><dt className="sr-only">Access</dt><dd>Limited-term access</dd></div>
            </dl>
            <Button
              type="button"
              onClick={() => toast(`${c.title} is planned`, { description: "This course is planned for launch and is not open yet." })}
              className={`w-[157px] ${dark}`}
            >
              View course
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
