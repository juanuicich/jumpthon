import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { emails } from "~/server/db/schema";

export const emailRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ subject: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(emails).values({
        subject: input.subject,
        ownedById: ctx.session.user.id,
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const email = await ctx.db.query.emails.findFirst({
      orderBy: (emails, { desc }) => [desc(emails.createdAt)],
    });

    return email ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
