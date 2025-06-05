import { initTRPC, TRPCError } from "@trpc/server";
import { createContext } from "./context"; // Assuming a context file exists
// import superjson from "superjson"; // No longer needed for this basic example

export const createTRPCContext = createContext; // Use the imported createContext

const t = initTRPC.context<typeof createTRPCContext>().create({
  // transformer: superjson, // No longer needed for this basic example
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        // Simplified error formatting
        message: error.message,
        code: error.code,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // Infer the user type from your context
      user: ctx.user,
    },
  });
});

// Example of a context file (create this separately)
// export const createContext = ({ req, res }) => ({ req, res });

// Example of a user type (define this in a shared types file)
// export type User = { id: string; email: string; name: string | null }; 