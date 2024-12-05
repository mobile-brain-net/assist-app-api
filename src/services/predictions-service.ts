import { DatabaseService } from "../database/database-service";

import axios from "axios";
//import { TeamResponse } from "../types/api-types";
//import { PredictionResponse } from "../types/api-types";
import { FixturesService } from "./fixtures-service";

export class PredictionsService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async fetchPredictions(): Promise<any[]> {
    const Fixtures = new FixturesService();

    const fixtures = await Fixtures.getFixtures();

    const predictions: any[] = [];
    if (fixtures.length === 0) {
      return [];
    }
    for (const fixture of fixtures) {
      const fixture_id = fixture.fixture_id;
      const requestUrl = `https://v3.football.api-sports.io/predictions?fixture=${fixture_id}`;
      //set headers
      const headers = {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.V3_FOOTBALL_API_KEY,
      };
      try {
        const response = await axios.get(requestUrl, { headers });
        predictions.push({
          fixture_id,
          ...response.data.response[0],
        });
      } catch (error) {
        console.log(
          "🚀 ~ PredictionsService ~ fetchPredictions ~ error:",
          error
        );
      }
    }
    return predictions;
  }

  async getPredictionsByTeams(
    homeTeam: string,
    awayTeam: string,
    leagueId: number
  ): Promise<any[]> {
    const predictionForMatch = await this.dbService.getPredictionsByTeams(
      homeTeam,
      awayTeam,
      leagueId
    );
    return predictionForMatch;
  }
}
