import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createTRPCServerClient } from "./utils/trpc";

/**
 * Middleware function to handle authentication and redirection based on user login status and URL path.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object after processing the middleware logic.
 *
 * This middleware performs the following checks:
 * 1. If the user is logged in and trying to access authentication-related pages (login or register),
 *    it redirects them to the root URL ("/").
 * 2. If the user does not have a valid refresh token and is trying to access a page that requires authentication,
 *    it redirects them to the login page ("/login").
 * 3. If the user is not logged in but has a refresh token and is trying to access a page that requires authentication,
 *    it attempts to refresh the access token.
 */
export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const loggedIn = request.cookies.get("logged_in");
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const authUrls = new Set(["/login", "/register"]);

  if (loggedIn && authUrls.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!refreshToken && !authUrls.has(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!loggedIn && refreshToken && !authUrls.has(pathname)) {
    await refreshAccessToken(request, response, refreshToken);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

async function refreshAccessToken(
  request: NextRequest,
  response: NextResponse,
  refreshToken: string
) {
  try {
    const client = createTRPCServerClient({
      Cookie: `refreshToken=${refreshToken}`,
    });

    const { accessToken } = await client.auth.refreshAccessToken.mutate();

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    response.cookies.set("logged_in", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
