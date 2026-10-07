import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, createModel } from '../api';
import { useAuth } from '../auth/AuthProvider';
import { TASK_LABELS, TASKS, type Task } from '../model';

/** The form, as the inputs give it: strings, even for the number of parameters. */
interface Draft {
  id: string;
  name: string;
  org: string;
  task: Task;
  parameters: string;
  license: string;
}

const EMPTY_DRAFT: Draft = { id: '', name: '', org: '', task: 'text-generation', parameters: '', license: '' };

/** What the user reads for each error of POST /models. The 400 adds the list of what the API explained. */
function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Le formulaire contient des erreurs :';
    if (error.status === 409) return 'Un modèle avec cet identifiant existe déjà.';
    if (error.status === 422) return "Organisation inconnue : créez-la d'abord.";
  }
  return `Impossible d'ajouter le modèle : ${error instanceof Error ? error.message : String(error)}`;
}

/** The creation form, at /models/new, for the logged-in only: RequireAuth guards the route. */
export const NewModelPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    // RequireAuth guarantees a token here; TypeScript does not know it.
    if (!token) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createModel(
        {
          id: draft.id,
          name: draft.name,
          org: draft.org,
          task: draft.task,
          // An input always gives a string, even of type="number".
          parameters: Number(draft.parameters),
          // undefined: JSON.stringify leaves the key out, the licence is optional.
          license: draft.license || undefined,
        },
        token,
      );
      navigate(`/models/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // The token has expired. Logged out, RequireAuth sends to /login, which brings back here.
        logout();
        return;
      }
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page form-page wide">
      <h2>Ajouter un modèle</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="model-id">Identifiant</label>
          <input
            id="model-id"
            name="id"
            aria-describedby="model-id-hint"
            value={draft.id}
            onChange={(event) => setDraft({ ...draft, id: event.target.value })}
          />
          <p className="field-hint" id="model-id-hint">
            En minuscules, avec des tirets&nbsp;: il sera dans l'adresse de la page.
          </p>
        </div>

        <div className="field">
          <label htmlFor="model-name">Nom</label>
          <input
            id="model-name"
            name="name"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="model-org">Organisation</label>
          <input
            id="model-org"
            name="org"
            aria-describedby="model-org-hint"
            value={draft.org}
            onChange={(event) => setDraft({ ...draft, org: event.target.value })}
          />
          <p className="field-hint" id="model-org-hint">
            Le slug, par exemple mistralai.
          </p>
        </div>

        <div className="field">
          <label htmlFor="model-task">Tâche</label>
          <select
            id="model-task"
            name="task"
            value={draft.task}
            onChange={(event) => setDraft({ ...draft, task: event.target.value as Task })}
          >
            {TASKS.map((task) => (
              <option key={task} value={task}>
                {TASK_LABELS[task]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="model-parameters">Paramètres (en milliards)</label>
          <input
            id="model-parameters"
            name="parameters"
            type="number"
            min="0"
            step="any"
            value={draft.parameters}
            onChange={(event) => setDraft({ ...draft, parameters: event.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="model-license">Licence (facultative)</label>
          <input
            id="model-license"
            name="license"
            value={draft.license}
            onChange={(event) => setDraft({ ...draft, license: event.target.value })}
          />
        </div>

        {error !== null && (
          <div className="error form-error" role="alert">
            <p>{describeError(error)}</p>
            {error instanceof ApiError && error.status === 400 && (
              <ul>
                {error.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Disabled while the API has not answered: a double click would send two POST. */}
        <button className="button" type="submit" disabled={submitting}>
          Ajouter
        </button>
      </form>
    </section>
  );
};
