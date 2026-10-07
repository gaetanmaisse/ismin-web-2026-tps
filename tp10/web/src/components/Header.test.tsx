import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../auth/AuthProvider';
import { MOCK_MODELS } from '../models.mock';
import { fakeApi, makeToken, renderApp } from '../test-utils';

/** Given. Step 4. */
beforeEach(() => {
  fakeApi({ 'GET /models': () => Response.json(MOCK_MODELS) });
});

describe('Header', () => {
  it('offers to log in when logged out', () => {
    renderApp('/');

    expect(screen.getByRole('link', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Se déconnecter' })).not.toBeInTheDocument();
  });

  it('shows who is logged in, and offers to log out', () => {
    renderApp('/', { token: makeToken({ username: 'alice' }) });

    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se déconnecter' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Se connecter' })).not.toBeInTheDocument();
  });

  it('shows the name of bob for a token of bob: it comes from the token, not from the code', () => {
    renderApp('/', { token: makeToken({ username: 'bob', role: 'user' }) });

    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('logs out on a click on "Se déconnecter"', async () => {
    renderApp('/', { token: makeToken({ username: 'alice' }) });

    await userEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));

    expect(screen.getByRole('link', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.queryByText('alice')).not.toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
