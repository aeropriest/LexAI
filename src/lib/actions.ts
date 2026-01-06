'use server';

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
import { z } from 'zod';

const askQuestionSchema = z.object({
  documentText: z.string().min(1, { message: 'Document text cannot be empty.' }),
  question: z.string().min(1, { message: 'Question cannot be empty.' }),
});

export async function askQuestionAction(
  prevState: any,
  formData: FormData
) {
  try {
    const validatedData = askQuestionSchema.safeParse({
      documentText: formData.get('documentText'),
      question: formData.get('question'),
    });
    
    if (!validatedData.success) {
      return {
        answer: null,
        suggestedQuestions: [],
        error: validatedData.error.errors.map((e) => e.message).join(' '),
      };
    }
    
    const { documentText, question } = validatedData.data;

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
