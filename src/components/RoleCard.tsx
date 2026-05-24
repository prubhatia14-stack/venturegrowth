import type { LucideIcon } from "lucide-react";

export interface Role {
  id: string;
  title: string;
  shortTitle: string;
  summary: string;
  bullets: string[];
  icon: LucideIcon;
}

export function RoleCard({
  role,
  onApply,
}: {
  role: Role;
  onApply: (id: string) => void;
}) {
  const Icon = role.icon;
  return (
    <article className="role-card rounded-lg p-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-md bg-accent/60 p-2.5 text-accent-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="font-display text-[10px] tracking-widest text-muted-foreground uppercase">
          Job ID #{role.id.toUpperCase()}
        </span>
      </div>

      <h3 className="font-display mt-5 text-xl text-foreground leading-tight">
        {role.title}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">{role.summary}</p>

      <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
        {role.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-accent-foreground/60 mt-1.5 inline-block h-1 w-1 rounded-full bg-foreground/40 flex-shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onApply(role.id)}
        className="cta-bounce mt-6 self-start rounded-md border border-foreground/20 bg-paper px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/40"
      >
        Apply for this role →
      </button>
    </article>
  );
}
