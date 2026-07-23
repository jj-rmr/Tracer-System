"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite/appwrite-client";
import { getRole } from "@/lib/auth/roles";
import type { Role } from "@/types";

export default function AuthGuard({
  children,
}: {
  children: (role: Role) => React.ReactNode;
}) {
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
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

        const userRole = getRole(user);

        if (!userRole) {
          router.replace("/unauthorized");
          return;
        }

        if (mounted) {
          setRole(userRole);
        }
      } catch (error) {
        console.error("Client authentication failed:", error);
        router.replace("/signin");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return <>{children(role)}</>;
}
