import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImg from "@/assets/myanmar-hero-desktop.png.asset.json";
import { scrollToSection } from "./scroll";

const slides = [0, 1, 2];
const chip =
  "h-auto rounded-[10px] border-hero-chip-border bg-hero-chip p-3 text-sm font-normal leading-[21px] text-hero-foreground hover:bg-hero-chip-hover hover:text-hero-foreground";
const arrow =
  "h-[42px] w-11 rounded-[21px] border border-border bg-background p-0 text-[21px] font-semibold leading-[28.4px] text-hero hover:bg-background/90";

export function DealsAndUpdatesHeroSection() {
  const [active, setActive] = useState(0);
  return (
    <Card className="w-full overflow-hidden rounded-[20px] border-0 bg-hero text-hero-foreground shadow-none">
      <CardContent className="flex flex-col gap-[17px] px-[30px] pb-[22px] pt-7">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,685px)_minmax(0,583px)]">
          <section className="flex min-w-0 flex-col items-start justify-center gap-[15px]">
            <div aria-hidden="true" className="h-[3px] w-[94px] rounded-[3px] bg-hero-rule" />
            <p className="text-[13px] font-medium leading-[19.5px]">DEALS &amp; UPDATES</p>
            <h1 className="text-[37px] font-semibold leading-[50px]">Find your next opportunity</h1>
            <p className="text-[17px] font-normal leading-[25.5px] text-hero-muted">
              Course news and confirmed offers will appear here.
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
            style={{ backgroundImage: `url("${heroImg.url}")` }}
          />
        </div>
        <nav aria-label="Deals and updates slides" className="flex w-full items-center justify-between">
          <span className="text-sm leading-[21px] text-hero-muted">/ 03</span>
          <div className="inline-flex items-center gap-[7px]">
            {slides.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Go to slide ${s + 1}`}
                aria-current={active === s ? "true" : undefined}
                onClick={() => setActive(s)}
                className={`h-2.5 rounded-md transition-[width,background-color] ${active === s ? "w-6 bg-hero-foreground" : "w-2.5 bg-hero-dot"}`}
              />
            ))}
          </div>
          <div className="inline-flex items-start gap-2">
            <Button type="button" aria-label="Previous slide" onClick={() => setActive((a) => (a === 0 ? slides.length - 1 : a - 1))} className={arrow}>
              ‹
            </Button>
            <Button type="button" aria-label="Next slide" onClick={() => setActive((a) => (a === slides.length - 1 ? 0 : a + 1))} className={arrow}>
              ›
            </Button>
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}
