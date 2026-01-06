'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText,
  Search,
  BrainCircuit,
  MessageSquare,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body antialiased">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-screen min-h-[600px] w-full text-white">
          {/* Background Image */}
          <Image 
            src="https://picsum.photos/seed/lexai-hero/1920/1080"
            alt="Legal documents analysis background"
            fill
            className="object-cover"
            data-ai-hint="legal document"
            priority
          />
          {/* Black Tint Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Header */}
          <header className="absolute top-0 left-0 right-0 p-4 z-10">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AppLogo className="h-7 w-7 text-white" />
                <h1 className="text-xl font-bold text-white">LexiAI</h1>
              </div>
              <Button onClick={() => router.push('/app')} variant="secondary">Try Now</Button>
            </div>
          </header>

          {/* Hero Content */}
          <div className="relative z-5 flex h-full flex-col items-center justify-center text-center px-4">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                Unlock Insights from Your Legal Documents
              </h2>
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
                LexiAI is an AI-powered assistant that helps you analyze,
                understand, and extract key information from complex legal texts
                in seconds. Stop spending hours on manual review and start
                getting answers instantly.
              </p>
              <div className="flex flex-col items-center gap-4">
                  <Button size="lg" onClick={() => router.push('/app')} variant="secondary" className="bg-white text-primary hover:bg-white/90">
                    Get Started for Free
                  </Button>
                  <p className="text-sm text-white/60">
                  No credit card required.
                  </p>
              </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-20 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold">
                Powerful Features, Simplified
              </h3>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Everything you need to supercharge your legal document analysis.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<FileText className="h-8 w-8 text-primary" />}
                title="Document Upload"
                description="Easily upload documents in various formats including PDF, DOC, TXT, and even images."
              />
              <FeatureCard
                icon={<Search className="h-8 w-8 text-primary" />}
                title="Instant Search & Q&A"
                description="Ask natural language questions and get precise answers from your documents in real-time."
              />
              <FeatureCard
                icon={<BrainCircuit className="h-8 w-8 text-primary" />}
                title="AI-Powered Summaries"
                description="Generate concise summaries and identify key clauses, definitions, and obligations automatically."
              />
              <FeatureCard
                icon={<MessageSquare className="h-8 w-8 text-primary" />}
                title="Saved Chat History"
                description="Securely save your analysis sessions and revisit your findings anytime, on any device."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 lg:py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold">
                Trusted by Legal Professionals
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                name="Sarah J., Corporate Lawyer"
                testimonial="LexiAI has been a game-changer for due diligence. What used to take days now takes a fraction of the time. It's an indispensable tool in my practice."
                avatarUrl="https://i.pravatar.cc/150?img=1"
              />
              <TestimonialCard
                name="Michael R., Paralegal"
                testimonial="I'm amazed at how accurately LexiAI can pull specific information from dense contracts. It saves me from the headache of manual searching."
                avatarUrl="https://i.pravatar.cc/150?img=3"
              />
              <TestimonialCard
                name="Emily Chen, Law Student"
                testimonial="As a student, LexiAI helps me quickly grasp the core concepts in complex case files. It's like having a personal research assistant."
                avatarUrl="https://i.pravatar.cc/150?img=5"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <div className="flex items-center gap-3">
              <AppLogo className="h-7 w-7 text-primary" />
              <h1 className="text-xl font-bold text-foreground">LexiAI</h1>
            </div>
            <div className="flex space-x-6 text-muted-foreground">
              <Link href="#" className="hover:text-primary">
                Features
              </Link>
              <Link href="#" className="hover:text-primary">
                Pricing
              </Link>
              <Link href="#" className="hover:text-primary">
                About Us
              </Link>
              <Link href="#" className="hover:text-primary">
                Contact
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-6 w-6 text-muted-foreground hover:text-primary" />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary" />
              </Link>
              <Link href="#" aria-label="GitHub">
                <Github className="h-6 w-6 text-muted-foreground hover:text-primary" />
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p>© {new Date().getFullYear()} LexiAI. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-primary">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-primary">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center p-6">
      <div className="flex justify-center mb-4">{icon}</div>
      <CardTitle className="text-xl mb-2">{title}</CardTitle>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}

function TestimonialCard({
  name,
  testimonial,
  avatarUrl,
}: {
  name: string;
  testimonial: string;
  avatarUrl: string;
}) {
  return (
    <Card className="p-6 text-left">
      <CardContent className="p-0">
        <p className="italic text-muted-foreground mb-4">"{testimonial}"</p>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
