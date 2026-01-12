'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/lexi-ai/Header';
import { Chat } from '@/components/lexi-ai/Chat';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/lexi-ai/AppSidebar';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/lexi-ai/RichTextEditor';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';

export default function WritePage() {
  const [user, setUser] = useState<User | null>(null);
  const [contractText, setContractText] = useState('');
  const [contractTitle, setContractTitle] = useState('Untitled Contract');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSaveContract = async () => {
    setIsSaving(true);
    // TODO: Save to Firestore
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Contract saved",
        description: `${contractTitle} has been saved successfully.`,
      });
    }, 1000);
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
          
          <main className="flex-1 overflow-hidden p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Rich Text Editor */}
              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={contractTitle}
                      onChange={(e) => setContractTitle(e.target.value)}
                      className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                      placeholder="Contract Title"
                    />
                  </div>
                  <Button
                    onClick={handleSaveContract}
                    disabled={isSaving}
                    size="sm"
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <RichTextEditor
                    content={contractText}
                    onChange={setContractText}
                    placeholder="Start writing your contract here..."
                  />
                </CardContent>
              </Card>

              {/* AI Assistant Chat */}
              <Chat
                chatId="write-chat"
                documentText={contractText}
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
