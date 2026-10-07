/**
 * The domain types: the ones you wrote in TP1, plus the TASKS list that the
 * validation needs. Given: read it, don't change it.
 */

export type Task =
  | 'text-generation'
  | 'translation'
  | 'image-classification'
  | 'speech-to-text';

export const TASKS: Task[] = [
  'text-generation',
  'translation',
  'image-classification',
  'speech-to-text',
];

export interface Model {
  /** URL-safe slug, unique in the catalogue. E.g. "mistral-7b-instruct-v0-3" */
  id: string;
  name: string;
  org: string;
  task: Task;
  /** in billions */
  parameters: number;
  downloads: number;
  /** when the model card declares one */
  license?: string;
  /** Username of who created it. Set by the API, never by the client. */
  createdBy?: string;
}

/** Thrown by the service when the organisation a model points at does not exist. */
export class UnknownOrganisation extends Error {
  constructor(slug: string) {
    super(`Unknown organisation ${slug}: create it first`);
  }
}

/** Thrown by the service when a model with this id is already in the catalogue. */
export class ModelAlreadyExists extends Error {
  constructor(id: string) {
    super(`Model ${id} already exists`);
  }
}
