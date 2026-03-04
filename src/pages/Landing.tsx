import { Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedFace } from "@/components/AnimatedFace";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="glass-panel border-b border-border/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-gradient-primary">SENTINEL</span>
          </h1>
        </div>
        <Button onClick={() => navigate("/dashboard")} variant="default" size="sm">
          Open Dashboard <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </header>

      {/* Hero — just the animated head, centered */}
      <section className="flex-1 flex flex-col items-center justify-center relative px-6 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(190_100%_50%/0.08),transparent_60%)]" />
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 40, 0],
                opacity: [0.1, 0.5, 0.1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatedFace />

          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold tracking-tight text-gradient-primary">
              SENTINEL
            </h2>
            <p className="text-xs text-muted-foreground">
              AI Threat Intelligence
            </p>
          </div>

          <Button onClick={() => navigate("/dashboard")} size="lg" className="glow-primary">
            Enter Dashboard <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            SENTINEL
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-threat-low" />
            Operational
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
