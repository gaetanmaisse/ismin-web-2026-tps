import { useState, type SubmitEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ApiError } from '../api';
import { useAuth } from '../auth/AuthProvider';

/** What RequireAuth leaves in the state of the navigation: the page that was asked for. */
interface FromState {
  from?: string;
}

/** The login page, at /login. A controlled form: React holds the value of each field. */
export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    // Without it, the browser sends the form itself and reloads the page.
    event.preventDefault();
    setError('');

    try {
      await login(username, password);
      // Back to the page RequireAuth came from, or to the catalogue. replace: the
      // login page does not stay in the history.
      const from = (location.state as FromState | null)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Identifiant ou mot de passe incorrect.'
          : `Connexion impossible : ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  return (
    <section className="page form-page">
      <h2>Connexion</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-username">Identifiant</label>
          <input
            id="login-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">Mot de passe</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <div className="error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <button className="button" type="submit">
          Se connecter
        </button>
      </form>

      <p className="hint">Deux comptes&nbsp;: alice, administratrice, et bob. Le mot de passe&nbsp;: secret.</p>
    </section>
  );
};
