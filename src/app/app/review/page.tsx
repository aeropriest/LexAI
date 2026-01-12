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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';

export default function ReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      // TODO: Upload to Firebase Storage and save metadata to Firestore
      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        url: '', // Will be Firebase Storage URL
      };
      
      setDocuments(prev => [...prev, newDoc]);
      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    if (selectedDocument?.id === docId) {
      setSelectedDocument(null);
    }
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
          
          <main className="flex-1 overflow-hidden p-4 space-y-4">
            {/* Dropzone */}
            <Card 
              className={`border-2 border-dashed transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop documents here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild variant="outline" size="sm">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Browse Files
                  </label>
                </Button>
              </CardContent>
            </Card>

            {/* Document List and Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
              {/* Document List */}
              <Card className="lg:col-span-1 overflow-hidden flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto space-y-2">
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No documents uploaded yet
                    </p>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedDocument?.id === doc.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-secondary/50'
                        }`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm truncate">{doc.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Chat */}
              <div className="lg:col-span-2">
                <Chat
                  chatId="review-chat"
                  documentText={selectedDocument?.name || ''}
                  messages={messages}
                  setMessages={setMessages}
                  suggestedQuestions={suggestedQuestions}
                  setSuggestedQuestions={setSuggestedQuestions}
                  isLoggedIn={!!user}
                />
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
