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

export async function classifyEmail(user: User, email: Email) {
  console.log("Classifying email", user, email);
  const prompt = `Subject: ${email.subject}

Body:

${email.body}`;

  console.log("Prompt", prompt);

  const result = await generateObject({
    model: google('gemini-2.0-pro-exp-02-05'),
    system: `You job is to analyze the email provided by the user and return a JSON object with key information about it.

Context:
The user's name is ${user.name} and their email address is ${user.email}`,
    prompt,
    schema: z.object({
      subject: z.string().describe("a short, straight to the point description of what the email is about, from the point of view of the receiving user. Aim for 4 words or less. This should be the most important information about the email, allowing the user to skim over the list and quickly understand what this is about."),
      summary: z.string().describe("a short straight to the point description of the email contents and purpose, from the point of view of the receiving user. Aim for 10 words or less. It should fit in a push notification. Prioritize including names of the most important subjects, so the user can easily understand what the email is REALLY about. Avoid repeating any information that is already in the subject. If you include a noun or name in the subject key, avoid repeating it in the summary. Ideally NO WORDS should appear in both the subject and the summary in your response. Avoid duplication."),
      categories: z.array(z.string()).describe(`the names of the categories that are the most relevant. You can choose just one category, none, or multiple. The JSON object should include ONLY the names of the categories. The valid categories are as follows (in the format of name: "description", one per line)

meetings: "Meeting invitations, updates, calendar events"
newsletters: "Newsletters, mailing lists"
shopping: "online purchases, ecommerce, amazon"
`),
      unsub_link: z.string().describe("should include the raw URL of the link to unsubscribe from these emails, if available")
    }),
  });

  console.log("Result", result);
  console.log("Object", result.object);
  console.log("Response JSON", result.toJsonResponse());

  return result.object;
}