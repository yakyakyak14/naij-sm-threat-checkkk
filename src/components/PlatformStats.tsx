import { platformStats } from "@/lib/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";

export function PlatformStats() {
  return (
    <div className="glass-panel rounded-lg p-4 h-full">
      <h2 className="font-semibold text-sm uppercase tracking-wider mb-4">Platform Activity</h2>
      <div className="space-y-3">
        {platformStats.map((p) => (
          <div key={p.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
            <span className="text-sm font-medium">{p.name}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">{p.threats}</span>
              <span className={`flex items-center gap-1 text-xs font-mono ${p.change > 0 ? "text-threat-critical" : "text-threat-low"}`}>
                {p.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {p.change > 0 ? "+" : ""}{p.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
