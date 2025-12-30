import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo1.png" alt="Dentiva Logo" width={32} height={32} />
          <span className="font-semibold text-lg">Dentiva</span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition"
          >
            How it Works
          </Link>

          <Link
            href="#pricing-section"
            className="text-muted-foreground hover:text-foreground transition"
          >
            Pricing
          </Link>

          <Link
            href="#what-to-ask"
            className="text-muted-foreground hover:text-foreground transition"
          >
            What to Ask
          </Link>

         
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </SignInButton>

          <SignUpButton mode="modal">
            <Button size="sm">Sign Up</Button>
          </SignUpButton>
        </div>
      </div>
    </nav>
  );
}

export default Header;
