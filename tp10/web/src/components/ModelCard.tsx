import { Link } from 'react-router';
import { formatDownloads, formatParameters } from '../format';
import { TASK_LABELS, type Model } from '../model';

interface ModelCardProps {
  model: Model;
}

/** Given, from TP8. One model of the catalogue. Its name leads to the page of the model. */
export const ModelCard = ({ model }: ModelCardProps) => {
  return (
    <article className="card">
      <header className="card-header">
        <h2 className="card-title">
          <Link to={`/models/${model.id}`}>{model.name}</Link>
        </h2>
        <span className="badge">{TASK_LABELS[model.task]}</span>
      </header>
      <p className="card-org">{model.org}</p>
      <dl className="card-stats">
        <div>
          <dt>Paramètres</dt>
          <dd>{formatParameters(model.parameters)}</dd>
        </div>
        <div>
          <dt>Téléchargements</dt>
          <dd>{formatDownloads(model.downloads)}</dd>
        </div>
      </dl>
      {model.license && <p className="card-license">Licence {model.license}</p>}
    </article>
  );
};
