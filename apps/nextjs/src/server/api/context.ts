import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
// import { type Session } from "next-auth"; // Assuming next-auth for session management
import { db } from "../db"; // Assuming your Drizzle db instance is exported from here

// Define a simple User type for the context
interface User {
  id: string;
  email: string;
  name: string | null;
  // Add other user properties you need in the backend
}

/**
 * This is the actual context you'll use in your tRPC procedures.
 * It comes from a tRPC middleware that has access to things like the
 * request and response, as well as any middleware previously ran.
 *
 * @see https://trpc.io/docs/context
 */
export const createContext = (opts: CreateNextContextOptions) => {
  // TODO: Implement logic to get the authenticated user session
  // Example using next-auth:
  // const getSession = async () => {
  //   // Logic to get session from request/headers
  //   return null; // Placeholder
  // };

  // const session = getSession();

  // In a real implementation, you would get the user based on the session/token
  const user: User | null = null; // Placeholder: replace with actual user object if authenticated

  return { ...opts, db, user }; // Include db and user in context
};

// Example of a user type (define this in a shared types file, e.g., packages/types/index.ts)
// export type User = { id: string; email: string; name: string | null }; 