import { useEffect, useState } from "react";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { academyQuery } from "@/lib/lms-query";
import { SLIDE_INTERVAL_MS } from "@/lib/lms-rules";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImg from "@/assets/myanmar-hero-desktop.png.asset.json";
import { scrollToSection } from "./scroll";

const slides = [
  { title: "Find your next opportunity", body: "Course news and confirmed offers will appear here." },
  { title: "AI Marketing Strategy", body: "Build your campaign planning, audience research and practical AI skills." },
  { title: "AI Content Creation", body: "Explore practical AI tools for content and marketing assets." },
];
const chip =
  "h-auto rounded-[10px] border-hero-chip-border bg-hero-chip p-3 text-sm font-normal leading-[21px] text-hero-foreground hover:bg-hero-chip-hover hover:text-hero-foreground";
const arrow =
  "h-[42px] w-11 rounded-[21px] border border-border bg-background p-0 text-[21px] font-semibold leading-[28.4px] text-hero hover:bg-background/90";

export function DealsAndUpdatesHeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reading, setReading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const { data } = useQuery(academyQuery);
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    visibility(); change(); document.addEventListener('visibilitychange', visibility); media.addEventListener('change', change);
    return () => { document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', change); };
  }, []);
  useEffect(() => {
    if (paused || reading || hidden || reduced) return;
    const timer = setInterval(() => setActive(a => (a + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, reading, hidden, reduced]);
  const configured = data?.cms.find(s => s.key === `promotion-${active + 1}`);
  const slide = slides[active];
  return (
    <Card onMouseEnter={() => setReading(true)} onMouseLeave={() => setReading(false)} onFocusCapture={() => setReading(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setReading(false); }} className="w-full overflow-hidden rounded-[20px] border-0 bg-hero text-hero-foreground shadow-none">
      <CardContent className="flex flex-col gap-[17px] px-[30px] pb-[22px] pt-7">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,685px)_minmax(0,583px)]">
          <section className="flex min-w-0 flex-col items-start justify-center gap-[15px]">
            <div aria-hidden="true" className="h-[3px] w-[94px] rounded-[3px] bg-hero-rule" />
            <p className="text-[13px] font-medium leading-[19.5px]">DEALS &amp; UPDATES</p>
            <h1 className="min-h-[100px] text-[37px] font-semibold leading-[50px]">{configured?.title || slide?.title}</h1>
            <p className="min-h-[52px] text-[17px] font-normal leading-[25.5px] text-hero-muted">
              {configured?.body || slide?.body}
            </p>
            <div className="flex flex-wrap items-start gap-3">
              <Button
                type="button"
                onClick={() => scrollToSection("courses")}
                className="h-auto min-w-[228px] rounded-[10px] bg-background p-3 text-left text-[15px] font-normal leading-[22.5px] text-hero hover:bg-background/90"
              >
                Browse courses →
              </Button>
              <Button type="button" variant="outline" onClick={() => scrollToSection("how-it-works")} className={`min-w-[154px] ${chip}`}>
                How it works
              </Button>
            </div>
          </section>
          <div
            role="img"
            aria-label="People discussing a course opportunity"
            className="h-[300px] min-w-0 rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url("${configured?.image || heroImg.url}")` }}
          />
        </div>
        <nav aria-label="Deals and updates slides" className="flex w-full items-center justify-between">
          <span className="text-sm leading-[21px] text-hero-muted">0{active + 1} / 03</span>
          <div className="inline-flex items-center gap-[7px]">
            {slides.map((s, index) => (
              <Button
                key={s.title}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                onClick={() => setActive(index)}
                className={`h-2.5 min-w-0 rounded-md p-0 transition-[width,background-color] ${active === index ? "w-6 bg-hero-foreground" : "w-2.5 bg-hero-dot"}`}
              />
            ))}
          </div>
          <div className="inline-flex items-start gap-2">
            <Button type="button" aria-label={paused ? 'Play slides' : 'Pause slides'} title={paused ? 'Play slides' : 'Pause slides'} onClick={() => setPaused(p => !p)} className={arrow}>{paused ? <Play /> : <Pause />}</Button>
            <Button type="button" aria-label="Previous slide" onClick={() => setActive((a) => (a === 0 ? slides.length - 1 : a - 1))} className={arrow}>
              <ChevronLeft />
            </Button>
            <Button type="button" aria-label="Next slide" onClick={() => setActive((a) => (a === slides.length - 1 ? 0 : a + 1))} className={arrow}>
              <ChevronRight />
            </Button>
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}
