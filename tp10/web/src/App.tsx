import { Route, Routes } from 'react-router';
import { RequireAuth } from './auth/RequireAuth';
import { Header } from './components/Header';
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/LoginPage';
import { ModelPage } from './pages/ModelPage';
import { NewModelPage } from './pages/NewModelPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * The frame of every page: the header, then the page of the current URL.
 *
 * The order of the routes does not matter: React Router picks the most
 * precise one. /models/new wins over /models/:id, and * comes last.
 */
const App = () => {
  return (
    <main className="app">
      <Header />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route
          path="/models/new"
          element={
            <RequireAuth>
              <NewModelPage />
            </RequireAuth>
          }
        />
        <Route path="/models/:id" element={<ModelPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
};

export default App;
