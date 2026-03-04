import { Shield, AlertTriangle, Eye, Activity } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Active Threats", value: "23", icon: AlertTriangle, color: "text-threat-critical", bg: "bg-threat-critical/10", trend: "+5 last hr" },
  { label: "Monitored Sources", value: "1,247", icon: Eye, color: "text-primary", bg: "bg-primary/10", trend: "Live" },
  { label: "Threat Score", value: "78/100", icon: Shield, color: "text-threat-high", bg: "bg-threat-high/10", trend: "High Risk" },
  { label: "Posts Analyzed", value: "342K", icon: Activity, color: "text-threat-low", bg: "bg-threat-low/10", trend: "+18K today" },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-panel rounded-lg p-4 group hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${stat.bg} ${stat.color} p-2 rounded-md`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">{stat.trend}</span>
          </div>
          <p className="text-2xl font-bold font-mono">{stat.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
