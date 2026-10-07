import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import App from './App';
import { AuthProvider, TOKEN_KEY } from './auth/AuthProvider';

/**
 * Given. The helpers of the tests: read them, don't change them.
 *
 * No browser, no API during the tests. The URL lives in a MemoryRouter
 * instead of the address bar, and `fetch` is replaced by a fake API.
 */

/**
 * The whole app, as main.tsx mounts it, at `route`. With a token, the user
 * is already logged in, as after a reload. A failed request is not retried:
 * the error shows at once.
 */
export function renderApp(route = '/', { token }: { token?: string } = {}) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** One component alone, with a router around it for its <Link>. */
export function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

/**
 * A token as the API makes them: a real header and payload in base64url,
 * valid for an hour. The signature is fake: the front never checks it, only
 * the API can.
 */
export function makeToken({ username = 'alice', role = 'admin' }: { username?: string; role?: 'admin' | 'user' } = {}): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ sub: 'u1', username, role, iat: now, exp: now + 3600 });
  return `${header}.${payload}.fake-signature`;
}

/** What the fake API answers to one request. */
type Handler = (request: Request) => Response | Promise<Response>;

/**
 * Replaces `fetch` by a fake API. `routes` maps a method and a path to an
 * answer: `{ 'GET /models': () => Response.json([...]) }`. The query string
 * counts when the route has one. Any other request: 404.
 *
 * Returns the list of the requests made, to check what the app sent.
 */
export function fakeApi(routes: Record<string, Handler>): Request[] {
  const requests: Request[] = [];

  const fakeFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    requests.push(request.clone());
    const { pathname, search } = new URL(request.url);
    const handler = routes[`${request.method} ${pathname}${search}`] ?? routes[`${request.method} ${pathname}`];
    if (!handler) {
      return Response.json({ statusCode: 404, message: `No fake for ${request.method} ${pathname}` }, { status: 404 });
    }
    return handler(request);
  };

  vi.stubGlobal('fetch', vi.fn(fakeFetch));
  return requests;
}

/** An error the way NestJS sends them. */
export function nestError(status: number, message: string | string[]): Response {
  return Response.json({ statusCode: status, message }, { status });
}

/** The path and query of a request, without the host: "/models?task=translation". */
export function pathOf(request: Request): string {
  const { pathname, search } = new URL(request.url);
  return pathname + search;
}
