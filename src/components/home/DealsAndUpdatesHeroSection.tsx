import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { academyQuery } from "@/lib/lms-query";
import { SLIDE_INTERVAL_MS } from "@/lib/carousel-rules";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImg from "@/assets/myanmar-hero-desktop.png.asset.json";
import strategyImg from "@/assets/myanmar-strategy-home-desktop.png.asset.json";
import creationImg from "@/assets/myanmar-creation-home-desktop.png.asset.json";
import { scrollToSection } from "./scroll";
import { responsiveImage } from "./responsive-images";

const slides = [
  { title: "Find your next opportunity", body: "Course news and confirmed offers will appear here.", image: heroImg.url },
  { title: "AI Marketing Strategy", body: "Build your campaign planning, audience research and practical AI skills.", image: strategyImg.url },
  { title: "AI Content Creation", body: "Explore practical AI tools for content and marketing assets.", image: creationImg.url },
];
const chip =
  "h-auto rounded-[10px] border-hero-chip-border bg-hero-chip p-3 text-sm font-normal leading-[21px] text-hero-foreground hover:bg-hero-chip-hover hover:text-hero-foreground";
const arrow =
  "size-11 shrink-0 rounded-[21px] border border-border bg-background p-0 text-[21px] font-semibold leading-[28.4px] text-hero hover:bg-background/90";

export function DealsAndUpdatesHeroSection() {
  const [active, setActive] = useState(0);
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
    if (reading || hidden || reduced) return;
    const timer = setInterval(() => setActive(a => (a + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reading, hidden, reduced]);
  const configured = data?.cms.find(s => s.key === `promotion-${active + 1}`);
  const slide = slides[active];
  const image = configured?.image || slide?.image || heroImg.url;
  const responsive = responsiveImage(image);
  const sizes = "(min-width: 1440px) 583px, (min-width: 1024px) calc((100vw - 172px) * 0.46), (min-width: 768px) calc(100vw - 148px), calc(100vw - 108px)";
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
          <picture className="block min-w-0 w-full">
            {responsive && <>
              <source type="image/avif" srcSet={responsive.avif} sizes={sizes} />
              <source type="image/webp" srcSet={responsive.webp} sizes={sizes} />
            </>}
          <img
            alt="People discussing a course opportunity"
            src={image}
            loading="eager"
            fetchPriority="high"
            width={583}
            height={300}
            className="h-[300px] w-full min-w-0 rounded-xl object-cover object-center"
          />
          </picture>
        </div>
        <nav aria-label="Deals and updates slides" className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="shrink-0 whitespace-nowrap text-sm leading-[21px] text-hero-muted">0{active + 1} / 03</span>
          <div className="inline-flex shrink-0 items-center">
            {slides.map((s, index) => (
              <Button
                key={s.title}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                onClick={() => setActive(index)}
                variant="ghost"
                className="size-11 min-w-0 shrink-0 rounded-md bg-transparent p-0 hover:bg-transparent"
              ><span aria-hidden="true" className={`h-2.5 rounded-md transition-[width,background-color] motion-reduce:transition-none ${active === index ? "w-6 bg-hero-foreground" : "w-2.5 bg-hero-dot"}`} /></Button>
            ))}
          </div>
          <div className="ml-auto inline-flex shrink-0 items-start gap-2">
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
