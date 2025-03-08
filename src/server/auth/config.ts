import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google"

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import { getUserAccounts, updateAccountTokens } from "../db/queries";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify"
        }
      }
    })
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email_verified) {
        return true
      }
      return false // Do different verification for other providers that don't have `email_verified`
    },
    async session({ session, user }) {
      const googleAccounts = await getUserAccounts(user.id);
      googleAccounts.forEach(async (googleAccount) => {
        if (googleAccount.expires_at * 1000 < Date.now()) {
          // If the access token has expired, try to refresh it
          try {
            // https://accounts.google.com/.well-known/openid-configuration
            // We need the `token_endpoint`.
            const response = await fetch("https://oauth2.googleapis.com/token", {
              method: "POST",
              body: new URLSearchParams({
                client_id: process.env.AUTH_GOOGLE_ID!,
                client_secret: process.env.AUTH_GOOGLE_SECRET!,
                grant_type: "refresh_token",
                refresh_token: googleAccount.refresh_token,
              }),
            });

            const tokensOrError = await response.json();

            if (!response.ok) throw tokensOrError;

            const newTokens = tokensOrError as {
              access_token: string
              expires_in: number
              refresh_token?: string
            };

            await updateAccountTokens(googleAccount.id, newTokens.access_token, newTokens.refresh_token ?? googleAccount.refresh_token);

          } catch (error) {
            console.error("Error refreshing access_token", error)
            // If we fail to refresh the token, return an error so we can handle it on the page
            session.error = "RefreshTokenError"
          }
        }
      });
      return session
    },
    // session: ({ session, user }) => ({
    //   ...session,
    //   user: {
    //     ...session.user,
    //     id: user.id,
    //   },
    // }),
  },
} satisfies NextAuthConfig;
