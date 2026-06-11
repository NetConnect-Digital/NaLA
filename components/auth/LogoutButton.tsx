"use client";

import { useRouter } from "next/navigation";
import { useLogout } from "@/lib/auth-hooks";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();
  return (
    <Button
      variant="outline"
      onClick={() =>
        logout.mutate(undefined, {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        })
      }
      disabled={logout.isPending}
    >
      {logout.isPending ? "Logging out…" : "Log Out"}
    </Button>
  );
}
