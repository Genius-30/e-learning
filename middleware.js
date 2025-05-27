import { NextResponse } from "next/server";

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "https://8r6t3jcx-3000.inc1.devtunnels.ms",
];

export function middleware(request) {
  const origin = request.headers.get("origin") ?? "";

  // Only process CORS headers for allowed origins
  if (!allowedOrigins.includes(origin)) {
    return NextResponse.next();
  }

  // Handle Preflight (OPTIONS) Request
  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 }); // No content response
    preflight.headers.append("Access-Control-Allow-Origin", origin);
    preflight.headers.append("Access-Control-Allow-Credentials", "true");
    preflight.headers.append(
      "Access-Control-Allow-Methods",
      "GET,DELETE,PATCH,POST,PUT,OPTIONS"
    );
    preflight.headers.append(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, multipart/form-data"
    );
    return preflight;
  }

  // Handle Normal Requests
  const res = NextResponse.next();
  res.headers.append("Access-Control-Allow-Origin", origin);
  res.headers.append("Access-Control-Allow-Credentials", "true");
  res.headers.append(
    "Access-Control-Allow-Methods",
    "GET,DELETE,PATCH,POST,PUT,OPTIONS"
  );
  res.headers.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, multipart/form-data"
  );

  return res;
}

export const config = {
  matcher: "/api/:path*",
};
