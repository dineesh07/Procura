import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const session = req.auth;
    const isLoggedIn = !!session;
    const userRole = session?.user?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPublicRoute = ["/login"].includes(nextUrl.pathname);

    if (isApiAuthRoute) return null;

    if (isPublicRoute) {
        if (isLoggedIn) {
            // Redirect to appropriate dashboard if already logged in
            if (userRole === "SALES") return NextResponse.redirect(new URL("/sales", nextUrl));
            if (userRole?.includes("PPC")) return NextResponse.redirect(new URL("/ppc", nextUrl));
            if (userRole?.includes("MATERIALS")) return NextResponse.redirect(new URL("/materials", nextUrl));
            if (userRole === "PURCHASE") return NextResponse.redirect(new URL("/purchase", nextUrl));
        }
        return null;
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Role-based route protection
    const pathname = nextUrl.pathname;

    // PPC Team
    if (pathname.startsWith('/ppc')) {
        const ppcRoles = ['PPC_MANAGER', 'PPC_EMPLOYEE'];
        if (!ppcRoles.includes(userRole as string)) return NextResponse.redirect(new URL("/unauthorized", nextUrl));

        // Manager only paths
        const managerOnly = ['/ppc/orders', '/ppc/variance', '/ppc/team'];
        if (managerOnly.some(p => pathname.startsWith(p)) && userRole !== 'PPC_MANAGER') {
            return NextResponse.redirect(new URL("/unauthorized", nextUrl));
        }
    }

    // Materials Team
    if (pathname.startsWith('/materials')) {
        const materialsRoles = ['MATERIALS_MANAGER', 'MATERIALS_EMPLOYEE'];
        if (!materialsRoles.includes(userRole as string)) return NextResponse.redirect(new URL("/unauthorized", nextUrl));

        // Manager only paths
        const managerOnly = ['/materials/requests', '/materials/variance', '/materials/team'];
        if (managerOnly.some(p => pathname.startsWith(p)) && userRole !== 'MATERIALS_MANAGER') {
            return NextResponse.redirect(new URL("/unauthorized", nextUrl));
        }
    }

    // Sales (single user)
    if (pathname.startsWith('/sales') && userRole !== 'SALES') {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    // Purchase (single user)
    if (pathname.startsWith('/purchase') && userRole !== 'PURCHASE') {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    // Block management route completely
    if (pathname.startsWith('/management')) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }

    return null;
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
