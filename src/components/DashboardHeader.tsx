import { Shield } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="glass-panel border-b border-border/50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 glow-primary">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-gradient-primary">SENTINEL</span>
            <span className="text-muted-foreground font-normal ml-2 text-sm">Threat Intelligence</span>
          </h1>
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
