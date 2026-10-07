import type { Model } from '../model';
import { ModelCard } from './ModelCard';

interface ModelListProps {
  models: Model[];
}

/** Given, from TP7. The catalogue: one card per model. The key tells React which card is which from one render to the next. */
export const ModelList = ({ models }: ModelListProps) => {
  if (models.length === 0) {
    return <p className="empty">Aucun modèle pour ce filtre.</p>;
  }

  return (
    <ul className="model-list">
      {models.map((model) => (
        <li key={model.id}>
          <ModelCard model={model} />
        </li>
      ))}
    </ul>
  );
};
