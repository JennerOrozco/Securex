import { SECUREX_QUERIES, SECUREX_MUTATIONS } from './securex.queries';
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from './notification.queries';

export const ALL_QUERIES: Record<string, Record<string, string>> = {
  security: SECUREX_QUERIES,
  securex: SECUREX_QUERIES,
  notification: NOTIFICATION_QUERIES,
};

export const ALL_MUTATIONS: Record<string, Record<string, string>> = {
  security: SECUREX_MUTATIONS,
  securex: SECUREX_MUTATIONS,
  notification: NOTIFICATION_MUTATIONS,
};

export function resolveQuery(domain: string, name: string): string | undefined {
  const normalized = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
  return ALL_QUERIES[domain]?.[name] || ALL_QUERIES[domain]?.[normalized];
}

export function resolveMutation(domain: string, name: string): string | undefined {
  const normalized = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
  return ALL_MUTATIONS[domain]?.[name] || ALL_MUTATIONS[domain]?.[normalized];
}
