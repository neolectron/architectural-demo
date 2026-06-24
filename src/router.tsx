import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { routeTree } from './routeTree.gen.ts';
import { getQueryClientSingleton } from './lib/query/query-client.ts';

export function getRouter() {
  const queryClient = getQueryClientSingleton();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}
