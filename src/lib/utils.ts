import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses an email header to extract name and email address
 * @param fromHeader Email header string like "Name <email@example.com>"
 * @returns Object with name and email properties
 */
export function parseEmailSender(fromHeader: string): { name: string; email: string } {
  // Default values
  let name = '';
  let email = fromHeader;

  // Check if it follows the "Name <email>" format
  const match = fromHeader.match(/^(.*?)\s*<([^>]+)>$/);

  if (match) {
    name = match[1]?.trim() || '';
    email = match[2]?.trim() || '';
  }

  return { name, email };
}

// Get initials for avatar fallback
export const getInitial = (name: string) => {
  if (!name) return "";
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.length > 0 ? cleaned.charAt(0).toUpperCase() : "";
}

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  return url
}

export const oAuthOptions = () => {
  const baseUrl = getURL();
  return {
    redirectTo: `${baseUrl}auth/callback`,
    queryParams: {
      prompt: "consent",
      access_type: "offline",
      scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify"
    }
  }
}