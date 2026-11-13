import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { scrollToSection } from "./scroll";

const steps = [
  ["01", "Sign in with Google", "Use your Google account to enter the academy."],
  ["02", "Complete manual payment", "Follow the official payment instructions."],
  ["03", "Redeem a code", "Use your approved code to unlock learning."],
  ["04", "Learn at your pace", "Track your progress and resume where you left off."],
];

export function LearningProcessStepsSection() {
  return (
    <ol className="grid w-full grid-cols-1 items-stretch gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(([n, t, d]) => (
        <li key={n} className="min-w-0">
          <Card className="h-full overflow-hidden rounded-2xl border border-border bg-background shadow-none">
            <CardContent className="flex h-full flex-col items-start gap-4 p-[22px]">
              <span className="text-sm leading-[21px] text-subtle">{n}</span>
              <h3 className="text-[19px] font-medium leading-[28.5px] text-ink">{t}</h3>
              <p className="text-sm leading-[21px] text-muted-foreground">{d}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}

export function LearningPlatformFeaturesSection() {
  return (
    <Card className="w-full overflow-hidden rounded-2xl border border-border bg-background shadow-none">
      <CardContent className="flex flex-col items-start gap-4 p-[22px]">
        <h2 className="text-[28px] font-semibold leading-[37.8px] text-ink">A focused place to learn.</h2>
        <p className="text-base leading-6 text-muted-foreground">
          Organized lessons, progress tracking, limited access and up to two registered devices.
        </p>
        <Button
          type="button"
          onClick={() => scrollToSection("courses")}
          className="h-auto w-[173px] rounded-[10px] border border-ink bg-ink p-3 text-sm font-normal leading-[21px] text-primary-foreground hover:bg-ink/90"
        >
          Explore courses
        </Button>
      </CardContent>
    </Card>
  );
}

export function MarketingJourneyCallToActionSection() {
  return (
    <Card className="w-full overflow-hidden rounded-2xl border-0 bg-ink shadow-none">
      <CardContent className="flex flex-col items-start gap-2.5 p-[21px]">
        <h2 className="text-[32px] font-semibold leading-[43.2px] text-primary-foreground">Start your AI Marketing journey.</h2>
        <p className="text-sm leading-[21px] text-primary-foreground">Explore the courses and choose what fits your goals.</p>
      </CardContent>
    </Card>
  );
}
