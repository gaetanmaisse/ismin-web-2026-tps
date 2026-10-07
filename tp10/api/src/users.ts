/**
 * Given. Two accounts, in memory for now: users move to the database in the
 * bonus. Both passwords are "secret", hashed with `hashPassword()`.
 */
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: Role;
  passwordHash: string;
}

export const USERS: User[] = [
  { id: 'u1', username: 'alice', role: 'admin', passwordHash: '2d71e2585adcd06ffefddae9cc9a0ee9:5ff8b826bec28a20e7fda2cf8880cddcc3441ac288fc55476a4210e00150c2c745bd14bff5235c1afce027f1e021b6a93a8961697e05a95f95e7e75a74ffe9f7' },
  { id: 'u2', username: 'bob', role: 'user', passwordHash: 'd7dfb1e277a87db61c9875908d51cd75:18158dd7bc4de17fa1c82b3aae7a3f0a442955123ebb89be76ca3f94f68edaf02c6c290596b5eff8eecc89a6bab137fff1ac51dccb36bbb94bf338e8ff8f92e2' },
];

export function findUser(username: string): User | undefined {
  return USERS.find((user) => user.username === username);
}
