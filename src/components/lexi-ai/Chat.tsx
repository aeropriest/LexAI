'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { Bot, User, Send, FileWarning, Lightbulb, Loader2, MessageSquare } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { askQuestionAction } from '@/lib/actions';
import type { ChatMessage, SuggestedQuestion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatProps {
  chatId: string;
  documentText: string;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  setSuggestedQuestions: (questions: SuggestedQuestion[]) => void;
  suggestedQuestions: SuggestedQuestion[];
  isLoggedIn: boolean;
}

function ChatInputForm({ documentText, question, setQuestion, chatId, isLoggedIn, documentRequired }: { documentText: string, question: string, setQuestion: (q: string) => void, chatId: string, isLoggedIn: boolean, documentRequired: boolean}) {
  const { pending } = useFormStatus();

  return (
    <div className="relative flex w-full items-center">
      <Input
        name="question"
        placeholder={documentRequired && !documentText ? "Please add a document first" : "Message LexiAI..."}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={(documentRequired && !documentText) || pending}
        autoComplete="off"
        className="pr-12 h-12 rounded-full border-border/50 bg-secondary/50 focus-visible:ring-1"
      />
      <input type="hidden" name="documentText" value={documentText} />
      <input type="hidden" name="chatId" value={chatId} />
      <input type="hidden" name="isLoggedIn" value={String(isLoggedIn)} />
      <Button 
        type="submit" 
        size="icon" 
        disabled={(documentRequired && !documentText) || pending || !question.trim()}
        className="absolute right-1.5 h-9 w-9 rounded-full"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}


function ChatBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';
  return (
    <div
      className={cn(
        'flex items-start gap-4',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <Avatar className="h-8 w-8 border bg-secondary">
          <AvatarFallback className="bg-transparent">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-xl rounded-lg p-3',
          isAssistant
            ? 'bg-secondary'
            : 'bg-primary text-primary-foreground'
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
          {message.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
      {!isAssistant && (
        <Avatar className="h-8 w-8 border">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export function Chat({
  chatId,
  documentText,
  messages,
  setMessages,
  suggestedQuestions,
  setSuggestedQuestions,
  isLoggedIn,
}: ChatProps) {
  const [question, setQuestion] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const documentRequired = documentText !== null;


  const [state, formAction] = useActionState(askQuestionAction, {
    answer: null,
    suggestedQuestions: [],
    error: null,
  });
  
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.answer) {
      setMessages([
        ...messages,
        { id: String(Date.now()), role: 'assistant', content: state.answer },
      ]);
      setSuggestedQuestions(state.suggestedQuestions || []);
    } else if (state.error) {
      setMessages([
        ...messages,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: state.error,
        },
      ]);
      setSuggestedQuestions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);

  const handleFormSubmit = (formData: FormData) => {
    const currentQuestion = formData.get('question') as string;
    if (!currentQuestion.trim()) return;

    setMessages([
      ...messages,
      { id: String(Date.now()), role: 'user', content: currentQuestion },
    ]);
    setQuestion('');
    setSuggestedQuestions([]);
    formAction(formData);
  };
  
  const handleSuggestedQuestionClick = (sq: SuggestedQuestion) => {
    const formData = new FormData();
    formData.append('question', sq);
    formData.append('documentText', documentText);
    formData.append('chatId', chatId);
    formData.append('isLoggedIn', String(isLoggedIn));

    
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: 'user', content: sq },
    ]);
    setSuggestedQuestions([]);
    
    formAction(formData);
  }

  return (
    <div className="h-full flex flex-col border border-border/50 rounded-lg bg-card">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="px-4 py-6">
            <div className="space-y-6">
              {messages.length === 0 && documentRequired && !documentText ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-20">
                  <FileWarning className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No document loaded</p>
                  <p className="text-xs">Paste your document to start asking questions.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-20">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-xs">Ask a question to get started.</p>
                </div>
              ) : (
                messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
              )}
              { pending && <ChatBubble message={{id: 'loading', role: 'assistant', content: 'Thinking...'}}/> }
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && !pending && (
        <div className="border-t">
          <div className="px-4 py-3">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Lightbulb className="h-3 w-3"/> Suggested Questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((sq, i) => (
                  <Button key={i} variant="outline" size="sm" className="text-xs h-7" onClick={() => handleSuggestedQuestionClick(sq)}>
                    {sq}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t">
        <div className="px-4 py-3">
          <form action={handleFormSubmit} className="w-full">
            <ChatInputForm 
              documentText={documentText} 
              question={question} 
              setQuestion={setQuestion} 
              chatId={chatId} 
              isLoggedIn={isLoggedIn} 
              documentRequired={documentRequired}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
