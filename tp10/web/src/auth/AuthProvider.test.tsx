import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { ApiError } from '../api';
import { fakeApi, makeToken, nestError } from '../test-utils';
import { AuthProvider, TOKEN_KEY, useAuth } from './AuthProvider';

/**
 * Given. Step 2. `renderHook` calls useAuth() inside an <AuthProvider>, as
 * any component of the app would, and gives what it returns.
 */
const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const token = makeToken({ username: 'alice', role: 'admin' });

describe('AuthProvider', () => {
  it('starts logged out when localStorage holds no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('logs in: keeps the token, in the state and in localStorage, and reads the user from it', async () => {
    fakeApi({ 'POST /auth/login': () => Response.json({ access_token: token }) });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.login('alice', 'secret'));

    expect(result.current.token).toBe(token);
    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(result.current.user).toMatchObject({ username: 'alice', role: 'admin' });
  });

  it('lets the ApiError of a wrong password through, and stays logged out', async () => {
    fakeApi({ 'POST /auth/login': () => nestError(401, 'Wrong username or password') });
    const { result } = renderHook(() => useAuth(), { wrapper });

    let error: unknown;
    await act(() => result.current.login('alice', 'wrong').catch((e: unknown) => (error = e)));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401 });
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('is still logged in after a reload: the token is read from localStorage', () => {
    localStorage.setItem(TOKEN_KEY, token);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBe(token);
    expect(result.current.user?.username).toBe('alice');
  });

  it('logs out: forgets the token, in the state and in localStorage', () => {
    localStorage.setItem(TOKEN_KEY, token);
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user?.username).toBe('alice');

    act(() => result.current.logout());

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
