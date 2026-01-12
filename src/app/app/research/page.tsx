'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/lexi-ai/Header';
import { Chat } from '@/components/lexi-ai/Chat';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/lexi-ai/AppSidebar';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';

export default function ResearchPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedDocument(file);
      toast({
        title: "Document uploaded",
        description: `${file.name} is ready for research.`,
      });
    }
  };

  const handleRemoveDocument = () => {
    setUploadedDocument(null);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <AppSidebar
          userChats={userChats}
          activeChat={null}
          onSelectChat={() => {}}
          onNewChat={() => {}}
          onLogout={handleLogout}
          user={user}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header>
            <SidebarTrigger />
          </Header>
          
          <main className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
            {/* Optional Document Upload */}
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-between py-4">
                {uploadedDocument ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      <span className="text-sm">{uploadedDocument.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveDocument}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Upload a document for context (optional)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="research-file-upload"
                    />
                    <Button asChild variant="outline" size="sm">
                      <label htmlFor="research-file-upload" className="cursor-pointer gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </label>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Full-width Chat */}
            <div className="flex-1 overflow-hidden">
              <Chat
                chatId="research-chat"
                documentText={uploadedDocument?.name || ''}
                messages={messages}
                setMessages={setMessages}
                suggestedQuestions={suggestedQuestions}
                setSuggestedQuestions={setSuggestedQuestions}
                isLoggedIn={!!user}
              />
            </div>
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
