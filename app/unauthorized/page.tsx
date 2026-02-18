import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border max-w-md w-full">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 mb-8">
                    You don't have permission to access this department. Please contact your administrator if you believe this is an error.
                </p>
                <Link href="/">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 h-11">
                        Return to My Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}
