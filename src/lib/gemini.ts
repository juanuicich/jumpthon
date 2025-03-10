import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

interface User {
  name: string;
  email: string;
}

interface Email {
  subject: string;
  body: string;
}

interface LLMResponse {
  subject: string;
  summary: string;
  category: string;
  unsub_link: string;
}

interface LLMCheck {
  status: "OK" | "error";
  message: string;
}

export async function classifyEmail(user: User, email: Email, categories: Category[]): Promise<LLMResponse> {
  const prompt = `Subject: ${email.subject}

Body:

${email.body}`;

  const categoryNames = categories.map((category) => `${category.name}: "${category.description}"`).join("\n");

  const result = await generateObject({
    model: google('gemini-2.0-flash-001'),
    system: `You job is to analyze and summarize the email provided by the user and return a JSON object with key information. Focus on succint actionable information that the user can quickly understand and act upon. The email should be summarized in a way that is easy to understand and act upon.

Context:
The user's name is ${user.name} and their email address is ${user.email}`,
    prompt,
    schema: z.object({
      subject: z.string().describe("Short and straight to the point description of what the email is about, from the point of view of the receiving user. Aim for 4 words or less. This should be the most important information about the email, allowing the user to skim over the list and quickly understand what this is about."),
      summary: z.string().describe("Short and straight to the point description of the email contents and purpose, from the point of view of the receiving user. Aim for 30 words or less. If content is a list of \"top news\" or \"top links\" don't include that in the summary. If recipient must perform an action, mention that FIRST. Prioritize including names of the most important subjects, so the user can easily understand what the email is REALLY about. Avoid repeating any information that is already in the subject. If you include a noun or name in the subject key, avoid repeating it in the summary. Ideally NO WORDS should appear in both the subject and the summary in your response. Avoid duplication and superfluous text, prefer bullet points (joined by commas)."),
      category: z.string().describe(`the name of the category that is the most relevant. You can choose just one category or none. Respond with the name of the category. The valid categories are as follows (only use the exact name):

${categoryNames}`),
      unsub_link: z.string().describe("should include the raw URL of the link to unsubscribe from these emails, if available")
    }),
  });


  return result.object;
}

export async function checkUnsub(response: string): Promise<LLMCheck> {

  const result = await generateObject({
    model: google("gemini-2.0-flash-lite-preview-02-05"),
    system: `Your job is to analyze the response from an AI and tell me if the task was completed successfully or not. The AI has attempted to unsubscribe from an email. You need to read the response and determine if the AI was successful in unsubscribing from the email. Respond by generating the correct JSON response`,
    prompt: response,
    schema: z.object({
      status: z.enum(["OK", "error"]).describe("The status of the task. If the task was successful, respond with OK. If there was an error, respond with error. If the task was successful, the AI has successfully unsubscribed from the email. If there was an error, the AI was not able to unsubscribe from the email."),
      message: z.string().describe("Describe the reason for your decision. If the task was successful, you can respond with a simple message like 'Unsubscribed successfully'. If there was an error, you should describe the error message in detail.")
    })
  });


  return result.object;
}
