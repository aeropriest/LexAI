'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/lexi-ai/Header';
import { DocumentView } from '@/components/lexi-ai/DocumentView';
import { Chat } from '@/components/lexi-ai/Chat';
import { AuthDialog } from '@/components/lexi-ai/AuthDialog';
import { Toaster } from "@/components/ui/toaster";
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getChatsForUser, askQuestionAction } from '@/lib/actions';
import { PlusCircle, MessageSquare, Scale, Pencil, Search, ArrowRight } from 'lucide-react';
import { NewChatDialog } from '@/components/lexi-ai/NewChatDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppLogo } from '@/components/icons';

const auth = getAuth(app);

type ChatSession = {
  id: string;
  title: string;
  description: string;
  documentText: string;
  messages: ChatMessage[];
  mode: 'review' | 'write' | 'research';
};

type AppMode = 'review' | 'write' | 'research';

const samplePrompts = {
  review: [
    "Summarize the key obligations for each party in this agreement.",
    "Identify any clauses related to termination and liability.",
    "What is the governing law and jurisdiction specified in this document?",
  ],
  write: [
    "Draft a standard non-disclosure agreement (NDA) for a software development project.",
    "Create a simple freelance contract for graphic design services.",
    "Write a demand letter for an unpaid invoice of $5,000.",
  ],
  research: [
    "What are the legal requirements for GDPR compliance for a US-based company?",
    "Explain the concept of 'force majeure' in contract law with recent examples.",
    "Summarize the key findings of the Supreme Court case *Marbury v. Madison*.",
  ]
}

export default function Home() {
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserChats(currentUser.uid);
      } else {
        setUserChats([]);
        setActiveChat(null);
        setCurrentMode(null);
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
      setCurrentMode(null);
    }
  };
  
  const handleSelectChat = (chat: any) => {
    setActiveChat({
      id: chat.id,
      title: chat.title,
      description: chat.description,
      documentText: chat.documentText || '',
      messages: chat.messages || [],
      mode: chat.mode || 'review'
    });
    setCurrentMode(chat.mode || 'review');
    setQuestionCount(0);
    setSuggestedQuestions([]);
  };

  const startNewChat = useCallback((mode: AppMode) => {
    setCurrentMode(mode);
    const newChatId = String(Date.now());
    let welcomeMessageContent = 'What would you like to know?';
    if(mode === 'write') welcomeMessageContent = "How can I help you with your contract?";
    if(mode === 'research') welcomeMessageContent = "What legal topic can I help you research?";

    const welcomeMessage = { id: `${newChatId}-0`, role: 'assistant' as const, content: welcomeMessageContent };

    setActiveChat({
      id: newChatId,
      title: `New ${mode.charAt(0).toUpperCase() + mode.slice(1)} Chat`,
      description: `A new chat session for ${mode}`,
      documentText: '',
      messages: [welcomeMessage],
      mode: mode,
    });
    setSuggestedQuestions([]);
    setQuestionCount(0);
  }, []);

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
    if (activeChat) {
      setActiveChat(prev => prev ? {...prev, documentText: text} : null);
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
    if (user) {
        setIsNewChatDialogOpen(true);
    } else {
        startNewChat('review');
    }
  }

  const handlePromptClick = (prompt: string) => {
    if (!activeChat) return;
    
    const formData = new FormData();
    formData.append('question', prompt);
    formData.append('documentText', activeChat.documentText);
    formData.append('chatId', activeChat.id);
    formData.append('isLoggedIn', String(!!user));
    
    setMessages([
        ...activeChat.messages,
        { id: String(Date.now()), role: 'user', content: prompt },
    ]);
    
    askQuestionAction(null, formData).then(state => {
        if (state.answer) {
            setMessages([
                ...activeChat.messages,
                { id: String(Date.now()), role: 'user', content: prompt },
                { id: String(Date.now() + 1), role: 'assistant', content: state.answer },
            ]);
            setSuggestedQuestions(state.suggestedQuestions || []);
        } else if (state.error) {
            setMessages([
                 ...activeChat.messages,
                { id: String(Date.now()), role: 'user', content: prompt },
                {
                    id: String(Date.now() + 1),
                    role: 'assistant',
                    content: state.error,
                },
            ]);
            setSuggestedQuestions([]);
        }
    });
  }

  const MainContent = () => {
    if (!activeChat) {
        return <InitialView onSelectMode={startNewChat} onPromptClick={handlePromptClick} />;
    }

    switch(currentMode) {
        case 'review':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-full">
                    <DocumentView
                        documentText={activeChat.documentText}
                        setDocumentText={handleSetDocumentText}
                        isExtracting={isExtracting}
                        setIsExtracting={setIsExtracting}
                        chatId={activeChat.id}
                        isDocMutable={!user || activeChat.documentText === ''}
                    />
                    <Chat
                        chatId={activeChat.id}
                        documentText={activeChat.documentText}
                        messages={activeChat.messages}
                        setMessages={setMessages}
                        suggestedQuestions={suggestedQuestions}
                        setSuggestedQuestions={setSuggestedQuestions}
                        isLoggedIn={!!user}
                    />
                </div>
            );
        case 'write':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full">
                    <div className="lg:col-span-2">
                        <DocumentView
                            documentText={activeChat.documentText}
                            setDocumentText={handleSetDocumentText}
                            isExtracting={isExtracting}
                            setIsExtracting={setIsExtracting}
                            chatId={activeChat.id}
                            isDocMutable={true} // Always editable in write mode
                        />
                    </div>
                    <Chat
                        chatId={activeChat.id}
                        documentText={activeChat.documentText}
                        messages={activeChat.messages}
                        setMessages={setMessages}
                        suggestedQuestions={suggestedQuestions}
                        setSuggestedQuestions={setSuggestedQuestions}
                        isLoggedIn={!!user}
                    />
                </div>
            );
        case 'research':
            return (
                <div className="max-w-4xl mx-auto w-full h-full">
                    <Chat
                        chatId={activeChat.id}
                        documentText={""} // No document for research
                        messages={activeChat.messages}
                        setMessages={setMessages}
                        suggestedQuestions={suggestedQuestions}
                        setSuggestedQuestions={setSuggestedQuestions}
                        isLoggedIn={!!user}
                    />
                </div>
            );
        default:
            return <InitialView onSelectMode={startNewChat} onPromptClick={handlePromptClick} />;
    }
  }


  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-background text-foreground font-body antialiased">
        {user && <Header><SidebarTrigger /></Header>}
        <main className="flex-1 flex overflow-hidden">
          {user && (
            <Sidebar>
                <SidebarContent>
                    <SidebarHeader>
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <SidebarMenuButton onClick={() => { setActiveChat(null); setCurrentMode(null); }}>
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
            <div className="w-full h-full flex flex-col items-center justify-center p-4 lg:p-6">
                <MainContent />
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

const InitialView = ({ onSelectMode, onPromptClick }: { onSelectMode: (mode: AppMode) => void, onPromptClick: (prompt: string) => void }) => {
    const handlePrompt = (mode: AppMode, prompt: string) => {
        onSelectMode(mode);
        // We need a small delay for the activeChat to be set
        setTimeout(() => onPromptClick(prompt), 100);
    }
    
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-foreground">
            <AppLogo className="h-12 w-12 text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-8">How can I help you today?</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <ModeCard 
                    icon={<Scale />} 
                    title="Review Document" 
                    prompts={samplePrompts.review} 
                    onSelect={() => onSelectMode('review')}
                    onPromptClick={(prompt) => handlePrompt('review', prompt)}
                />
                <ModeCard 
                    icon={<Pencil />} 
                    title="Write Contract" 
                    prompts={samplePrompts.write}
                    onSelect={() => onSelectMode('write')}
                    onPromptClick={(prompt) => handlePrompt('write', prompt)}
                />
                <ModeCard 
                    icon={<Search />} 
                    title="Legal Research" 
                    prompts={samplePrompts.research}
                    onSelect={() => onSelectMode('research')}
                    onPromptClick={(prompt) => handlePrompt('research', prompt)}
                />
            </div>
        </div>
    );
};

const ModeCard = ({ icon, title, prompts, onSelect, onPromptClick }: { icon: React.ReactNode, title: string, prompts: string[], onSelect: () => void, onPromptClick: (prompt: string) => void }) => {
    return (
        <Card className="bg-secondary/50 p-4 flex flex-col">
            <Button variant="ghost" onClick={onSelect} className="w-full justify-start mb-4">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="font-semibold text-lg">{title}</h3>
                </div>
            </Button>
            <div className="flex flex-col gap-2 flex-1 justify-end">
                {prompts.map((prompt, i) => (
                    <Button key={i} variant="ghost" className="text-sm h-auto text-left justify-between text-muted-foreground hover:text-foreground" onClick={() => onPromptClick(prompt)}>
                        {prompt}
                        <ArrowRight className="h-4 w-4 ml-2 opacity-50"/>
                    </Button>
                ))}
            </div>
        </Card>
    );
}
