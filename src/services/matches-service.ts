import { DatabaseService } from "../database/database-service";
import { Match } from "../types/match";
import { GetMatchesQueryParams } from "../types/query-params";

export class MatchesService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async getMatches(params: GetMatchesQueryParams): Promise<Match[]> {
    return this.dbService.getMatches(params);
  }

  async fetchAndSaveMatches(): Promise<Match[]> {
    // TODO: Implement API call here
    // const matches = await this.fetchFromExternalApi();
    // await this.dbService.saveMatches(matches);
    return [];
  }
}
