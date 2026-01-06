'use server';

/**
 * @fileOverview A flow that allows users to upload a legal document and ask questions about it using AI.
 *
 * - answerQuestionsAboutDocument - A function that handles the process of answering questions about a document.
 * - AnswerQuestionsAboutDocumentInput - The input type for the answerQuestionsAboutDocument function.
 * - AnswerQuestionsAboutDocumentOutput - The return type for the answerQuestionsAboutDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutDocumentInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document.'),
  question: z.string().describe('The question about the document.'),
});
export type AnswerQuestionsAboutDocumentInput = z.infer<
  typeof AnswerQuestionsAboutDocumentInputSchema
>;

const AnswerQuestionsAboutDocumentOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerQuestionsAboutDocumentOutput = z.infer<
  typeof AnswerQuestionsAboutDocumentOutputSchema
>;

export async function answerQuestionsAboutDocument(
  input: AnswerQuestionsAboutDocumentInput
): Promise<AnswerQuestionsAboutDocumentOutput> {
  return answerQuestionsAboutDocumentFlow(input);
}

const answerQuestionsAboutDocumentPrompt = ai.definePrompt({
  name: 'answerQuestionsAboutDocumentPrompt',
  input: {schema: AnswerQuestionsAboutDocumentInputSchema},
  output: {schema: AnswerQuestionsAboutDocumentOutputSchema},
  prompt: `You are an AI assistant helping lawyers find information in legal documents.

  Document Text: {{{documentText}}}

  Question: {{{question}}}

  Answer:`, // Provide a concise and relevant answer to the question.
});

const answerQuestionsAboutDocumentFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutDocumentFlow',
    inputSchema: AnswerQuestionsAboutDocumentInputSchema,
    outputSchema: AnswerQuestionsAboutDocumentOutputSchema,
  },
  async input => {
    const {output} = await answerQuestionsAboutDocumentPrompt(input);
    return output!;
  }
);
