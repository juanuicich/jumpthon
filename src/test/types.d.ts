// Define global types for tests
interface Category {
  id: string;
  name: string;
  description: string;
  color: string | null;
  icon: string | null;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  created_at: string;
  category_id?: string | null;
  identity_id?: string | null;
  gmail_id?: string | null;
}

interface EmailSummary {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  created_at: string;
  category_id?: string | null;
  identity_id?: string | null;
  gmail_id?: string | null;
}

interface Account {
  id: string;
  identity_id: string;
  email: string | null;
  name: string | null;
  picture_url: string | null;
  access_token: string | null;
  refresh_token: string | null;
  user_id: string | null;
}

// Extend the vitest expectations
interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveTextContent(text: string): R;
  toHaveAttribute(attr: string, value?: string): R;
}

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}