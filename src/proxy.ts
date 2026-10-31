import { NextResponse } from "next/server";

// Mockups carry sample data (fake licence numbers). Production answers 404 before any rendering
// happens, unless ENABLE_MOCKUPS=1. A render-time notFound() was tried first and still answered
// 200: the root layout streams its shell before the page throws.
export function proxy() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_MOCKUPS !== "1") {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/mockup", "/mockup/:path*"] };
