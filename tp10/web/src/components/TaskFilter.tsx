import { TASK_LABELS, TASKS, type Task } from '../model';

interface TaskFilterProps {
  /** The selected task, or undefined for "all of them". */
  value: Task | undefined;
  onChange: (task: Task | undefined) => void;
}

/**
 * Given, from TP7. The filter holds no state: it shows `value` and reports
 * the clicks with `onChange`. The state lives in CatalogPage, which owns the
 * list too.
 */
export const TaskFilter = ({ value, onChange }: TaskFilterProps) => {
  return (
    <nav className="filters" aria-label="Filtrer par tâche">
      <button className="filter" aria-pressed={value === undefined} onClick={() => onChange(undefined)}>
        Toutes
      </button>
      {TASKS.map((task) => (
        <button key={task} className="filter" aria-pressed={value === task} onClick={() => onChange(task)}>
          {TASK_LABELS[task]}
        </button>
      ))}
    </nav>
  );
};
