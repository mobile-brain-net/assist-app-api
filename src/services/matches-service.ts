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

interface TeamData {
  name: string;
  image: string;
  table_position: number;
}

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

      return [
        {
          competition: seasons[0].season,
          matches: matchesData,
        },
      ];
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
        // Non-null assertion (!) forces TypeScript to treat the possibly undefined prediction as defined
        // This could cause runtime errors if getPrediction returns undefined
        // Consider handling the undefined case explicitly instead
        let prediction = (await this.getPrediction(match, leagueId))!;
        if (!prediction) {
          prediction = <any>{
            fixture_id: "",
            predictions_percent_home: "0",
            predictions_percent_draw: "0",
            predictions_percent_away: "0",
            league_id: 39,
            league_name: "Premier League",
            league_country: "England",
            league_logo: "https://media.api-sports.io/football/leagues/39.png",
            league_flag: "https://media.api-sports.io/flags/gb-eng.svg",
            league_season: 0,
            home_team_name: "",
            away_team_name: "",
            home_last_5_form: "",
            away_last_5_form: "",
            home_last_5_att: "",
            away_last_5_att: "",
            teams_home_last_5_def: "",
            teams_away_last_5_def: "",
            teams_home_goals_for_total: 0,
            teams_home_goals_for_average: "",
            teams_away_goals_for_total: 0,
            teams_away_goals_for_average: "",
          };
        }

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
    if (oddsTotal === 0) {
      return {
        home_win: 0,
        draw: 0,
        away_win: 0,
      };
    }
    let home_win = Math.round((odds.odds_ft_1 / oddsTotal) * 100);
    const draw = Math.round((odds.odds_ft_x / oddsTotal) * 100);
    const away_win = Math.round((odds.odds_ft_2 / oddsTotal) * 100);
    if (home_win + draw + away_win !== 100) {
      home_win = 100 - (draw + away_win);
    }
    return {
      home_win,
      draw,
      away_win,
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
    homegoals: number | null;
    awaygoals: number | null;
  } {
    return {
      status: match.date_unix >= dayjs().unix() ? "ns" : "f",
      homegoals: match.stats.status === "f" ? match.stats.home_goals : null,
      awaygoals: match.stats.status === "f" ? match.stats.away_goals : null,
    };
  }

  async aggregateMatches(params: {
    year: string;
    league_name: string;
  }): Promise<any[]> {
    const { year, league_name } = params;
    if (!year || !league_name) return [];

    const competitionId = this.competitionIds[league_name]?.[year] || null;
    if (!competitionId) return [];

    let overall: any = {};

    const getTeams = await this.dbService.getTeams(competitionId);
    const overAllStats = await this.dbService.getOverAllStats(competitionId);

    let normalizedTeams = getTeams.map((team) => {
      const teamStats = overAllStats.find((s) => s.id === team.id);
      return {
        name: NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam],
        logo: NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam],
        home_kits: `/api/images/home/${
          NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam]
        }.svg`,
        away_kits: `/api/images/away/${
          NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam]
        }.svg`,
        overall: {
          position: team.table_position,
          matchesPlayed:
            parseInt(teamStats.wins) +
            parseInt(teamStats.draws) +
            parseInt(teamStats.losses),
          wins: parseInt(teamStats.wins),
          draws: parseInt(teamStats.draws),
          losses: parseInt(teamStats.losses),
          points: parseInt(teamStats.points),
          goalsScored: parseInt(teamStats.goalsScored),
          goalsScoredHome: parseInt(teamStats.goalsScoredHome),
          goalsScoredAway: parseInt(teamStats.goalsScoredAway),
          goalsConceded: parseInt(teamStats.goalsConceded),
          goalsConcededHome: parseInt(teamStats.goalsConcededHome),
          goalsConcededAway: parseInt(teamStats.goalsConcededAway),
          chance2score: this.chance2score(teamStats),
          chance2scoreHome: this.chance2scoreHome(teamStats),
          chance2scoreAway: this.chance2scoreAway(teamStats),
          cornersWonAvg: parseFloat(teamStats.cornersWonAvg),
          "cornersWonOver1.5": 0,
          cornersWonHighest: 0,
          BTTS: parseFloat(teamStats.BTTS),
          "BTTSOver0.5": null,
          "BTTSOver1.5": null,
          BTTSHighest: null,
          xG: parseFloat(teamStats.xG),
          dxG: parseFloat(teamStats.dxG),
          shotsTaken: parseFloat(teamStats.shotsTaken),
          shotsTakenFirstHalf: null,
          shotsTakenSecondHalf: null,
          shotsConceded: parseFloat(teamStats.shotsConceded),
          shotsConcededFirstHalf: null,
          shotsConcededSecondHalf: null,
          shotsCR: teamStats.shotsConceded / teamStats.goalsScored,
          shotsConcededCR: teamStats.shotsTaken / teamStats.goalsScored,
          shotsOnTarget: parseFloat(teamStats.shotsOnTarget),
          shotsOnTargetHome: parseFloat(teamStats.shotsOnTargetHome),
          shotsOnTargetAway: parseFloat(teamStats.shotsOnTargetAway),
          possessionAvg: parseFloat(teamStats.possessionAvg),
          possessionAvgHome: parseFloat(teamStats.possessionHome),
          possessionAvgAway: parseFloat(teamStats.possessionAway),
          cleanSheets: parseInt(teamStats.cleanSheets),
          cleanSheetsHome: parseInt(teamStats.cleanSheetsHome),
          cleanSheetsAway: parseInt(teamStats.cleanSheetsAway),
          totalFoulsCommitted: parseInt(teamStats.totalFoulsCommitted),
          totalFoulsCommittedAgainst: parseInt(
            teamStats.totalFoulsCommittedAgainst
          ),
          dangerousAttacks: parseInt(teamStats.dangerousAttacks),
          dangerousAttacksHome: parseInt(teamStats.dangerousAttacksHome),
          dangerousAttacksAway: parseInt(teamStats.dangerousAttacksAway),
          ppgHome: parseFloat(teamStats.ppgHome),
          ppgAway: parseFloat(teamStats.ppgAway),
        },
      };
    });

    console.log("🚀 ~ MatchesService ~ overall:", overall);
    const data: any = {
      teams: normalizedTeams,
      overall,
    };

    return data;

    // const matches = await this.dbService.getMatches({
    //   competition_id: competitionId,
    // });

    // const overAllStats = await this.dbService.getOverAllStats(competitionId);

    // // Get unique teams from matches
    // const uniqueTeams = new Set(
    //   matches.map((m) => m.homeTeamId).concat(matches.map((m) => m.awayTeamId))
    // );

    // let matchesWithOverall: any[] = [];
    // matches.map((match) => {
    //   if (match) {
    //     // Check if match is defined
    //     const overall = overAllStats.find(
    //       (stat) => stat.id === match.homeTeamId
    //     );
    //     matchesWithOverall.push({ ...match, overall });
    //   }
    // });
    // return matchesWithOverall;
  }

  private chance2score = (teamStats: any): number => {
    const xg = parseFloat(teamStats.xG);
    const dxg = parseFloat(teamStats.dxG);

    if (xg === 0 || isNaN(xg) || isNaN(dxg)) return 0;

    const result = Number(((xg + dxg) / xg).toFixed(2));
    return result;
  };

  private chance2scoreHome = (teamStats: any): number => {
    const homeXg = parseFloat(teamStats.homeXg);
    const homeOpponentXg = parseFloat(teamStats.awayXg);

    if (homeXg === 0 || isNaN(homeXg) || isNaN(homeOpponentXg)) return 0;

    const result = Number(((homeXg + homeOpponentXg) / homeXg).toFixed(2));
    return result;
  };

  private chance2scoreAway = (teamStats: any): number => {
    const awayXg = parseFloat(teamStats.awayXg);
    const awayOpponentXg = parseFloat(teamStats.homeXg);
    const result = Number(((awayXg + awayOpponentXg) / awayXg).toFixed(2));
    return result;
  };
}
