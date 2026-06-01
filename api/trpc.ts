import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";          
import { createContext } from "./context";     

export const config = {
  runtime: "nodejs20.x",
  maxDuration: 30,
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, trpc-accept",
      },
    });
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC error on /${path}]`, error);
    },
  });

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, trpc-accept");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
