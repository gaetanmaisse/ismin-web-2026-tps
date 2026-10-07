import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

/**
 * Given. The tests run on their own database, `test.db`, so that they never
 * touch `dev.db`. Before the suite, it is deleted and rebuilt from the
 * migrations: every run starts from an empty database, whatever the previous
 * one left behind.
 */
export default function setup(): void {
  rmSync('test.db', { force: true });
  rmSync('test.db-journal', { force: true });
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
}
