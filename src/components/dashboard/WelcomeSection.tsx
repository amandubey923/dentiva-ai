import Image from "next/image";

interface WelcomeSectionProps {
  firstName: string | null;
}

export default function WelcomeSection({ firstName }: WelcomeSectionProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <div className="relative z-10 flex items-center justify-between bg-linear-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 border border-primary/20 mb-12 overflow-hidden">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <div className="size-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-primary">Online &amp; Ready</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Good {greeting}, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Your personal AI dental assistant is ready to help you maintain perfect oral health.
          </p>
        </div>
      </div>

      <div className="lg:flex hidden items-center justify-center size-32 bg-linear-to-br from-primary/20 to-primary/10 rounded-full ">
        <Image src="/logo1.png" alt="Dentiva" width={64} height={64} className="w-16 h-16" />
      </div>
    </div>
  );
}