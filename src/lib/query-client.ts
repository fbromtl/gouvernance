import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 1,
    },
    mutations: {
      onError: (error: Error) => {
        toast.error(error.message || "Une erreur est survenue");
      },
    },
  },
});
