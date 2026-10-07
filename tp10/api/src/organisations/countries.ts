/** ISO 3166-1 alpha-2. TODO: complete the list, 244 missing. */
export const COUNTRIES = ['FR', 'US', 'CN', 'AE', 'FI'] as const;

export type Country = (typeof COUNTRIES)[number];
