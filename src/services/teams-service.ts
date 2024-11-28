import { DatabaseService } from "../database/database-service";

import axios from "axios";
import { TeamResponse } from "../types/api-types";

export class TeamsService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async fetchLeagueTeams(): Promise<TeamResponse[]> {
    const premierLeagueId = 12325;
    const page = 1;
    const requestUrl = `https://api.football-data-api.com/league-teams?key=${process.env.FOOTBALL_DATA_API_KEY}&league_id=${premierLeagueId}&page=${page}`;
    const response = await axios.get(requestUrl);

    return response.data.data.map((team: any) => ({
      team: {
        id: team.id,
        name: team.name,
        code: team.short_hand,
        country: team.country,
        founded: parseInt(team.founded),
        logo: team.image,
        website: team.url,
        full_name: team.full_name,
        alternative_names: team.alt_names,
      },
      season: {
        current: team.season,
        format: team.season_format,
      },
      statistics: {
        rank: team.table_position,
        performance_rank: team.performance_rank,
      },
      league: {
        id: team.competition_id,
      },
      risk: team.risk,
    }));
  }
}
