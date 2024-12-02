import { DatabaseService } from "../database/database-service";
import axios from "axios";
import { Match } from "../models/match";

export class MatchesService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async getMatches(params: any): Promise<Match[]> {
    return this.dbService.getMatches(params);
  }

  async fetchAndSaveMatches(): Promise<Match[]> {
    const premierLeagueId = 12325;
    const requestUrl = `https://api.football-data-api.com/league-matches?key=${process.env.FOOTBALL_DATA_API_KEY}&league_id=${premierLeagueId}`;
    const response = await axios.get(requestUrl);

    const matches = response.data.data;
    await this.dbService.saveMatches(matches);
    return matches;
  }

  async getMatchesForJson(params: any): Promise<Match[]> {
    const { date, league_name } = params;

    return this.dbService.getMatchesForJson(date, league_name);
  }
}
