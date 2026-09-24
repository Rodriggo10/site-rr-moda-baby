import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, tokenEsperado } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/produtos") || pathname.startsWith("/api/upload")) {
    // GET em /api/produtos é público (catálogo lê os produtos) — só protege escrita e o painel
    if (pathname.startsWith("/api/produtos") && request.method === "GET") {
      return NextResponse.next();
    }

    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
    if (cookie !== (await tokenEsperado())) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/produtos/:path*", "/api/upload/:path*"],
};
