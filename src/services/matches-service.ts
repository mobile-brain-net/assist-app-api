import { DatabaseService } from "../database/database-service";
import axios from "axios";
import { Match } from "../models/match";
import { CompetitionMap } from "../types/competition";
import { GetMatchesResponse } from "../types/api-types";
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

  competitionIds: CompetitionMap = {
    "Premier League": {
      "2023": 9660,
      "2024": 12325,
    },
    // "La Liga": {
    //   "2023": 4,
    //   "2024": 5,
    // },
    // Add more leagues and years as needed
  };

  async getMatchesForJson(params: {
    date: string;
    league_name: string;
  }): Promise<any> {
    //TO DO -ADD TYPE TO PROMISE
    const { date, league_name } = params;
    if (!date || !league_name) {
      return [];
    }
    try {
      const year = date.split("-")[0];
      const competitionId = this.competitionIds[league_name]?.[year] || null;

      if (!competitionId) {
        return [];
      }

      const seasons = await this.dbService.getSeasons(competitionId);
      const matchesDataForJson = await this.dbService.getMatchesForJson(
        date,
        competitionId
      );
      console.log(
        "🚀 ~ MatchesService ~ matchesDataForJson:",
        matchesDataForJson
      );

      // const matchesData: GetMatchesResponse = {
      //   competition: seasons[0].season,
      //   matches: [],
      // };

      // return matchesData;
      return matchesDataForJson;
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  }
}
