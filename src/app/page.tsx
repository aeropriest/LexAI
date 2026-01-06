'use client';

import { useState } from 'react';
import { Header } from '@/components/lexi-ai/Header';
import { DocumentView } from '@/components/lexi-ai/DocumentView';
import { Chat } from '@/components/lexi-ai/Chat';
import { Toaster } from "@/components/ui/toaster";
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';

export default function Home() {
  const [documentText, setDocumentText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);

  // Reset chat if document changes
  const handleSetDocumentText = (text: string) => {
    // Only update if text actually changed to avoid re-renders
    if (text === documentText) return;

    setDocumentText(text);
    if (text) {
      setMessages([{ id: '0', role: 'assistant', content: 'Document loaded. What would you like to know?' }]);
    } else {
      setMessages([]);
    }
    setSuggestedQuestions([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body antialiased">
      <Header />
      <main className="flex-1 flex">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 container mx-auto p-4 lg:p-6">
            <DocumentView
                documentText={documentText}
                setDocumentText={handleSetDocumentText}
            />
            <Chat
                documentText={documentText}
                messages={messages}
                setMessages={setMessages}
                suggestedQuestions={suggestedQuestions}
                setSuggestedQuestions={setSuggestedQuestions}
            />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
