import { NextResponse } from "next/server";

export async function middleware(req) {
  const adminToken = req.cookies.get("adminToken")?.value;
  const userRefreshToken = req.cookies.get("refreshToken")?.value;

  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isUserRoute = pathname.startsWith("/dashboard");
  const isHomePage = pathname === "/";

  // 🔹 Allow access to /admin/login even if not authenticated
  if (isAdminRoute && !adminToken && !isAdminLogin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // 🔹 Redirect logged-in admins from login page
  if ((isAdminLogin || pathname === "/admin") && adminToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // 🔹 USER AUTHENTICATION (Protecting Dashboard Routes)
  if (isUserRoute && !userRefreshToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🔹 REDIRECT LOGGED-IN USERS FROM HOME PAGE
  if (isHomePage && userRefreshToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// 🔹 Apply middleware to specific routes
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/"],
};
