import type { AccountRole } from "../auth/types";

type UserLike = {
  user_metadata?: {
    role?: unknown;
  };
};

export function getUserRole(user: UserLike | null | undefined): AccountRole {
  const rawRole = user?.user_metadata?.role;
  return rawRole === "driver" ? "driver" : "rider";
}
