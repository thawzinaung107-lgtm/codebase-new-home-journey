import { Button } from "@/components/ui/button";
import { AccountButton } from "./AccountButton";
import { Link } from "@tanstack/react-router";

const items = [["Home", "/"], ["All courses", "/courses"], ["How it works", "/how-it-works"], ["About", "/about"]] as const;

export function NavigationSection() {
  return (
    <nav aria-label="Primary navigation" className="flex w-full min-w-0 flex-wrap items-center gap-4">
      <div className="flex flex-1 basis-[350px] items-center text-[19px] font-medium leading-[28.5px] text-ink">
        <span aria-hidden="true">■</span>
        <span className="ml-2">AI MARKETING ACADEMY</span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {items.map(([label, target]) => (
          <Button
            key={label}
            asChild
            variant="ghost"
            className="h-auto whitespace-nowrap px-0 py-0 text-sm font-normal leading-[21px] text-muted-foreground hover:bg-transparent hover:text-ink"
          >
            <Link to={target}>{label}</Link>
          </Button>
        ))}
      </div>
      <AccountButton />
    </nav>
  );
}
