import { Button } from "@/components/ui/button";
import { AccountButton } from "./AccountButton";
import { scrollToSection } from "./scroll";

const items: [string, string][] = [
  ["Home", "top"],
  ["All courses", "courses"],
  ["How it works", "how-it-works"],
  ["About", "about"],
];

export function NavigationSection() {
  return (
    <nav aria-label="Primary navigation" className="flex w-full min-w-0 items-center gap-4 overflow-x-auto">
      <div className="flex min-w-max flex-1 basis-[350px] items-center whitespace-nowrap text-[19px] font-medium leading-[28.5px] tracking-[-0.25px] text-ink">
        <span aria-hidden="true">■</span>
        <span className="ml-2">AI MARKETING ACADEMY</span>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {items.map(([label, target]) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            onClick={() => scrollToSection(target)}
            className="h-auto whitespace-nowrap px-0 py-0 text-sm font-normal leading-[21px] text-muted-foreground hover:bg-transparent hover:text-ink"
          >
            {label}
          </Button>
        ))}
      </div>
      <AccountButton />
    </nav>
  );
}
