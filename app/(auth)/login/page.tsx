"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                console.error("Login Result Error:", result.error);
                toast.error(`Login failed: ${result.error || "Check credentials"}. Try sales@procura.com / password123`);
            } else {
                toast.success("Welcome back!");
                router.push("/"); // Middleware or Layout will handle role redirect
            }
        } catch (error) {
            toast.error("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-white w-6 h-6" />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tighter text-blue-600">PROCURA</CardTitle>
                    <CardDescription className="text-slate-500 font-medium italic mt-1">
                        "Manage Smart. Produce Better."
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <Input
                                type="email"
                                placeholder="sales@procura.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full mt-4" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col text-center border-t p-6 bg-slate-50/50">
                    <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest text-blue-600">Demo Credentials</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                        <span>sales@procura.com</span>
                        <span>ppc@procura.com</span>
                        <span>materials@procura.com</span>
                        <span>purchase@procura.com</span>
                        <span className="col-span-2">Password: password123</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
