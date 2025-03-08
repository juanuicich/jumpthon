import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getUserCategories, getUserEmails, getUserEmailsWithFilters } from "~/server/db/queries";

export const emailRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return getUserEmails();
  }),

  getFiltered: protectedProcedure
    .input(
      z.object({
        starred: z.boolean().optional(),
        read: z.boolean().optional(),
        categoryId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      return getUserEmailsWithFilters(input);
    }),

  getCategories: protectedProcedure.query(async () => {
    return getUserCategories();
  }),
});
