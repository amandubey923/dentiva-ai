import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import WhatToAsk from "@/components/landing/WhatToAsk";
import { syncUser } from "@/lib/actions/users";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  // Only sync user to DB if they are authenticated.
  // syncUser() calls currentUser() internally — we pass the result
  // through only when needed to avoid an extra Clerk API call for guests.
  if (user) {
    await syncUser();
    redirect("/dashboard");
  }

  // Anonymous visitors see the landing page with no DB interaction
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <WhatToAsk />
      <PricingSection />
      <CTA />
      <Footer />
    </div>
  );
}