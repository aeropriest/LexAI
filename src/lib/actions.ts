'use server';

import { addDoc, collection, doc, getDocs, query, where, updateDoc, serverTimestamp, getDoc, orderBy, limit } from 'firebase/firestore';
import {
  answerQuestionsAboutDocument,
  AnswerQuestionsAboutDocumentInput,
} from '@/ai/flows/answer-questions-about-document';
import {
  extractTextFromFile,
  ExtractTextFromFileInput,
} from '@/ai/flows/extract-text-from-file';
import {
  generateSuggestedQuestions,
  GenerateSuggestedQuestionsInput,
} from '@/ai/flows/generate-suggested-questions';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

const auth = getAuth(app);

const askQuestionSchema = z.object({
  documentText: z.string().min(1, { message: 'Document text cannot be empty.' }),
  question: z.string().min(1, { message: 'Question cannot be empty.' }),
  chatId: z.string(),
  isLoggedIn: z.string(),
});

export async function askQuestionAction(
  prevState: any,
  formData: FormData
) {
  try {
    const validatedData = askQuestionSchema.safeParse({
      documentText: formData.get('documentText'),
      question: formData.get('question'),
      chatId: formData.get('chatId'),
      isLoggedIn: formData.get('isLoggedIn'),
    });
    
    if (!validatedData.success) {
      return {
        answer: null,
        suggestedQuestions: [],
        error: validatedData.error.errors.map((e) => e.message).join(' '),
      };
    }
    
    const { documentText, question, chatId, isLoggedIn } = validatedData.data;

    const answerInput: AnswerQuestionsAboutDocumentInput = {
      documentText,
      question,
    };
    const { answer } = await answerQuestionsAboutDocument(answerInput);

    const suggestionsInput: GenerateSuggestedQuestionsInput = {
      documentContent: documentText,
      previousQuestion: question,
    };
    const { suggestedQuestions } = await generateSuggestedQuestions(suggestionsInput);

    if (isLoggedIn === 'true') {
        const chatRef = doc(db, 'chats', chatId);
        const messagesCollection = collection(chatRef, 'messages');
        await addDoc(messagesCollection, {
            role: 'user',
            content: question,
            createdAt: serverTimestamp(),
        });
        await addDoc(messagesCollection, {
            role: 'assistant',
            content: answer,
            createdAt: serverTimestamp(),
        });
    }

    return { answer, suggestedQuestions: suggestedQuestions.slice(0, 3), error: null };
  } catch (error) {
    console.error(error);
    return {
      answer: null,
      suggestedQuestions: [],
      error: 'An error occurred while processing your question. Please try again.',
    };
  }
}

const extractTextSchema = z.object({
  fileDataUri: z.string().min(1, { message: 'File data URI is missing.' }),
});

export async function extractTextAction(
  prevState: any,
  formData: FormData
) {
  try {
    const validatedData = extractTextSchema.safeParse({
      fileDataUri: formData.get('fileDataUri'),
    });

    if (!validatedData.success) {
      return {
        extractedText: null,
        error: validatedData.error.errors.map((e) => e.message).join(' '),
      };
    }

    const { fileDataUri } = validatedData.data;

    const extractInput: ExtractTextFromFileInput = { fileDataUri };
    const { extractedText } = await extractTextFromFile(extractInput);
    
    return { extractedText, error: null };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      extractedText: null,
      error: `An error occurred while extracting text from the file. Please ensure it is a valid document or image. Details: ${errorMessage}`,
    };
  }
}

const signUpSchema = z.object({
    firstName: z.string().min(1, { message: 'First name is required.' }),
    lastName: z.string().min(1, { message: 'Last name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export async function signUpAction(prevState: any, formData: FormData) {
    try {
        const validatedData = signUpSchema.safeParse(Object.fromEntries(formData));

        if (!validatedData.success) {
            return { error: validatedData.error.flatten().fieldErrors };
        }

        const { email, password, firstName, lastName } = validatedData.data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await addDoc(collection(db, 'users'), {
            uid: user.uid,
            firstName,
            lastName,
            email,
            createdAt: new Date(),
        });

        return { success: true };
    } catch (error: any) {
        return { error: { _errors: [error.message] } };
    }
}

const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});

export async function loginAction(prevState: any, formData: FormData) {
    try {
        const validatedData = loginSchema.safeParse(Object.fromEntries(formData));

        if (!validatedData.success) {
            return { error: validatedData.error.flatten().fieldErrors };
        }

        const { email, password } = validatedData.data;
        await signInWithEmailAndPassword(auth, email, password);

        return { success: true };
    } catch (error: any) {
        return { error: { _errors: [error.message] } };
    }
}


const newChatSchema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    documentText: z.string(),
    userId: z.string(),
});

export async function createNewChat(prevState: any, formData: FormData) {
    try {
        const validatedData = newChatSchema.safeParse(Object.fromEntries(formData));
        if (!validatedData.success) {
            return { error: validatedData.error.flatten().fieldErrors };
        }

        const { title, description, documentText, userId } = validatedData.data;

        const chatRef = await addDoc(collection(db, 'chats'), {
            userId,
            title,
            description,
            documentText,
            createdAt: serverTimestamp(),
        });
        
        const welcomeMessage = {
            role: 'assistant',
            content: 'Document loaded. What would you like to know?',
            createdAt: serverTimestamp(),
        };

        if (documentText) {
            await addDoc(collection(chatRef, 'messages'), welcomeMessage);
        }

        const newChat = await getDoc(chatRef);
        const chatData = newChat.data();
        
        revalidatePath('/app');
        return { 
            success: true, 
            chat: {
                id: newChat.id,
                ...chatData,
                messages: documentText ? [ {id: '0', ...welcomeMessage} ] : []
            } 
        };

    } catch (error: any) {
        return { error: { _errors: [error.message] } };
    }
}

export async function getChatsForUser(userId: string) {
    const chatsQuery = query(collection(db, 'chats'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(chatsQuery);
    const chats = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const messagesQuery = query(collection(doc.ref, 'messages'), orderBy('createdAt', 'asc'));
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(msgDoc => ({ id: msgDoc.id, ...msgDoc.data() }));
        return { id: doc.id, ...doc.data(), messages };
    }));
    return chats;
}

export async function updateDocumentAction(chatId: string, documentText: string) {
    try {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, { documentText });
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}