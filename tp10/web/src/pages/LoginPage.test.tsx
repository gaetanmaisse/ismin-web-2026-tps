import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../auth/AuthProvider';
import { MOCK_MODELS } from '../models.mock';
import { fakeApi, makeToken, nestError, pathOf, renderApp } from '../test-utils';

/** Given. Step 3, the page and its route. */
const token = makeToken({ username: 'alice' });

async function logInAs(username: string, password: string) {
  await userEvent.type(screen.getByLabelText('Identifiant'), username);
  await userEvent.type(screen.getByLabelText('Mot de passe'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
}

describe('LoginPage', () => {
  it('sends what was typed to POST /auth/login', async () => {
    const requests = fakeApi({
      'POST /auth/login': () => Response.json({ access_token: token }),
      'GET /models': () => Response.json(MOCK_MODELS),
    });
    renderApp('/login');

    await logInAs('alice', 'secret');

    const login = requests.find((request) => request.method === 'POST' && pathOf(request) === '/auth/login');
    expect(login).toBeDefined();
    await expect(login!.json()).resolves.toEqual({ username: 'alice', password: 'secret' });
  });

  it('goes to the catalogue once logged in, and keeps the token', async () => {
    fakeApi({
      'POST /auth/login': () => Response.json({ access_token: token }),
      'GET /models': () => Response.json(MOCK_MODELS),
    });
    renderApp('/login');

    await logInAs('alice', 'secret');

    expect(await screen.findByRole('navigation', { name: 'Filtrer par tâche' })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
  });

  it('says so on a wrong password, and stays on the page', async () => {
    fakeApi({ 'POST /auth/login': () => nestError(401, 'Wrong username or password') });
    renderApp('/login');

    await logInAs('alice', 'wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent('Identifiant ou mot de passe incorrect.');
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
