import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../../services/auth.service";
import { useAuthStore } from "../../../stores/auth.store";

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        setUser(user);
        return user;
      } catch (error) {
        clearUser();
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
