import { GetMatchesQueryParams } from "../types/query-params";
import { Match } from "../types/match";

export class DatabaseService {
  async getMatches(params: GetMatchesQueryParams): Promise<Match[]> {
    // TODO: Implement actual DB query
    return [];
  }
}
