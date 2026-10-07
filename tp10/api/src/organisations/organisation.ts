/** The domain type of an organisation, the way the API exposes it. */
export interface Organisation {
  /** URL-safe slug, unique. E.g. "mistralai" */
  slug: string;
  name: string;
  /** ISO 3166-1 alpha-2, when known. E.g. "FR" */
  country?: string;
}

export class OrganisationAlreadyExists extends Error {
  constructor(slug: string) {
    super(`Organisation ${slug} already exists`);
  }
}
