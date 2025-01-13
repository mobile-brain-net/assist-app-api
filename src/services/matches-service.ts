import { DatabaseService } from "../database/database-service";
import axios from "axios";
import { Match } from "../models/match";
import { CompetitionMap } from "../types/competition";
import { LeagueIdMap } from "../types/leagues";
import { GetMatchesResponse } from "../types/api-types";
import { NormalizedPlTeam, TeamStats, TeamData } from "../types/teams";
import { StatsSection, StatsSectionJSON } from "../types/stats";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PredictionsService } from "./predictions-service";
import Prediction from "../models/predictions";
import { TeamFixtureResponse } from "../types/fixtures";
import {
  calculateChance2score,
  calculateChance2scoreHome,
  calculateChance2scoreAway,
  calculateCornersWonOver0_5,
  calculateCornersWonOver1_5,
  calculateBTTSMetrics,
  calculateShotsMetrics,
  calculateDangerousAttacks,
  calculateTeamPositions,
} from "../utils/matches-utils";

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
        leagueId,
        competitionId
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
    leagueId: number,
    competitionId: number
  ): Promise<any[]> {
    return Promise.all(
      matchesDataForJson.map(async (match) => {
        console.log(
          "🚀 ~ MatchesService ~ matchesDataForJson.map ~ match:",
          match
        );
        dayjs.extend(utc);
        dayjs.extend(timezone);
        const odds = this.calculateOdds(match.odds);
        // Non-null assertion (!) forces TypeScript to treat the possibly undefined prediction as defined
        // This could cause runtime errors if getPrediction returns undefined
        // Consider handling the undefined case explicitly instead
        let prediction = (await this.getPrediction(
          match,
          leagueId,
          competitionId
        ))!;
        if (!prediction) {
          prediction = <any>{
            fixture_id: 0,
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
            teams_home_goals_for_average_home: "",
            teams_away_goals_for_total: 0,
            teams_away_goals_for_average_away: "",
          };
        }

        return {
          date: dayjs
            .unix(match.date_unix)
            .tz("Europe/London")
            .format("DD/MM/YYYY HH:mm"),
          home: this.mapTeam(match.home, "home"),
          away: this.mapTeam(match.away, "away"),
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

    // Swap odds_ft_1 (away) and odds_ft_2 (home)
    let away_win = Math.round((odds.odds_ft_1 / oddsTotal) * 100);
    const draw = Math.round((odds.odds_ft_x / oddsTotal) * 100);
    const home_win = Math.round((odds.odds_ft_2 / oddsTotal) * 100);

    if (home_win + draw + away_win !== 100) {
      away_win = 100 - (draw + home_win);
    }

    return { home_win, draw, away_win };
  }

  private async getPrediction(
    match: any,
    leagueId: number,
    competitionId: number
  ): Promise<PredictionType | undefined> {
    const teams = await this.dbService.getTeams(competitionId);

    const homeTeam = teams.find((t) => t.dataValues.name === match.home.name);
    const awayTeam = teams.find((t) => t.dataValues.name === match.away.name);

    if (!homeTeam || !awayTeam) return undefined;

    return (
      await this.predictionsService.getPredictionsByTeams(
        homeTeam.dataValues.name_from_fixtures,
        awayTeam.dataValues.name_from_fixtures,
        leagueId
      )
    )[0];
  }

  private mapTeam(
    team: any,
    kitsHomeOrAway: "home" | "away"
  ): { name: string; icon: string; kits: string } {
    let normalizedName =
      NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam];
    if (normalizedName === "Nottingham") {
      normalizedName = "Nottingham Forest" as NormalizedPlTeam;
    }
    return {
      name: normalizedName,
      icon: team.image,
      kits: `/api/images/${kitsHomeOrAway}/${normalizedName}.svg`,
    };
  }

  private mapResult(match: any): {
    status: string;
    homegoals: number | null;
    awaygoals: number | null;
  } {
    const matchStatus = match.date_unix >= dayjs().unix() ? "ns" : "f";
    return {
      status: matchStatus,
      homegoals:
        matchStatus === "ns" ? null : match.stats.dataValues.home_goals,
      awaygoals:
        matchStatus === "ns" ? null : match.stats.dataValues.away_goals,
    };
  }

  async aggregateMatches(params: {
    year: string;
    league_name: string;
  }): Promise<{ teams: any[] }> {
    const { year, league_name } = params;
    if (!year || !league_name) return { teams: [] };

    const competitionId = this.competitionIds[league_name]?.[year] || null;
    if (!competitionId) return { teams: [] };

    // Fetch all data in parallel
    const [teams, overAllStats, last5Stats, last5HomeStats, last5AwayStats] =
      await Promise.all([
        this.dbService.getTeams(competitionId),
        this.dbService.getOverAllStats(competitionId),
        this.dbService.getLast5Stats(competitionId),
        this.dbService.getLast5HomeStats(competitionId),
        this.dbService.getLast5AwayStats(competitionId),
      ]);

    // Process stats with positions
    const processedStats = {
      last5: calculateTeamPositions(last5Stats),
      last5Home: calculateTeamPositions(last5HomeStats),
      last5Away: calculateTeamPositions(last5AwayStats),
    };

    // Fetch all fixtures in parallel
    const [allFixtures, allFixturesHome, allFixturesAway] = await Promise.all([
      this.getTeamFixtures(teams, "all"),
      this.getTeamFixtures(teams, "home"),
      this.getTeamFixtures(teams, "away"),
    ]);

    const normalizedTeams = teams.map((team: TeamData) =>
      this.normalizeTeamData(team, {
        overAllStats,
        processedStats,
        fixtures: {
          all: allFixtures,
          home: allFixturesHome,
          away: allFixturesAway,
        },
      })
    );

    return { teams: normalizedTeams };
  }

  private async getTeamFixtures(
    teams: TeamData[],
    type: "all" | "home" | "away"
  ): Promise<TeamFixtureResponse[]> {
    const fixtureMethod = {
      all: "getFixturesForTeam",
      home: "getFixturesForTeamHome",
      away: "getFixturesForTeamAway",
    }[type];

    return Promise.all(
      teams.map((team) =>
        (this.dbService[fixtureMethod as keyof DatabaseService] as Function)(
          this.leagueIdMap["Premier League"],
          team.dataValues.name_from_fixtures
        ).then(
          (
            fixtures: Array<{
              result: string;
              score: string;
              against: string;
              datetime: string;
            }>
          ) => ({
            teamName: team.dataValues.normalized_name,
            fixtures: this.mapFixtures(fixtures, teams),
          })
        )
      )
    );
  }

  private mapFixtures(
    fixtures: Array<{
      result: string;
      score: string;
      against: string;
      datetime: string;
    }>,
    teams: TeamData[]
  ) {
    return fixtures.map((f) => ({
      result: f.result,
      score: f.score,
      against:
        teams.find((t) => t.dataValues.name_from_fixtures === f.against)
          ?.dataValues.normalized_name || f.against,
      datetime: f.datetime,
    }));
  }

  private normalizeTeamData(
    team: TeamData,
    data: {
      overAllStats: any[];
      processedStats: any;
      fixtures: {
        all: TeamFixtureResponse[];
        home: TeamFixtureResponse[];
        away: TeamFixtureResponse[];
      };
    }
  ) {
    const { overAllStats, processedStats, fixtures } = data;
    let normalizedName =
      NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam];
    if (normalizedName === "Nottingham") {
      normalizedName = "Nottingham Forest" as NormalizedPlTeam;
    }
    const teamStats = overAllStats.find((s: TeamStats) => s.id === team.id);
    const last5 = processedStats.last5.find((s: TeamStats) => s.id === team.id);
    const last5Home = processedStats.last5Home.find(
      (s: TeamStats) => s.id === team.id
    );
    const last5Away = processedStats.last5Away.find(
      (s: TeamStats) => s.id === team.id
    );

    if (!teamStats || !last5 || !last5Home || !last5Away) {
      throw new Error(`Missing stats for team ${team.name}`);
    }

    return {
      name: normalizedName,
      logo: normalizedName,
      home_kits: `/api/images/home/${normalizedName}.svg`,
      away_kits: `/api/images/away/${normalizedName}.svg`,
      overall: this.mapStatsSection(
        teamStats,
        undefined,
        team.table_position,
        false
      ),
      last5: this.mapStatsSection(
        last5,
        fixtures.all.find((f) => f.teamName === normalizedName),
        null,
        true
      ),
      last5Home: this.mapStatsSection(
        last5Home,
        fixtures.home.find((f) => f.teamName === normalizedName),
        null,
        true
      ),
      last5Away: this.mapStatsSection(
        last5Away,
        fixtures.away.find((f) => f.teamName === normalizedName),
        null,
        true
      ),
    };
  }

  private mapStatsSection(
    stats: TeamStats,
    last5Games?: TeamFixtureResponse,
    tablePosition?: number | null,
    showGames?: boolean
  ): StatsSectionJSON {
    const baseStats: StatsSection = {
      position: tablePosition ? tablePosition : stats.position || 0,
      matchesPlayed:
        parseInt(stats.wins) + parseInt(stats.draws) + parseInt(stats.losses),
      wins: parseInt(stats.wins),
      draws: parseInt(stats.draws),
      losses: parseInt(stats.losses),
      points: parseInt(stats.points),
      goalsScored: parseInt(stats.goalsScored),
      goalsScoredHome: parseInt(stats.goalsScoredHome),
      goalsScoredAway: parseInt(stats.goalsScoredAway),
      goalsConceded: parseInt(stats.goalsConceded),
      goalsConcededHome: parseInt(stats.goalsConcededHome),
      goalsConcededAway: parseInt(stats.goalsConcededAway),
      chance2score: calculateChance2score(stats),
      chance2scoreHome: calculateChance2scoreHome(stats),
      chance2scoreAway: calculateChance2scoreAway(stats),
      cornersWonAvg: parseFloat(stats.cornersWonAvg),
      cornersWonOver0_5: calculateCornersWonOver0_5(stats),
      cornersWonOver1_5: calculateCornersWonOver1_5(stats),
      cornersWonHighest: parseInt(stats.cornersWonHighest),
      BTTS: parseFloat(stats.BTTS),
      "BTTSOver0.5": calculateBTTSMetrics.over0_5(stats),
      "BTTSOver1.5": calculateBTTSMetrics.over1_5(stats),
      BTTSHighest: calculateBTTSMetrics.highest(stats),
      xG: parseFloat(stats.xG),
      dxG: parseFloat(stats.dxG),
      shotsTaken: parseFloat(stats.shotsTaken),
      shotsTakenFirstHalf: calculateShotsMetrics.takenFirstHalf(stats),
      shotsTakenSecondHalf: calculateShotsMetrics.takenSecondHalf(stats),
      shotsConceded: parseFloat(stats.shotsConceded),
      shotsConcededFirstHalf: calculateShotsMetrics.concededFirstHalf(stats),
      shotsConcededSecondHalf: calculateShotsMetrics.concededSecondHalf(stats),
      shotsCR: Math.abs(calculateShotsMetrics.CR(stats)),
      shotsConcededCR: calculateShotsMetrics.concededCR(stats),
      shotsOnTarget: parseFloat(stats.shotsOnTarget),
      shotsOnTargetHome: parseFloat(stats.shotsOnTargetHome),
      shotsOnTargetAway: parseFloat(stats.shotsOnTargetAway),
      possessionAvg: parseFloat(stats.possessionAvg),
      possessionHome: parseFloat(stats.possessionHome),
      possessionAway: parseFloat(stats.possessionAway),
      cleanSheets: parseInt(stats.cleanSheets),
      cleanSheetsHome: parseInt(stats.cleanSheetsHome),
      cleanSheetsAway: parseInt(stats.cleanSheetsAway),
      totalFoulsCommitted: parseInt(stats.totalFoulsCommitted),
      totalFoulsCommittedAgainst: parseInt(stats.totalFoulsCommittedAgainst),
      dangerousAttacks: parseInt(stats.dangerousAttacks),
      dangerousAttacksHome: parseInt(stats.dangerousAttacksHome),
      dangerousAttacksAway: parseInt(stats.dangerousAttacksAway),
      dangerousAttacksConceded: calculateDangerousAttacks.conceded(stats),
      dangerousAttacksConcededHome:
        calculateDangerousAttacks.concededHome(stats),
      dangerousAttacksConcededAway:
        calculateDangerousAttacks.concededAway(stats),
      ppgHome: parseFloat(stats.ppgHome),
      ppgAway: parseFloat(stats.ppgAway),
      games: showGames ? last5Games?.fixtures || [] : undefined,
    };

    return {
      ...baseStats,
      "cornersWonOver0.5": baseStats.cornersWonOver0_5,
      "cornersWonOver1.5": baseStats.cornersWonOver1_5,
    } as StatsSectionJSON;
  }
}
