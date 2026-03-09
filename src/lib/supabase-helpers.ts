/**
 * Sanitize a search term for PostgREST ilike queries.
 */
export function sanitizeSearch(term: string): string {
  return term.replace(/[%_,.*()]/g, "").trim();
}

/**
 * Apply ilike search across multiple fields with OR logic.
 */
export function applySearch(
  query: any,
  search: string | undefined,
  fields: string[],
): any {
  if (!search?.trim()) return query;
  const safe = sanitizeSearch(search);
  if (!safe) return query;
  const or = fields.map((f) => `${f}.ilike.%${safe}%`).join(",");
  return query.or(or);
}
