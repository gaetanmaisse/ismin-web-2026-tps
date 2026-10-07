import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TOKEN_KEY } from '../auth/AuthProvider';
import type { Model } from '../model';
import { fakeApi, makeToken, nestError, pathOf, renderApp } from '../test-utils';

/** Given. Steps 6 and 7. Logged in as alice, on /models/new. */
const token = makeToken({ username: 'alice' });

const created: Model = {
  id: 'croissantllm-base',
  name: 'CroissantLLMBase',
  org: 'croissantllm',
  task: 'translation',
  parameters: 1.3,
  downloads: 0,
  createdBy: 'alice',
};

async function fillAndSubmit({ license = '' } = {}) {
  await userEvent.type(screen.getByLabelText('Identifiant'), created.id);
  await userEvent.type(screen.getByLabelText('Nom'), created.name);
  await userEvent.type(screen.getByLabelText('Organisation'), created.org);
  await userEvent.selectOptions(screen.getByLabelText('Tâche'), 'translation');
  await userEvent.type(screen.getByLabelText('Paramètres (en milliards)'), '1.3');
  if (license) await userEvent.type(screen.getByLabelText('Licence (facultative)'), license);
  await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
}

function postsTo(requests: Request[]): Request[] {
  return requests.filter((request) => request.method === 'POST' && pathOf(request) === '/models');
}

describe('NewModelPage (step 6)', () => {
  it('POSTs the model to /models, with the token', async () => {
    const requests = fakeApi({
      'POST /models': () => Response.json(created, { status: 201 }),
      [`GET /models/${created.id}`]: () => Response.json(created),
    });
    renderApp('/models/new', { token });

    await fillAndSubmit();

    const [post] = postsTo(requests);
    expect(post).toBeDefined();
    expect(post.headers.get('Authorization')).toBe(`Bearer ${token}`);
    // The number of parameters as a number, and no licence at all when the field is empty.
    await expect(post.json()).resolves.toEqual({
      id: 'croissantllm-base',
      name: 'CroissantLLMBase',
      org: 'croissantllm',
      task: 'translation',
      parameters: 1.3,
    });
  });

  it('sends the licence when there is one', async () => {
    const requests = fakeApi({
      'POST /models': () => Response.json(created, { status: 201 }),
      [`GET /models/${created.id}`]: () => Response.json(created),
    });
    renderApp('/models/new', { token });

    await fillAndSubmit({ license: 'apache-2.0' });

    const [post] = postsTo(requests);
    await expect(post.json()).resolves.toMatchObject({ license: 'apache-2.0' });
  });

  it('opens the page of the new model once created', async () => {
    fakeApi({
      'POST /models': () => Response.json(created, { status: 201 }),
      [`GET /models/${created.id}`]: () => Response.json(created),
    });
    renderApp('/models/new', { token });

    await fillAndSubmit();

    expect(await screen.findByRole('heading', { name: created.name })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ajouter un modèle' })).not.toBeInTheDocument();
  });

  it('says so when the id is already taken (409), and stays on the form', async () => {
    fakeApi({ 'POST /models': () => nestError(409, 'Model croissantllm-base already exists') });
    renderApp('/models/new', { token });

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Un modèle avec cet identifiant existe déjà.');
    expect(screen.getByRole('heading', { name: 'Ajouter un modèle' })).toBeInTheDocument();
  });

  it('says so when the organisation is unknown (422)', async () => {
    fakeApi({ 'POST /models': () => nestError(422, 'Unknown organisation croissantllm') });
    renderApp('/models/new', { token });

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent("Organisation inconnue : créez-la d'abord.");
  });

  it('lists what the API explained when the form is invalid (400)', async () => {
    fakeApi({
      'POST /models': () => nestError(400, ['name should not be empty', 'parameters must not be less than 0']),
    });
    renderApp('/models/new', { token });

    await fillAndSubmit();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Le formulaire contient des erreurs');
    expect(alert).toHaveTextContent('name should not be empty');
    expect(alert).toHaveTextContent('parameters must not be less than 0');
  });

  it('cannot be sent twice while the API has not answered', async () => {
    const requests = fakeApi({ 'POST /models': () => new Promise(() => {}) }); // never answers
    renderApp('/models/new', { token });

    await fillAndSubmit();
    const button = screen.getByRole('button', { name: 'Ajouter' });
    expect(button).toBeDisabled();
    await userEvent.click(button);

    expect(postsTo(requests)).toHaveLength(1);
  });
});

describe('NewModelPage, the expired token (step 7)', () => {
  it('logs out and asks to log in again when the API answers 401', async () => {
    fakeApi({ 'POST /models': () => nestError(401, 'Invalid or expired token') });
    renderApp('/models/new', { token });

    await fillAndSubmit();

    expect(await screen.findByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
