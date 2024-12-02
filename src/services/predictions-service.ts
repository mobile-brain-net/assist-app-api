import { DatabaseService } from "../database/database-service";

import axios from "axios";
import { TeamResponse } from "../types/api-types";
//import { PredictionResponse } from "../types/api-types";
import { FixturesService } from "./fixtures-service";

export class PredictionsService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async fetchPredictions(): Promise<any[]> {
    const getFixtures = new FixturesService();
    //to do GET FIXTURES WHERE FIXTURES ID NOT IN PREDICTIONS
    const fixtures = await getFixtures.getFixtures();
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
      const response = await axios.get(requestUrl, { headers });
      predictions.push(response.data.response);
    }
    return predictions;
    // return response.data.data.map((team: any) => ({
    //   team: {
    //     id: team.id,
    //     name: team.name,
    //     country: team.country,
    //     founded: parseInt(team.founded),
    //     logo: team.image,
    //     website: team.url,
    //     full_name: team.full_name,
    //     alternative_names: team.alt_names,
    //   },
    //   season: {
    //     current: team.season,
    //     format: team.season_format,
    //   },
    //   statistics: {
    //     rank: team.table_position,
    //     performance_rank: team.performance_rank,
    //   },
    //   league: {
    //     id: team.competition_id,
    //   },
    //   risk: team.risk,
    // }));
  }
}
