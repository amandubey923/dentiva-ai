import { Suspense } from "react";
import ActivityOverview from "@/components/dashboard/ActivityOverview";
import MainActions from "@/components/dashboard/MainActions";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import Navbar from "@/components/Navbar";
import { getDashboardData } from "@/lib/actions/dashboard";

// Skeleton components for streaming
function WelcomeSkeleton() {
  return (
    <div className="relative z-10 flex items-center justify-between bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 border border-primary/20 mb-12 overflow-hidden animate-pulse">
      <div className="space-y-4 flex-1">
        <div className="h-7 w-32 bg-primary/20 rounded-full" />
        <div className="h-10 w-72 bg-muted/50 rounded-xl" />
        <div className="h-5 w-96 bg-muted/30 rounded-lg" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="h-6 w-40 bg-muted/50 rounded" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/30 rounded-xl" />
          ))}
        </div>
        <div className="h-24 bg-muted/20 rounded-xl" />
      </div>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="h-6 w-32 bg-muted/50 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted/30 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// The actual data-fetching content — wrapped in Suspense for streaming
async function DashboardContent() {
  const data = await getDashboardData();

  return (
    <>
      <WelcomeSection firstName={data.user.firstName} />
      <MainActions />
      <ActivityOverview
        totalAppointments={data.stats.totalAppointments}
        completedAppointments={data.stats.completedAppointments}
        memberSince={data.user.createdAt}
        appointments={data.appointments}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <Suspense
          fallback={
            <>
              <WelcomeSkeleton />
              <MainActions />
              <ActivitySkeleton />
            </>
          }
        >
          <DashboardContent />
        </Suspense>
      </div>
    </>
  );
}