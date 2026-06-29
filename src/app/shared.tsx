import { AVATAR_COLORS, STATUS_CFG } from "./state";
import type { ChatStatus } from "./state";

export function Avatar({
  initials,
  size = "md",
}: {
  initials: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const colors = AVATAR_COLORS[initials] ?? "from-primary/20 to-accent/30 text-primary";
  const sz = {
    xs: "w-7  h-7  text-[10px]",
    sm: "w-8  h-8  text-[11px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-lg",
  }[size];
  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br ${colors} flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

export function StatusChip({ status }: { status: ChatStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-150 ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
