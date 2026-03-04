import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCards } from "@/components/StatsCards";
import { ThreatFeed } from "@/components/ThreatFeed";
import { SentimentChart } from "@/components/SentimentChart";
import { PlatformStats } from "@/components/PlatformStats";
import { ThreatAnalyzer } from "@/components/ThreatAnalyzer";
import { ActorTracker } from "@/components/ActorTracker";
import { LiveSearchPanel } from "@/components/LiveSearchPanel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-[1600px] mx-auto w-full">
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 min-h-[500px]">
            <ThreatFeed />
          </div>
          <div className="space-y-4 lg:space-y-6">
            <SentimentChart />
            <PlatformStats />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <LiveSearchPanel />
          <ActorTracker />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <ThreatAnalyzer />
        </div>
      </main>
    </div>
  );
};

export default Index;
