import { Link } from 'react-router';

/** Given, from TP8. The page of any URL that no route knows: the route `*`. */
export const NotFoundPage = () => {
  return (
    <section className="page not-found">
      <h2>Page introuvable</h2>
      <p>Cette adresse ne correspond à aucune page du catalogue.</p>
      <Link to="/">Retour au catalogue</Link>
    </section>
  );
};
