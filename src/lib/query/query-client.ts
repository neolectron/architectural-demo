import { MutationCache, QueryClient } from '@tanstack/react-query';

let queryClient: QueryClient | null = null;

export function getQueryClientSingleton() {
  if (queryClient) return queryClient;

  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
      },
    },
    mutationCache: new MutationCache({
      onSuccess: () => {
        void queryClient?.invalidateQueries();
      },
    }),
  });

  return queryClient;
}
