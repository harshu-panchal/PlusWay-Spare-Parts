/**
 * Helpers for "wild" search: every whitespace-separated token must match at
 * least one of the provided string fields (case-insensitive substring).
 */

export const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const tokenizeSearchQuery = (query = "") =>
  String(query).trim().split(/\s+/).filter(Boolean);

/**
 * Build a MongoDB filter where EACH token must appear in at least one field.
 * @param {string} query - Raw search string
 * @param {string[]} fields - Dot-path field names on the current document
 */
export const buildWildSearchFilter = (query, fields = []) => {
  const tokens = tokenizeSearchQuery(query);
  if (!tokens.length || !fields.length) return {};

  return {
    $and: tokens.map((token) => ({
      $or: fields.map((field) => ({
        [field]: { $regex: escapeRegex(token), $options: "i" },
      })),
    })),
  };
};

/**
 * Build a $match stage for aggregation pipelines that have denormalised
 * `brandName` / `modelName` (and optional extra fields) on each document.
 */
export const buildWildSearchMatch = (query, fields = []) => {
  const filter = buildWildSearchFilter(query, fields);
  return Object.keys(filter).length ? filter : null;
};
