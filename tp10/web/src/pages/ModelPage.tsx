import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ApiError, fetchModel } from '../api';
import { formatDownloads, formatParameters } from '../format';
import { TASK_LABELS } from '../model';

/** Given, from TP8. The page of one model, at /models/:id. */
export const ModelPage = () => {
  // On /models/:id, the id is always there: the `as` is a promise made to the compiler.
  const { id } = useParams() as { id: string };

  // A key per model: each page has its own entry in the cache.
  const { data: model, error, isPending, isError } = useQuery({
    queryKey: ['model', id],
    queryFn: () => fetchModel(id),
  });

  return (
    <section className="page">
      <Link className="back" to="/">
        ← Retour au catalogue
      </Link>

      {isPending && (
        <p className="status" role="status">
          Chargement…
        </p>
      )}
      {isError && (
        <div className="error" role="alert">
          <span>
            {error instanceof ApiError && error.status === 404
              ? 'Modèle introuvable.'
              : `Impossible de charger le modèle : ${error.message}`}
          </span>
        </div>
      )}
      {model && (
        <article className="detail">
          <header className="detail-header">
            <h2 className="detail-title">{model.name}</h2>
            <span className="badge">{TASK_LABELS[model.task]}</span>
          </header>

          <dl className="detail-fields">
            <div>
              <dt>Identifiant</dt>
              <dd>{model.id}</dd>
            </div>
            <div>
              <dt>Organisation</dt>
              <dd>{model.org}</dd>
            </div>
            <div>
              <dt>Paramètres</dt>
              <dd>{formatParameters(model.parameters)}</dd>
            </div>
            <div>
              <dt>Téléchargements</dt>
              <dd>{formatDownloads(model.downloads)}</dd>
            </div>
            <div>
              <dt>Licence</dt>
              <dd>{model.license ?? 'Non précisée'}</dd>
            </div>
            {model.createdBy && (
              <div>
                <dt>Ajouté par</dt>
                <dd>{model.createdBy}</dd>
              </div>
            )}
          </dl>
        </article>
      )}
    </section>
  );
};
