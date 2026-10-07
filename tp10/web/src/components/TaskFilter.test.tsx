import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskFilter } from './TaskFilter';

/** Given, from TP7. */
describe('TaskFilter', () => {
  it('shows a button for all the tasks, then one per task', () => {
    render(<TaskFilter value={undefined} onChange={() => {}} />);
    const labels = screen.getAllByRole('button').map((button) => button.textContent);
    expect(labels).toEqual([
      'Toutes',
      'Génération de texte',
      'Traduction',
      "Classification d'images",
      'Reconnaissance vocale',
    ]);
  });

  it('marks the selected task as pressed, and only that one', () => {
    render(<TaskFilter value="translation" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Traduction' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Toutes' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports the clicked task with onChange, and holds no state of its own', async () => {
    const onChange = vi.fn();
    render(<TaskFilter value={undefined} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Traduction' }));
    expect(onChange).toHaveBeenLastCalledWith('translation');
    // The parent did not change `value`: the filter must not have changed on its own
    expect(screen.getByRole('button', { name: 'Traduction' })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'Toutes' }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});
