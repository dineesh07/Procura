import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;
    const { nextUrl } = req;

    console.log(`[Middleware] Path: ${nextUrl.pathname} | LoggedIn: ${isLoggedIn} | Role: ${role}`);

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPublicRoute = ["/login"].includes(nextUrl.pathname);

    if (isApiAuthRoute) return NextResponse.next();

    // 1. Redirect if not logged in
    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // 2. Redirect to dashboard if logged in and trying to access login
    if (isLoggedIn && isPublicRoute) {
        const dashboardPath = `/${role?.toLowerCase() || "sales"}`;
        return NextResponse.redirect(new URL(dashboardPath, nextUrl));
    }

    // 3. Role-Based Protection
    const rolePaths: Record<string, string> = {
        SALES: "/sales",
        PPC: "/ppc",
        MATERIALS: "/materials",
        PURCHASE: "/purchase",
        MANAGEMENT: "/management",
    };

    // Check if user is trying to access a restricted path
    for (const [r, path] of Object.entries(rolePaths)) {
        if (nextUrl.pathname.startsWith(path) && role !== r) {
            return NextResponse.redirect(new URL("/unauthorized", nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
