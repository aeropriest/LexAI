'use server';
/**
 * @fileOverview Flow to generate suggested follow-up questions based on the user's previous question and the document content.
 *
 * - generateSuggestedQuestions - A function that generates suggested questions.
 * - GenerateSuggestedQuestionsInput - The input type for the generateSuggestedQuestions function.
 * - GenerateSuggestedQuestionsOutput - The return type for the generateSuggestedQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSuggestedQuestionsInputSchema = z.object({
  documentContent: z.string().describe('The content of the legal document.'),
  previousQuestion: z.string().describe('The user\'s previous question.'),
});

export type GenerateSuggestedQuestionsInput = z.infer<
  typeof GenerateSuggestedQuestionsInputSchema
>;

const GenerateSuggestedQuestionsOutputSchema = z.object({
  suggestedQuestions: z
    .array(z.string())
    .describe('An array of suggested follow-up questions.'),
});

export type GenerateSuggestedQuestionsOutput = z.infer<
  typeof GenerateSuggestedQuestionsOutputSchema
>;

export async function generateSuggestedQuestions(
  input: GenerateSuggestedQuestionsInput
): Promise<GenerateSuggestedQuestionsOutput> {
  return generateSuggestedQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSuggestedQuestionsPrompt',
  input: {schema: GenerateSuggestedQuestionsInputSchema},
  output: {schema: GenerateSuggestedQuestionsOutputSchema},
  prompt: `You are an AI assistant helping lawyers explore legal documents more effectively. Given the content of a document and the lawyer\'s previous question, generate a list of suggested follow-up questions that the lawyer might find useful.

Document Content: {{{documentContent}}}

Previous Question: {{{previousQuestion}}}

Suggested Follow-up Questions:`,
});

const generateSuggestedQuestionsFlow = ai.defineFlow(
  {
    name: 'generateSuggestedQuestionsFlow',
    inputSchema: GenerateSuggestedQuestionsInputSchema,
    outputSchema: GenerateSuggestedQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
