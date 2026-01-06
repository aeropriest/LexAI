'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body antialiased">
      <header className="p-4 border-b bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-primary"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M12 18a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z"></path>
              <path d="M12 8v2"></path>
              <path d="M12 14v-2"></path>
              <path d="m14.6 11.2-.8.8"></path>
              <path d="m9.4 11.2.8.8"></path>
            </svg>
            <h1 className="text-xl font-bold text-foreground">LexiAI</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center container mx-auto p-4 lg:p-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Unlock Insights from Your Legal Documents
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          LexiAI is an AI-powered assistant that helps you analyze, understand, and extract key information from complex legal texts in seconds.
        </p>
        <Button size="lg" onClick={() => router.push('/app')}>
          Try Now
        </Button>
      </main>
      <footer className="p-4 border-t bg-card text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LexiAI. All rights reserved.
      </footer>
    </div>
  );
}
