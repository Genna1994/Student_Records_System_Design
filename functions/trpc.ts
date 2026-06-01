import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl(): string {
  // In the browser, use a relative URL — works on any domain (localhost OR Vercel)
  if (typeof window !== "undefined") return "";

  // Server-side: use the Vercel deployment URL if available
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Local fallback
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
