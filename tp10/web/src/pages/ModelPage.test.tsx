import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatDownloads, formatParameters } from '../format';
import { MOCK_MODELS } from '../models.mock';
import { fakeApi, nestError, pathOf, renderApp } from '../test-utils';

/**
 * Given, from TP8: green from the start. Two models that are not the one of the mockup: Llama, with
 * no licence, and opus-mt-en-fr, with one.
 */
const llama = MOCK_MODELS.find((model) => model.id === 'llama-3-1-8b-instruct')!;
const opus = MOCK_MODELS.find((model) => model.id === 'opus-mt-en-fr')!;

describe('ModelPage', () => {
  it('asks the API for the model of the URL, and shows its name', async () => {
    const requests = fakeApi({ [`GET /models/${llama.id}`]: () => Response.json(llama) });
    renderApp(`/models/${llama.id}`);

    expect(await screen.findByRole('heading', { name: llama.name })).toBeInTheDocument();
    expect(requests.map(pathOf)).toContain(`/models/${llama.id}`);
  });

  it('shows a loading state while the API has not answered', () => {
    fakeApi({ [`GET /models/${llama.id}`]: () => new Promise(() => {}) }); // never answers
    renderApp(`/models/${llama.id}`);

    expect(screen.queryByRole('navigation', { name: 'Filtrer par tâche' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/chargement/i);
  });

  it('shows the organisation, the task, the numbers and the licence', async () => {
    fakeApi({ [`GET /models/${opus.id}`]: () => Response.json({ ...opus, createdBy: 'alice' }) });
    renderApp(`/models/${opus.id}`);

    expect(await screen.findByRole('heading', { name: opus.name })).toBeInTheDocument();
    expect(screen.getByText('helsinki-nlp')).toBeInTheDocument();
    expect(screen.getByText('Traduction')).toBeInTheDocument();
    expect(screen.getByText(formatParameters(opus.parameters))).toBeInTheDocument();
    expect(screen.getByText(formatDownloads(opus.downloads))).toBeInTheDocument();
    expect(screen.getByText('apache-2.0')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('says "Non précisée" when the model has no licence', async () => {
    fakeApi({ [`GET /models/${llama.id}`]: () => Response.json(llama) });
    renderApp(`/models/${llama.id}`);

    expect(await screen.findByText('Non précisée')).toBeInTheDocument();
    expect(screen.queryByText('Ajouté par')).not.toBeInTheDocument();
  });

  it('says "Modèle introuvable." when the API answers 404', async () => {
    fakeApi({ 'GET /models/nope': () => nestError(404, 'Model nope not found') });
    renderApp('/models/nope');

    expect(await screen.findByRole('alert')).toHaveTextContent('Modèle introuvable.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error, not a blank page, when the API answers 500', async () => {
    const requests = fakeApi({ [`GET /models/${llama.id}`]: () => nestError(500, 'Internal server error') });
    renderApp(`/models/${llama.id}`);

    const alert = await screen.findByRole('alert');
    expect(alert).not.toHaveTextContent('Modèle introuvable.');
    expect(requests.map(pathOf)).toContain(`/models/${llama.id}`);
  });
});
