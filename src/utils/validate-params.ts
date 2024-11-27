import { GetMatchesQueryParams } from "../types/query-params";

export function validateQueryParams(query: any): GetMatchesQueryParams {
  if (!query.date || !query.league_name) {
    throw new Error("Missing required parameters: date and league_name");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(query.date)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  }

  return {
    date: query.date,
    league_name: decodeURIComponent(query.league_name),
  };
}
