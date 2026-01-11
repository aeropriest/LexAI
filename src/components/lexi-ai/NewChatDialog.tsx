'use client';

import { useState, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createNewChat } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { Loader2, Scale, Pencil, Search } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const newChatSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty.' }),
  description: z.string().optional(),
  documentText: z.string().optional(),
  mode: z.enum(['review', 'write', 'research'], {
    required_error: "You need to select a chat mode.",
  }),
});

interface NewChatDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: (newChat: any) => void;
}

export function NewChatDialog({ isOpen, onOpenChange, onSuccess }: NewChatDialogProps) {
  const { toast } = useToast();
  const auth = getAuth();
  const user = auth.currentUser;

  const [state, formAction] = useActionState(createNewChat, { error: null });

  const form = useForm<z.infer<typeof newChatSchema>>({
    resolver: zodResolver(newChatSchema),
    defaultValues: { title: '', description: '', documentText: '', mode: 'review' },
  });

  useEffect(() => {
    if (state?.success && state.chat) {
      toast({
        title: 'Success!',
        description: 'New chat created.',
      });
      onSuccess(state.chat);
      onOpenChange(false);
      form.reset();
    }
    if (state?.error) {
      const errorMsg = state.error._errors?.join(', ') || 'Failed to create chat.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
    }
  }, [state, onSuccess, onOpenChange, toast, form]);

  const { isSubmitting } = form.formState;

  const handleSubmit = (data: z.infer<typeof newChatSchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a chat.' });
        return;
    }
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('documentText', data.documentText || '');
    formData.append('userId', user.uid);
    formData.append('mode', data.mode);
    formAction(formData);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>Enter the details for your new chat session.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Chat Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                            <RadioGroupItem value="review" id="review" className="sr-only peer" />
                        </FormControl>
                        <FormLabel htmlFor="review" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Scale className="mb-3 h-6 w-6" />
                            Review
                        </FormLabel>
                      </FormItem>
                       <FormItem>
                        <FormControl>
                            <RadioGroupItem value="write" id="write" className="sr-only peer" />
                        </FormControl>
                        <FormLabel htmlFor="write" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Pencil className="mb-3 h-6 w-6" />
                            Write
                        </FormLabel>
                      </FormItem>
                       <FormItem>
                        <FormControl>
                            <RadioGroupItem value="research" id="research" className="sr-only peer" />
                        </FormControl>
                        <FormLabel htmlFor="research" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <Search className="mb-3 h-6 w-6" />
                            Research
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="e.g., NDA Review for Project X" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Input placeholder="A brief description of the chat" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Paste document text here..." {...field} className="min-h-[150px]"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Chat" }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
