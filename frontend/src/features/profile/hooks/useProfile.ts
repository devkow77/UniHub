import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../../services/auth.service";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
    retry: false,
  });
}
