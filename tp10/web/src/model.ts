/**
 * Given. The same types as in the API, `api/src/models/model.ts`: the front
 * and the back speak about the same things. Read it, don't change it.
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

/** What the user reads, in French. */
export const TASK_LABELS: Record<Task, string> = {
  'text-generation': 'Génération de texte',
  translation: 'Traduction',
  'image-classification': "Classification d'images",
  'speech-to-text': 'Reconnaissance vocale',
};

export interface Model {
  id: string;
  name: string;
  org: string;
  task: Task;
  /** in billions */
  parameters: number;
  downloads: number;
  license?: string;
  createdBy?: string;
}

/**
 * What POST /models expects: a model without `downloads`, measured by the
 * API, and without `createdBy`, stamped by the API from the token.
 */
export type NewModel = Omit<Model, 'downloads' | 'createdBy'>;
