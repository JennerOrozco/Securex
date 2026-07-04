import { SECUREX_QUERIES, SECUREX_MUTATIONS } from './securex.queries';
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from './notification.queries';

export const ALL_QUERIES: Record<string, Record<string, string>> = {
  securex: SECUREX_QUERIES,
  notification: NOTIFICATION_QUERIES,
};

export const ALL_MUTATIONS: Record<string, Record<string, string>> = {
  securex: SECUREX_MUTATIONS,
  notification: NOTIFICATION_MUTATIONS,
};

export function resolveQuery(domain: string, name: string): string | undefined {
  return ALL_QUERIES[domain]?.[name];
}

export function resolveMutation(domain: string, name: string): string | undefined {
  return ALL_MUTATIONS[domain]?.[name];
}
