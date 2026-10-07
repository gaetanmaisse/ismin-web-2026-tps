import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MOCK_MODELS } from './models.mock';
import { fakeApi, renderApp } from './test-utils';

/**
 * Given, from TP8: green from the start, and they must stay green. One URL,
 * one page, and links to go from one to the other. The filter of the
 * catalogue tells which page is shown: only the catalogue has it.
 */
const llama = MOCK_MODELS.find((model) => model.id === 'llama-3-1-8b-instruct')!;

function catalogueIsShown() {
  return screen.queryByRole('navigation', { name: 'Filtrer par tâche' }) !== null;
}

beforeEach(() => {
  fakeApi({
    'GET /models': () => Response.json(MOCK_MODELS),
    [`GET /models/${llama.id}`]: () => Response.json(llama),
  });
});

describe('App, the routes', () => {
  it('shows the catalogue on /', async () => {
    renderApp('/');

    expect(await screen.findAllByRole('listitem')).toHaveLength(MOCK_MODELS.length);
  });

  it('shows "Page introuvable" on a URL that no route knows, and not the catalogue', () => {
    renderApp('/nimporte-quoi');

    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument();
    expect(catalogueIsShown()).toBe(false);
  });

  it('shows another page than the catalogue on /models/<id>', () => {
    renderApp(`/models/${llama.id}`);

    expect(catalogueIsShown()).toBe(false);
  });
});

describe('App, the links', () => {
  it('goes back to the catalogue from the 404 page', async () => {
    renderApp('/nimporte-quoi');

    await userEvent.click(screen.getByRole('link', { name: 'Retour au catalogue' }));

    expect(await screen.findAllByRole('listitem')).toHaveLength(MOCK_MODELS.length);
  });

  it('opens the page of a model when its name is clicked in the catalogue', async () => {
    renderApp('/');

    await userEvent.click(await screen.findByRole('link', { name: llama.name }));

    expect(catalogueIsShown()).toBe(false);
  });

  it('goes back to the catalogue with the title of the header', async () => {
    renderApp(`/models/${llama.id}`);
    expect(catalogueIsShown()).toBe(false);

    await userEvent.click(screen.getByRole('link', { name: 'ModelZoo' }));

    expect(catalogueIsShown()).toBe(true);
  });
});
