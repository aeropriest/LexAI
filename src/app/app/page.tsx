'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/lexi-ai/Header';
import { DocumentView } from '@/components/lexi-ai/DocumentView';
import { Chat } from '@/components/lexi-ai/Chat';
import { AuthDialog } from '@/components/lexi-ai/AuthDialog';
import { Toaster } from "@/components/ui/toaster";
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';

export default function Home() {
  const [documentText, setDocumentText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user').length;
    setQuestionCount(userMessages);
  }, [messages]);

  useEffect(() => {
    if (questionCount >= 3) {
      setIsAuthDialogOpen(true);
    }
  }, [questionCount]);

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
    setQuestionCount(0);
  };

  const handleAuthSuccess = () => {
    setIsAuthDialogOpen(false);
    // Potentially reset question count or give user more questions
    setQuestionCount(0); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body antialiased">
      <Header />
      <main className="flex-1 flex">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 container mx-auto p-4 lg:p-6">
            <DocumentView
                documentText={documentText}
                setDocumentText={handleSetDocumentText}
                isExtracting={isExtracting}
                setIsExtracting={setIsExtracting}
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
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
