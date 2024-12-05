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
  }): Promise<GetMatchesResponse | []> {
    const { date, league_name } = params;
    if (!date || !league_name) return [];

    try {
      const year = date.split("-")[0];
      const competitionId = this.competitionIds[league_name]?.[year] || null;
      const leagueId = this.leagueIdMap[league_name] || null;

      if (!leagueId || !competitionId) return [];

      const seasons = await this.dbService.getSeasons(competitionId);
      const matchesDataForJson = await this.dbService.getMatchesForJson(
        date,
        competitionId
      );
      const matchesData = await this.mapMatchesWithPredictions(
        matchesDataForJson,
        leagueId
      );

      return {
        competition: seasons[0].season,
        matches: matchesData,
      };
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  }

  private async mapMatchesWithPredictions(
    matchesDataForJson: any[],
    leagueId: number
  ): Promise<any[]> {
    return Promise.all(
      matchesDataForJson.map(async (match) => {
        dayjs.extend(utc);
        dayjs.extend(timezone);
        const odds = this.calculateOdds(match.odds);
        const prediction = (await this.getPrediction(match, leagueId))!;

        return {
          date: dayjs
            .unix(match.date_unix)
            .tz("Europe/London")
            .format("DD/MM/YYYY HH:mm"),
          home: this.mapTeam(match.home),
          away: this.mapTeam(match.away),
          result: this.mapResult(match),
          odds,
          prediction,
        };
      })
    );
  }

  private calculateOdds(odds: any): {
    home_win: number;
    draw: number;
    away_win: number;
  } {
    const oddsTotal = odds.odds_ft_1 + odds.odds_ft_x + odds.odds_ft_2;
    return {
      home_win: Math.round((odds.odds_ft_1 / oddsTotal) * 100),
      draw: Math.round((odds.odds_ft_x / oddsTotal) * 100),
      away_win: Math.round((odds.odds_ft_2 / oddsTotal) * 100),
    };
  }

  private async getPrediction(
    match: any,
    leagueId: number
  ): Promise<PredictionType | undefined> {
    return (
      await this.predictionsService.getPredictionsByTeams(
        NormalizedPlTeam[match.home.name as keyof typeof NormalizedPlTeam],
        NormalizedPlTeam[match.away.name as keyof typeof NormalizedPlTeam],
        leagueId
      )
    )[0];
  }

  private mapTeam(team: any): { name: string; icon: string; kits: string } {
    return {
      name: NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam],
      icon: team.image,
      kits: `/api/images/home/${
        NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam]
      }.svg`,
    };
  }

  private mapResult(match: any): {
    status: string;
    home_goals: number | null;
    away_goals: number | null;
  } {
    return {
      status: match.date_unix >= dayjs().unix() ? "ns" : "f",
      home_goals: match.stats.status === "f" ? match.stats.home_goals : null,
      away_goals: match.stats.status === "f" ? match.stats.away_goals : null,
    };
  }
}
