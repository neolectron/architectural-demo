/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import appCss from '../styles.css?url';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [{ title: 'Server Function Effect Repro' }, { charSet: 'utf-8' }],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <main className="shell">
          <nav className="nav">
            <Link to="/">Dashboard</Link>
            <Link to="/customers">Customers</Link>
            <Link to="/appointments">Appointments</Link>
          </nav>
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}
