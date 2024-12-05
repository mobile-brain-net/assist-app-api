import { DatabaseService } from "../database/database-service";
import axios from "axios";
import { Match } from "../models/match";
import { CompetitionMap } from "../types/competition";
import { LeagueIdMap } from "../types/leagues";
import { GetMatchesResponse } from "../types/api-types";
import { NormalizedPlTeam } from "../types/teams";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PredictionsService } from "./predictions-service";
import Prediction from "../models/predictions";

// Define the Prediction type based on the Prediction model
type PredictionType = Omit<Prediction, "id" | "createdAt" | "updatedAt">; // Exclude any auto-generated fields if necessary

export class MatchesService {
  private dbService: DatabaseService;
  private predictionsService: PredictionsService;

  constructor() {
    this.dbService = new DatabaseService();
    this.predictionsService = new PredictionsService();
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

  leagueIdMap: LeagueIdMap = {
    "Premier League": 39,
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
      const leagueId = this.leagueIdMap[league_name] || null;

      if (!leagueId || !competitionId) {
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

      const newData = matchesDataForJson.map(async (match) => {
        dayjs.extend(utc);
        dayjs.extend(timezone);

        const oddsTotal =
          match.odds.odds_ft_1 + match.odds.odds_ft_x + match.odds.odds_ft_2;
        const oddsHome = Math.round((match.odds.odds_ft_1 / oddsTotal) * 100);
        const oddsDraw = Math.round((match.odds.odds_ft_x / oddsTotal) * 100);
        const oddsAway = Math.round((match.odds.odds_ft_2 / oddsTotal) * 100);
        const prediction: PredictionType = (
          await this.predictionsService.getPredictionsByTeams(
            NormalizedPlTeam[match.home.name as keyof typeof NormalizedPlTeam],
            NormalizedPlTeam[match.away.name as keyof typeof NormalizedPlTeam],
            leagueId
          )
        )[0];
        // console.log("🚀 ~ MatchesService ~ newData ~ prediction:", prediction);

        return {
          // competition: seasons[0].season,
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
          prediction: {
            fixture_id: prediction?.fixture_id,
            league_id: prediction?.league_id,
            league_name: prediction?.league_name,
            league_country: prediction?.league_country,
            league_logo: prediction?.league_logo,
            league_flag: prediction?.league_flag,
            league_season: prediction?.league_season,
            teams_home_last_5_att: prediction?.home_last_5_att,
            teams_away_last_5_att: prediction?.away_last_5_att,
            teams_home_last_5_def: prediction?.home_last_5_def,
            teams_away_last_5_def: prediction?.away_last_5_def,
            teams_home_last_5_goals_for_average:
              prediction?.home_goals_for_average,
            teams_away_last_5_goals_for_average:
              prediction?.away_goals_for_average,
            teams_home_last_5_form: prediction?.home_last_5_form,
            teams_away_last_5_form: prediction?.away_last_5_form,
            predictions_percent_home: prediction?.predictions_percent_home,
            predictions_percent_draw: prediction?.predictions_percent_draw,
            predictions_percent_away: prediction?.predictions_percent_away,
          },
        };
      });

      const matchesData: GetMatchesResponse = {
        competition: seasons[0].season,
        matches: await Promise.all(newData),
      };

      return matchesData;
      // return matchesDataForJson;
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  }
}
