import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Redirect based on role
  const role = session.user.role?.toLowerCase();
  if (role) {
    redirect(`/${role}`);
  }

  return redirect("/login");
}
