const MAX_SEARCH_LENGTH = 100;

function normalizeSearchTerm(value) {
  return typeof value === "string" ? value.trim().slice(0, MAX_SEARCH_LENGTH) : "";
}

function buildListingSearchQuery(searchTerm, category) {
  const clauses = [];
  const normalizedSearchTerm = normalizeSearchTerm(searchTerm);

  if (category && category !== "all") {
    clauses.push({ category });
  }

  if (normalizedSearchTerm) {
    const escapedSearchTerm = normalizedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchPattern = new RegExp(escapedSearchTerm, "i");
    clauses.push({
      $or: [
        { title: searchPattern },
        { location: searchPattern },
        { country: searchPattern },
      ],
    });
  }

  return {
    searchTerm: normalizedSearchTerm,
    query: clauses.length ? { $and: clauses } : {},
  };
}

module.exports = { buildListingSearchQuery, normalizeSearchTerm };
