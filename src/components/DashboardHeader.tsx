import { AnimatedFace } from "@/components/AnimatedFace";

export function DashboardHeader() {
  return (
    <header className="glass-panel border-b border-border/50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <AnimatedFace className="w-7 h-7" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-tight">
              <span className="text-gradient-primary">SENTINEL</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              AI Threat Intelligence
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-threat-low" />
          System Operational
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {new Date().toLocaleString()}
        </div>
      </div>
    </header>
  );
}
