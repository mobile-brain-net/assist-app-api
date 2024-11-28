import { LeagueTeam } from "../models/league-team";
import { TeamResponse } from "../types/api-types";

export class DatabaseService {
  async saveLeagueTeams(teams: TeamResponse[]): Promise<void> {
    await LeagueTeam.bulkCreate(
      teams.map((team) => ({
        id: team.team.id,
        name: team.team.name,
        clean_name: team.team.name?.toLowerCase().replace(/[^a-z0-9]/g, ""),
        english_name: team.team.name,
        country: team.team.country,
        founded: team.team.founded?.toString(),
        image: team.team.logo,
        // Optional fields that might come from your API:
        short_hand: team.team.code,
        continent: team.team.area?.continent,
        flag_element: team.team.flag,
        season: team.season?.current,
        season_clean: team.season?.current?.toString(),
        url: team.team.website,
        table_position: team.statistics?.rank,
        performance_rank: team.statistics?.performance_rank,
        risk: team.risk,
        season_format: team.season?.format,
        competition_id: team.league?.id,
        full_name: team.team.full_name,
        alt_names: team.team.alternative_names,
        official_sites: [team.team.website].filter(Boolean),
      })),
      {
        updateOnDuplicate: [
          "name",
          "clean_name",
          "english_name",
          "short_hand",
          "country",
          "continent",
          "founded",
          "image",
          "flag_element",
          "season",
          "season_clean",
          "url",
          "table_position",
          "performance_rank",
          "risk",
          "season_format",
          "competition_id",
          "full_name",
          "alt_names",
          "official_sites",
        ],
      }
    );
  }
}
