import { auth } from "@/lib/auth";
import DashboardLayoutComponent from "@/components/layout/DashboardLayout";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const role = session.user.role || "SALES";
    const name = session.user.name || "User";

    return (
        <DashboardLayoutComponent role={role} userName={name}>
            {children}
        </DashboardLayoutComponent>
    );
}
