'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/lexi-ai/Header';
import { DocumentView } from '@/components/lexi-ai/DocumentView';
import { Chat } from '@/components/lexi-ai/Chat';
import { AuthDialog } from '@/components/lexi-ai/AuthDialog';
import { Toaster } from "@/components/ui/toaster";
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getChatsForUser, createNewChat } from '@/lib/actions';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { NewChatDialog } from '@/components/lexi-ai/NewChatDialog';

const auth = getAuth(app);

type ChatSession = {
  id: string;
  title: string;
  description: string;
  documentText: string;
  messages: ChatMessage[];
};

export default function Home() {
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserChats(currentUser.uid);
      } else {
        setUserChats([]);
        setActiveChat(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserChats = async (userId: string) => {
    const chats = await getChatsForUser(userId);
    setUserChats(chats);
    if (chats.length > 0) {
      handleSelectChat(chats[0]);
    } else {
      setActiveChat(null);
    }
  };
  
  const handleSelectChat = (chat: any) => {
    setActiveChat({
      id: chat.id,
      title: chat.title,
      description: chat.description,
      documentText: chat.documentText,
      messages: chat.messages || [{ id: '0', role: 'assistant', content: 'Document loaded. What would you like to know?' }]
    });
    setQuestionCount(0);
    setSuggestedQuestions([]);
  };

  const handleNewChatCreated = async (newChat: any) => {
    if (user) {
        await fetchUserChats(user.uid);
        handleSelectChat(newChat);
    }
  }


  useEffect(() => {
    if (!user) {
        const userMessages = activeChat?.messages.filter(m => m.role === 'user').length || 0;
        setQuestionCount(userMessages);
    }
  }, [activeChat?.messages, user]);

  useEffect(() => {
    if (!user && questionCount >= 3) {
      setIsAuthDialogOpen(true);
    }
  }, [questionCount, user]);

  const handleSetDocumentText = (text: string) => {
    if (!activeChat || text !== activeChat.documentText) {
        const newChatId = String(Date.now());
        const welcomeMessage = { id: `${newChatId}-0`, role: 'assistant' as const, content: 'Document loaded. What would you like to know?' };
        
        setActiveChat({
            id: newChatId,
            title: 'New Chat',
            description: 'A new chat session',
            documentText: text,
            messages: text ? [welcomeMessage] : [],
        });

        setSuggestedQuestions([]);
        setQuestionCount(0);
    }
  };

  const setMessages = (messages: ChatMessage[]) => {
    if (activeChat) {
        setActiveChat(prev => prev ? {...prev, messages} : null);
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthDialogOpen(false);
    setQuestionCount(0); 
    if(auth.currentUser){
        fetchUserChats(auth.currentUser.uid);
    }
  };

  const handleOpenNewChatDialog = () => {
    setIsNewChatDialogOpen(true);
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body antialiased">
        <Header>
            {user && <SidebarTrigger />}
        </Header>
        <main className="flex-1 flex">
          {user && (
            <Sidebar>
                <SidebarContent>
                    <SidebarHeader>
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleOpenNewChatDialog}>
                                    <PlusCircle />
                                    New Chat
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>
                    <SidebarMenu>
                        {userChats.map((chat) => (
                             <SidebarMenuItem key={chat.id}>
                                <SidebarMenuButton onClick={() => handleSelectChat(chat)} isActive={activeChat?.id === chat.id}>
                                    <MessageSquare />
                                    {chat.title}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
          )}

          <SidebarInset>
            <div className={`grid grid-cols-1 ${activeChat?.documentText ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-4 flex-1 container mx-auto p-4 lg:p-6`}>
                <DocumentView
                    documentText={activeChat?.documentText || ''}
                    setDocumentText={handleSetDocumentText}
                    isExtracting={isExtracting}
                    setIsExtracting={setIsExtracting}
                    chatId={activeChat?.id}
                    isDocMutable={!activeChat || !user}
                />
                { activeChat?.documentText && (
                    <Chat
                        chatId={activeChat.id}
                        documentText={activeChat.documentText}
                        messages={activeChat.messages}
                        setMessages={setMessages}
                        suggestedQuestions={suggestedQuestions}
                        setSuggestedQuestions={setSuggestedQuestions}
                        isLoggedIn={!!user}
                    />
                )}
            </div>
          </SidebarInset>
        </main>
        <Toaster />
        <AuthDialog
          isOpen={isAuthDialogOpen}
          onOpenChange={setIsAuthDialogOpen}
          onSuccess={handleAuthSuccess}
        />
        <NewChatDialog 
            isOpen={isNewChatDialogOpen}
            onOpenChange={setIsNewChatDialogOpen}
            onSuccess={handleNewChatCreated}
        />
      </div>
    </SidebarProvider>
  );
}
