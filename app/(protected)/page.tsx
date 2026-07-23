"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite/appwrite-client";
import { getRole } from "@/lib/auth/roles";
import { ROLES } from "@/types";

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      try {
        const user = await account.get();

        if (!user.email.toLowerCase().endsWith("@parsu.edu.ph")) {
          await account.deleteSession("current");
          router.replace("/signin?error=unauthorized_domain");
          return;
        }

        if (!user.emailVerification) {
          router.replace("/verify-email");
          return;
        }

        const role = getRole(user);

        if (role === ROLES.ADMIN) {
          router.replace("/admin");
          return;
        }

        if (role === ROLES.ALUMNI) {
          router.replace("/alumni");
          return;
        }

        router.replace("/unauthorized");
      } catch (error) {
        console.error("Authentication failed:", error);
        router.replace("/signin");
      }
    }

    redirectUser();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Checking authentication...</p>
    </div>
  );
}
