import { DatabaseService } from "../database/database-service";
import axios from "axios";
import { Match } from "../models/match";
import { CompetitionMap } from "../types/competition";
import { GetMatchesResponse } from "../types/api-types";
import { NormalizedPlTeam } from "../types/teams";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

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
    try {
      const requestUrl = `https://api.football-data-api.com/league-matches?key=${process.env.FOOTBALL_DATA_API_KEY}&league_id=${premierLeagueId}`;
      const response = await axios.get(requestUrl);
      const matches = response.data.data;
      await this.dbService.saveMatches(matches);
      return matches;
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  }

  competitionIds: CompetitionMap = {
    "Premier League": {
      "2023": 9660,
      "2024": 12325,
      "2025": 12325,
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

      const normalizedMatches = matchesDataForJson.map((match) => {
        const normalizedHomeTeamName =
          NormalizedPlTeam[match.home.name as keyof typeof NormalizedPlTeam];
        const normalizedAwayTeamName =
          NormalizedPlTeam[match.away.name as keyof typeof NormalizedPlTeam];
        return { normalizedHomeTeamName, normalizedAwayTeamName };
      });

      const newData = matchesDataForJson.map((match) => {
        dayjs.extend(utc);
        dayjs.extend(timezone);

        const oddsTotal =
          match.odds.odds_ft_1 + match.odds.odds_ft_x + match.odds.odds_ft_2;
        const oddsHome = Math.round((match.odds.odds_ft_1 / oddsTotal) * 100);
        const oddsDraw = Math.round((match.odds.odds_ft_x / oddsTotal) * 100);
        const oddsAway = Math.round((match.odds.odds_ft_2 / oddsTotal) * 100);

        return {
          competition: seasons[0].season,
          date: dayjs
            .unix(match.date_unix)
            .tz("Europe/London")
            .format("DD/MM/YYYY HH:mm"),
          home: {
            name: NormalizedPlTeam[
              match.home.name as keyof typeof NormalizedPlTeam
            ],
            icon: match.home.image,
            kits: `/api/images/home/${
              NormalizedPlTeam[match.home.name as keyof typeof NormalizedPlTeam]
            }.svg`,
          },
          away: {
            name: NormalizedPlTeam[
              match.away.name as keyof typeof NormalizedPlTeam
            ],
            icon: match.away.image,
            kits: `/api/images/away/${
              NormalizedPlTeam[match.away.name as keyof typeof NormalizedPlTeam]
            }.svg`,
          },
          result: {
            status: match.date_unix >= dayjs().unix() ? "ns" : "f", // Determine match status
            //if game status is 'ns' (not started) then don't show goals
            home_goals:
              match.stats.status == "f" ? match.stats.home_goals : null,
            away_goals:
              match.stats.status == "f" ? match.stats.away_goals : null,
          },
          odds: {
            home_win: oddsHome,
            draw: oddsDraw,
            away_win: oddsAway,
          },
        };
      });
      console.log("🚀 ~ MatchesService ~ newData ~ newData:", newData);
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
