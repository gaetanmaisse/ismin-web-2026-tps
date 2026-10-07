import { Link } from 'react-router';
import { useAuth } from '../auth/AuthProvider';

/**
 * The top of every page: the title, back to the catalogue, and the links.
 *
 * <Link> changes the URL without asking the server for a new page: React
 * keeps its state, TanStack Query keeps its cache.
 */
export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">
          <Link to="/">ModelZoo</Link>
        </h1>
        <p className="app-tagline">Le catalogue des modèles d'IA</p>
      </div>

      <nav className="app-nav" aria-label="Navigation principale">
        <Link to="/models/new">Ajouter un modèle</Link>
        {user ? (
          <>
            <span className="app-user">{user.username}</span>
            <button className="link-button" type="button" onClick={logout}>
              Se déconnecter
            </button>
          </>
        ) : (
          <Link to="/login">Se connecter</Link>
        )}
      </nav>
    </header>
  );
};
