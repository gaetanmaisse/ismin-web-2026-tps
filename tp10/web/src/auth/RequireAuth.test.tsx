import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fakeApi, makeToken, renderApp } from '../test-utils';

/** Given. Step 5: /models/new is for the logged-in only. */
describe('RequireAuth', () => {
  it('shows the protected page to a logged-in user', () => {
    renderApp('/models/new', { token: makeToken({ username: 'alice' }) });

    expect(screen.getByRole('heading', { name: 'Ajouter un modèle' })).toBeInTheDocument();
  });

  it('sends a logged-out user to the login page instead', () => {
    renderApp('/models/new');

    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ajouter un modèle' })).not.toBeInTheDocument();
  });

  it('comes back to the page that was asked for, once logged in', async () => {
    fakeApi({ 'POST /auth/login': () => Response.json({ access_token: makeToken({ username: 'alice' }) }) });
    renderApp('/models/new');

    await userEvent.type(screen.getByLabelText('Identifiant'), 'alice');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: 'Ajouter un modèle' })).toBeInTheDocument();
  });
});
