import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const courseFilters = ["All courses", "AI Marketing", "AI Content"];

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  selectedFilter: string;
  onFilterChange: (v: string) => void;
}

export function CourseSearchAndFiltersSection({ query, onQueryChange, selectedFilter, onFilterChange }: Props) {
  return (
    <form className="flex w-full flex-wrap items-center gap-3" role="search" onSubmit={(e) => e.preventDefault()}>
      <div className="flex min-w-0 flex-1 basis-[700px] items-center gap-2.5 overflow-hidden rounded-[10px] border border-field-border bg-field p-[13px]">
        <SearchIcon aria-hidden="true" className="h-[19px] w-[19px] shrink-0 text-ink" strokeWidth={2} />
        <Input
          aria-label="Search courses"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-sm leading-[21px] text-field-foreground shadow-none placeholder:text-field-foreground focus-visible:ring-0"
          placeholder="Search courses by name or topic"
          type="search"
        />
      </div>
      <ToggleGroup
        aria-label="Course categories"
        className="flex max-w-full shrink-0 flex-wrap items-center gap-[9px]"
        onValueChange={(v) => v && onFilterChange(v)}
        type="single"
        value={selectedFilter}
      >
        {courseFilters.map((f) => (
          <ToggleGroupItem
            key={f}
            value={f}
            aria-label={f}
            className="h-auto min-w-[170px] justify-start rounded-[9px] border border-border bg-background px-2.5 py-2.5 text-left text-xs font-normal leading-[18px] text-ink shadow-none hover:bg-background hover:text-ink data-[state=on]:border-ink data-[state=on]:bg-ink data-[state=on]:text-primary-foreground"
          >
            {f}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </form>
  );
}
