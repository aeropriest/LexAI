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
        <section className="relative h-screen min-h-[700px] w-full text-white overflow-hidden">
          {/* Background with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
          <Image 
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&h=1080&fit=crop"
            alt="Legal documents analysis background"
            fill
            className="object-cover opacity-10"
            priority
          />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />

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
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
              <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-4">
                  ✨ AI-Powered Legal Intelligence
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                  Your AI Legal
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Assistant
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                  Analyze documents, draft contracts, and conduct legal research with the power of AI.
                  <span className="block mt-2">Save hours of work in seconds.</span>
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button 
                      size="lg" 
                      onClick={() => router.push('/app')} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all"
                    >
                      Start Free Trial
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => router.push('/app')} 
                      className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
                    >
                      Watch Demo
                    </Button>
                </div>
                <p className="text-sm text-white/50 pt-2">
                  No credit card required • 3 free chats to start
                </p>
              </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
                Features
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
                Powerful AI tools designed specifically for legal professionals.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <section id="testimonials" className="py-24 lg:py-32 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
                Testimonials
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Trusted by Legal Professionals
              </h2>
              <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
                See what our users have to say about LexiAI.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur">
      <div className="flex justify-center mb-6 p-4 bg-primary/10 rounded-2xl w-fit mx-auto">{icon}</div>
      <CardTitle className="text-xl mb-3 font-semibold">{title}</CardTitle>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
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
    <Card className="p-8 text-left hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="p-0">
        <p className="text-muted-foreground mb-6 leading-relaxed text-base">"{testimonial}"</p>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
