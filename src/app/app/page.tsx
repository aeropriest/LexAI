'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/lexi-ai/Header';
import { DocumentView } from '@/components/lexi-ai/DocumentView';
import { Chat } from '@/components/lexi-ai/Chat';
import { AuthDialog } from '@/components/lexi-ai/AuthDialog';
import { Toaster } from "@/components/ui/toaster";
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getChatsForUser, askQuestionAction, createNewChat } from '@/lib/actions';
import { Scale, Pencil, Search, ArrowRight } from 'lucide-react';
import { NewChatDialog } from '@/components/lexi-ai/NewChatDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { ensureAnonymousAuth, getChatCount, incrementChatCount, resetChatCount } from '@/lib/auth-utils';
import { AppSidebar } from '@/components/lexi-ai/AppSidebar';

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
    "Summarize the key obligations for each party in this agreement",
    "Identify any clauses related to termination and liability",
    "What is the governing law and jurisdiction specified in this document?",
  ],
  write: [
    "Draft a standard non-disclosure agreement (NDA) for a software project",
    "Create a simple freelance contract for graphic design services",
    "Write a demand letter for an unpaid invoice of $5,000",
  ],
  research: [
    "What are the legal requirements for GDPR compliance for a US company?",
    "Explain the concept of 'force majeure' in contract law with examples",
    "Summarize the key findings of the Supreme Court case Marbury v. Madison",
  ]
}

export default function Home() {
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [totalChatCount, setTotalChatCount] = useState(0);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    ensureAnonymousAuth().catch(console.error);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.isAnonymous) {
        fetchUserChats(currentUser.uid);
        setIsAuthDialogOpen(false);
        resetChatCount();
      } else if (currentUser && currentUser.isAnonymous) {
        setTotalChatCount(getChatCount());
      } else {
        setUserChats([]);
        setActiveChat(null);
        setTotalChatCount(0);
      }
    });
    return () => unsubscribe();
  }, []);
  
  const fetchUserChats = async (userId: string) => {
    try {
      const chats = await getChatsForUser(userId);
      setUserChats(chats);
      if (chats.length > 0) {
        handleSelectChat(chats[0]);
      } else {
        setActiveChat(null);
      }
    } catch (error) {
      console.error("Failed to fetch user chats:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load your chats. Please try again later.'
      });
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
    setSuggestedQuestions([]);
  };

  const handleNewChat = useCallback(async (mode: AppMode) => {
      const title = `New ${mode.charAt(0).toUpperCase() + mode.slice(1)} Chat`;
      const description = `A new chat session for ${mode}`;
      
      let welcomeMessageContent = 'What would you like to know?';
      if(mode === 'write') welcomeMessageContent = "How can I help you with your contract?";
      if(mode === 'research') welcomeMessageContent = "What legal topic can I help you research?";

      const welcomeMessage = { id: `${Date.now()}-0`, role: 'assistant' as const, content: welcomeMessageContent };
      
      if (user) {
        // Create a new chat in the database for logged-in users
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('documentText', '');
        formData.append('userId', user.uid);
        formData.append('mode', mode);

        const result = await createNewChat(null, formData);
        if (result.success && result.chat) {
          await fetchUserChats(user.uid);
          handleSelectChat(result.chat);
        } else {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to create a new chat.',
          });
        }
      } else {
        setActiveChat({
            id: String(Date.now()),
            title: title,
            description: description,
            documentText: '',
            messages: [welcomeMessage],
            mode: mode,
        });
      }
      setSuggestedQuestions([]);
  }, [user, toast]);

  const handleNewChatCreated = async (newChat: any) => {
    if (user) {
        await fetchUserChats(user.uid);
        handleSelectChat(newChat);
    }
  }

  const handleMessagesUpdate = (newMessages: ChatMessage[]) => {
    if (activeChat) {
      setActiveChat(prev => prev ? {...prev, messages: newMessages} : null);
      if (user?.isAnonymous) {
        const prevUserMsgCount = activeChat.messages.filter(m => m.role === 'user').length;
        const newUserMsgCount = newMessages.filter(m => m.role === 'user').length;
        if (newUserMsgCount > prevUserMsgCount) {
          const newCount = incrementChatCount();
          setTotalChatCount(newCount);
        }
      }
    }
  };
  
  useEffect(() => {
    if (user?.isAnonymous && totalChatCount >= 3) {
      setIsAuthDialogOpen(true);
    }
  }, [totalChatCount, user]);

  const handleSetDocumentText = (text: string) => {
    if (activeChat) {
      setActiveChat(prev => prev ? {...prev, documentText: text} : null);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthDialogOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserChats([]);
      setActiveChat(null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log out. Please try again.',
      });
    }
  };
  
  const handleOpenNewChatDialog = () => setIsNewChatDialogOpen(true);

  const handlePromptClick = (prompt: string, mode: AppMode) => {
      const performAskQuestion = async () => {
        if (!activeChat) return;

        const newMessages: ChatMessage[] = [
          ...activeChat.messages,
          { id: String(Date.now()), role: 'user', content: prompt },
        ];
        handleMessagesUpdate(newMessages);

        const formData = new FormData();
        formData.append('question', prompt);
        formData.append('documentText', activeChat.documentText);
        formData.append('chatId', activeChat.id);
        formData.append('isLoggedIn', String(!!user));
        
        try {
          const state = await askQuestionAction(null, formData);
          
          if (state.answer) {
              const finalMessages: ChatMessage[] = [
                  ...newMessages,
                  { id: String(Date.now() + 1), role: 'assistant' as const, content: state.answer },
              ];
              handleMessagesUpdate(finalMessages);
              setSuggestedQuestions(state.suggestedQuestions || []);
          } else if (state.error) {
              const finalMessages: ChatMessage[] = [
                   ...newMessages,
                  {
                      id: String(Date.now() + 1),
                      role: 'assistant' as const,
                      content: `Error: ${state.error}`,
                  },
              ];
              handleMessagesUpdate(finalMessages);
              setSuggestedQuestions([]);
          }
        } catch (e) {
            const finalMessages: ChatMessage[] = [
               ...newMessages,
              {
                  id: String(Date.now() + 1),
                  role: 'assistant' as const,
                  content: 'An unexpected error occurred.',
              },
          ];
          handleMessagesUpdate(finalMessages);
          setSuggestedQuestions([]);
        }
      };

      if (!activeChat || activeChat.mode !== mode) {
        handleNewChat(mode).then(() => {
          // Using setTimeout to ensure state update completes before asking question
          setTimeout(performAskQuestion, 100);
        });
      } else {
        performAskQuestion();
      }
  }

  const MainContent = () => {
    if (!activeChat) {
        return <InitialView onSelectMode={handleNewChat} onPromptClick={handlePromptClick} />;
    }

    // Different layouts based on mode
    switch(activeChat.mode) {
      case 'review':
        return (
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <DocumentView
              documentText={activeChat.documentText}
              setDocumentText={handleSetDocumentText}
              isExtracting={isExtracting}
              setIsExtracting={setIsExtracting}
              chatId={activeChat.id}
              isDocMutable={true}
            />
            <Chat
              chatId={activeChat.id}
              documentText={activeChat.documentText}
              messages={activeChat.messages}
              setMessages={handleMessagesUpdate}
              suggestedQuestions={suggestedQuestions}
              setSuggestedQuestions={setSuggestedQuestions}
              isLoggedIn={!!user}
            />
          </div>
        );
      
      case 'write':
        return (
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <DocumentView
              documentText={activeChat.documentText}
              setDocumentText={handleSetDocumentText}
              isExtracting={isExtracting}
              setIsExtracting={setIsExtracting}
              chatId={activeChat.id}
              isDocMutable={true}
            />
            <Chat
              chatId={activeChat.id}
              documentText={activeChat.documentText}
              messages={activeChat.messages}
              setMessages={handleMessagesUpdate}
              suggestedQuestions={suggestedQuestions}
              setSuggestedQuestions={setSuggestedQuestions}
              isLoggedIn={!!user}
            />
          </div>
        );
      
      case 'research':
      default:
        return (
          <div className="h-full flex flex-col">
            <Chat
              chatId={activeChat.id}
              documentText={activeChat.documentText}
              messages={activeChat.messages}
              setMessages={handleMessagesUpdate}
              suggestedQuestions={suggestedQuestions}
              setSuggestedQuestions={setSuggestedQuestions}
              isLoggedIn={!!user}
            />
          </div>
        );
    }
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background text-foreground font-body antialiased overflow-hidden">
        {/* Sidebar - Always visible */}
        <AppSidebar
          userChats={userChats}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleOpenNewChatDialog}
          onLogout={handleLogout}
          user={user}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header>
            <SidebarTrigger />
          </Header>
          
          <main className="flex-1 overflow-hidden">
            <MainContent />
          </main>
        </div>
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

const InitialView = ({ onSelectMode, onPromptClick }: { onSelectMode: (mode: AppMode) => void, onPromptClick: (prompt: string, mode: AppMode) => void }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <AppLogo className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h1 className="text-2xl md:text-3xl font-semibold">LexiAI</h1>
                </div>

                {/* Three Category Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Review Document */}
                    <CategorySection
                        icon={<Scale className="h-5 w-5" />}
                        title="Review Document"
                        description="Upload and analyze legal documents"
                        prompts={samplePrompts.review}
                        onPromptClick={(prompt) => onPromptClick(prompt, 'review')}
                        mode="review"
                    />

                    {/* Write Contract */}
                    <CategorySection
                        icon={<Pencil className="h-5 w-5" />}
                        title="Write Contract"
                        description="Draft contracts with AI assistance"
                        prompts={samplePrompts.write}
                        onPromptClick={(prompt) => onPromptClick(prompt, 'write')}
                        mode="write"
                    />

                    {/* Legal Research */}
                    <CategorySection
                        icon={<Search className="h-5 w-5" />}
                        title="Legal Research"
                        description="Research legal topics and cases"
                        prompts={samplePrompts.research}
                        onPromptClick={(prompt) => onPromptClick(prompt, 'research')}
                        mode="research"
                    />
                </div>
            </div>
        </div>
    );
};

const CategorySection = ({ 
    icon, 
    title, 
    description, 
    prompts, 
    onPromptClick, 
    mode 
}: { 
    icon: React.ReactNode, 
    title: string, 
    description: string,
    prompts: string[], 
    onPromptClick: (prompt: string) => void,
    mode: AppMode
}) => {
    return (
        <div className="flex flex-col space-y-3">
            {/* Category Header */}
            <div className="flex flex-col items-center text-center space-y-2 mb-2">
                <div className="h-8 w-8 text-muted-foreground">
                    {icon}
                </div>
                <div>
                    <h3 className="font-medium text-base">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
            </div>

            {/* Prompts */}
            <div className="space-y-2">
                {prompts.map((prompt, i) => (
                    <Button
                        key={i}
                        variant="ghost"
                        className="w-full text-left h-auto py-2.5 px-3 text-xs justify-start hover:bg-secondary/50 border border-border/50 rounded-lg"
                        onClick={() => onPromptClick(prompt)}
                    >
                        <span className="line-clamp-2 text-muted-foreground">"{prompt}" →</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
