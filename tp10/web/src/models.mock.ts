import type { Model } from './model';

/**
 * Given. Six models written by hand, from TP7. The app reads the API: only
 * the tests use them, as the answers of a fake API.
 */
export const MOCK_MODELS: Model[] = [
  { id: 'whisper-large-v3', name: 'whisper-large-v3', org: 'openai', task: 'speech-to-text', parameters: 1.55, downloads: 4100000 },
  { id: 'vit-base-patch16-224', name: 'vit-base-patch16-224', org: 'google', task: 'image-classification', parameters: 0.086, downloads: 3200000 },
  { id: 'llama-3-1-8b-instruct', name: 'Llama-3.1-8B-Instruct', org: 'meta-llama', task: 'text-generation', parameters: 8.03, downloads: 2870000 },
  { id: 't5-base', name: 't5-base', org: 'google-t5', task: 'translation', parameters: 0.223, downloads: 2100000 },
  { id: 'mistral-7b-instruct-v0-3', name: 'Mistral-7B-Instruct-v0.3', org: 'mistralai', task: 'text-generation', parameters: 7.25, downloads: 1420000, license: 'apache-2.0' },
  { id: 'opus-mt-en-fr', name: 'opus-mt-en-fr', org: 'helsinki-nlp', task: 'translation', parameters: 0.074, downloads: 1250000, license: 'apache-2.0' },
];
