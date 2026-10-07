import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_URL, ApiError, createModel, fetchModel, fetchModels, login } from './api';
import type { NewModel } from './model';
import { MOCK_MODELS } from './models.mock';

/**
 * Given. Steps 2 and 6. No API is running during the tests: `fetch` is
 * replaced by a fake that answers what each test decides.
 */
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
});

/** The n-th request made to fetch, whatever form the code gave it: a URL and options, or a Request. */
function sentRequest(call = 0): Request {
  const [input, init] = fetchMock.mock.calls[call];
  return new Request(input, init);
}

/** The error a promise rejects with. */
async function rejection(promise: Promise<unknown>): Promise<unknown> {
  return promise.then(
    () => undefined,
    (error: unknown) => error,
  );
}

/** An error the way NestJS sends them. */
function nestError(status: number, message: string | string[]): Response {
  return Response.json({ statusCode: status, message }, { status });
}

const mistral = MOCK_MODELS.find((model) => model.id === 'mistral-7b-instruct-v0-3')!;

describe('fetchModels, from TP7', () => {
  it('asks GET /models and returns the list', async () => {
    fetchMock.mockResolvedValue(Response.json(MOCK_MODELS));

    await expect(fetchModels()).resolves.toEqual(MOCK_MODELS);
    expect(sentRequest().url).toBe(`${API_URL}/models`);
  });

  it('asks the server to filter when a task is given', async () => {
    fetchMock.mockResolvedValue(Response.json([]));

    await fetchModels('translation');
    expect(sentRequest().url).toBe(`${API_URL}/models?task=translation`);
  });

  it('throws an ApiError when the API answers with an error', async () => {
    fetchMock.mockResolvedValue(new Response('Internal Server Error', { status: 500 }));

    const error = await rejection(fetchModels());
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500 });
  });
});

describe('fetchModel, from TP8', () => {
  it('asks GET /models/<id> and returns the model', async () => {
    fetchMock.mockResolvedValue(Response.json(mistral));

    await expect(fetchModel(mistral.id)).resolves.toEqual(mistral);
    expect(sentRequest().url).toBe(`${API_URL}/models/${mistral.id}`);
  });

  it('throws an ApiError whose status is 404 for an unknown id', async () => {
    fetchMock.mockResolvedValue(nestError(404, 'Model nope not found'));

    const error = await rejection(fetchModel('nope'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404 });
  });
});

describe('login (step 2)', () => {
  it('POSTs the username and the password as JSON to /auth/login', async () => {
    fetchMock.mockResolvedValue(Response.json({ access_token: 'the-token' }));

    await login('alice', 'secret');

    const request = sentRequest();
    expect(request.url).toBe(`${API_URL}/auth/login`);
    expect(request.method).toBe('POST');
    expect(request.headers.get('Content-Type')).toContain('application/json');
    await expect(request.json()).resolves.toEqual({ username: 'alice', password: 'secret' });
  });

  it('returns the access_token of the answer', async () => {
    fetchMock.mockResolvedValue(Response.json({ access_token: 'the-token' }));

    await expect(login('alice', 'secret')).resolves.toBe('the-token');
  });

  it('throws an ApiError whose status is 401 for a wrong password', async () => {
    fetchMock.mockResolvedValue(nestError(401, 'Wrong username or password'));

    const error = await rejection(login('alice', 'wrong'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401 });
  });
});

describe('createModel (step 6)', () => {
  const draft: NewModel = {
    id: 'croissantllm-base',
    name: 'CroissantLLMBase',
    org: 'croissantllm',
    task: 'text-generation',
    parameters: 1.3,
  };

  it('POSTs the model as JSON to /models, with the token in the Authorization header', async () => {
    fetchMock.mockResolvedValue(Response.json({ ...draft, downloads: 0, createdBy: 'alice' }, { status: 201 }));

    await createModel(draft, 'the-token');

    const request = sentRequest();
    expect(request.url).toBe(`${API_URL}/models`);
    expect(request.method).toBe('POST');
    expect(request.headers.get('Authorization')).toBe('Bearer the-token');
    expect(request.headers.get('Content-Type')).toContain('application/json');
    await expect(request.json()).resolves.toEqual(draft);
  });

  it('returns the model that the API created', async () => {
    const created = { ...draft, downloads: 0, createdBy: 'alice' };
    fetchMock.mockResolvedValue(Response.json(created, { status: 201 }));

    await expect(createModel(draft, 'the-token')).resolves.toEqual(created);
  });

  it('throws an ApiError whose status is 409 when the id is already taken', async () => {
    fetchMock.mockResolvedValue(nestError(409, 'Model croissantllm-base already exists'));

    const error = await rejection(createModel(draft, 'the-token'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409 });
  });

  it('keeps what the API explained about a 400 in `details`', async () => {
    fetchMock.mockResolvedValue(nestError(400, ['name should not be empty', 'parameters must not be less than 0']));

    const error = await rejection(createModel(draft, 'the-token'));
    expect(error).toMatchObject({
      status: 400,
      details: ['name should not be empty', 'parameters must not be less than 0'],
    });
  });
});
