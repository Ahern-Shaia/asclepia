import NextAuth from "next-auth";
import { getAuthOptions } from "@/server/auth";

type Context = { params: Promise<{ nextauth: string[] }> };

// Options are built per request (lazily cached) so a deployment without auth env still builds.
async function handler(req: Request, context: Context): Promise<Response> {
  return NextAuth(getAuthOptions())(req, context);
}

export { handler as GET, handler as POST };
