import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            async authorize(credentials) {
                try {
                    console.log("[Auth] --- New Login Attempt ---");
                    console.log("[Auth] Raw Credentials Keys:", Object.keys(credentials || {}));

                    const email = credentials?.email as string;
                    const password = credentials?.password as string;

                    if (!email || !password) {
                        console.log("[Auth] Missing email or password");
                        return null;
                    }

                    console.log(`[Auth] Looking for user: ${email}`);
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        console.log(`[Auth] User NOT found in DB: ${email}`);
                        return null;
                    }

                    console.log(`[Auth] User found! Comparing passwords...`);
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    console.log(`[Auth] Password match result: ${passwordsMatch}`);

                    if (passwordsMatch) {
                        console.log(`[Auth] Success! Returning user object for role: ${user.role}`);
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        };
                    }

                    console.log("[Auth] Password mismatch");
                    return null;
                } catch (error: any) {
                    console.error("[Auth] Fatal error in authorize:", error.message);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.role) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
