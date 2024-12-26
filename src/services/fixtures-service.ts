import { DatabaseService } from "../database/database-service";
import axios from "axios";
import { Fixture } from "../models/fixtures";
import dayjs from "dayjs";

export class FixturesService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async getFixtures(): Promise<Fixture[]> {
    return this.dbService.getFixtures({});
  }

  async fetchAndSaveFixtures(): Promise<Fixture[]> {
    const season = dayjs().year();
    const from = dayjs().subtract(30, "day").format("YYYY-MM-DD");
    const to = dayjs().add(30, "day").format("YYYY-MM-DD");
    const premierLeagueId = 39; // Premier League ID
    const requestUrl = `https://v3.football.api-sports.io/fixtures?league=${premierLeagueId}&season=${season}&from=${from}&to=${to}`;
    const headers = {
      "x-rapidapi-host": "v3.football.api-sports.io",
      "x-rapidapi-key": process.env.V3_FOOTBALL_API_KEY,
    };
    const response = await axios.get(requestUrl, { headers });
    const fixtures = response.data.response;

    await this.dbService.saveFixtures(fixtures);
    return fixtures;
  }
}
