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

// Decode the JWT token
export const jwtDecode = (token: string) => {
  try {
    // Simple JWT parsing (without verification)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};