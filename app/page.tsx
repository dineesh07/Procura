import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Redirect based on role
  const role = session.user.role;
  if (role === "SALES") redirect("/sales");
  if (role?.includes("PPC")) redirect("/ppc");
  if (role?.includes("MATERIALS")) redirect("/materials");
  if (role === "PURCHASE") redirect("/purchase");

  return redirect("/login");
}
