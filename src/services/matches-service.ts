import { DatabaseService } from "../database/database-service";
import axios from "axios";
import { Match } from "../models/match";
import { CompetitionMap } from "../types/competition";
import { LeagueIdMap } from "../types/leagues";
import { GetMatchesResponse } from "../types/api-types";
import {
  NormalizedPlTeam,
  TeamStats,
  TeamData,
  TeamsForFixtures,
} from "../types/teams";
import { StatsSection } from "../types/stats";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PredictionsService } from "./predictions-service";
import Prediction from "../models/predictions";
import { TeamFixture, TeamFixtureResponse } from "../types/fixtures";

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
      homegoals: match.stats.dataValues.home_goals ?? null,
      awaygoals: match.stats.dataValues.away_goals ?? null,
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

    const getTeams = await this.dbService.getTeams(competitionId);
    const overAllStats = await this.dbService.getOverAllStats(competitionId);
    const last5Stats = await this.dbService.getLast5Stats(competitionId);
    const last5HomeStats = await this.dbService.getLast5HomeStats(
      competitionId
    );
    const last5AwayStats = await this.dbService.getLast5AwayStats(
      competitionId
    );

    const fixturesPromises: Promise<TeamFixtureResponse>[] = getTeams.map(
      (team: TeamData) =>
        this.dbService
          .getFixturesForTeam(
            this.leagueIdMap["Premier League"],
            TeamsForFixtures[
              team.dataValues.name as keyof typeof TeamsForFixtures
            ]
          )
          .then((fixtures) => ({
            teamName:
              TeamsForFixtures[
                team.dataValues.name as keyof typeof TeamsForFixtures
              ],
            fixtures: fixtures.map((f) => ({
              result: f.result,
              score: f.score,
              against: f.against,
              datetime: f.datetime,
            })),
          }))
    );

    const fixturesHomePromises: Promise<TeamFixtureResponse>[] = getTeams.map(
      (team: TeamData) =>
        this.dbService
          .getFixturesForTeamHome(
            this.leagueIdMap["Premier League"],
            TeamsForFixtures[
              team.dataValues.name as keyof typeof TeamsForFixtures
            ]
          )
          .then((fixtures) => ({
            teamName:
              TeamsForFixtures[
                team.dataValues.name as keyof typeof TeamsForFixtures
              ],
            fixtures: fixtures.map((f) => ({
              result: f.result,
              score: f.score,
              against: f.against,
              datetime: f.datetime,
            })),
          }))
    );

    const fixturesAwayPromises: Promise<TeamFixtureResponse>[] = getTeams.map(
      (team: TeamData) =>
        this.dbService
          .getFixturesForTeamAway(
            this.leagueIdMap["Premier League"],
            TeamsForFixtures[
              team.dataValues.name as keyof typeof TeamsForFixtures
            ]
          )
          .then((fixtures) => ({
            teamName:
              TeamsForFixtures[
                team.dataValues.name as keyof typeof TeamsForFixtures
              ],
            fixtures: fixtures.map((f) => ({
              result: f.result,
              score: f.score,
              against: f.against,
              datetime: f.datetime,
            })),
          }))
    );

    const allFixtures: TeamFixtureResponse[] = await Promise.all(
      fixturesPromises
    );
    const allFixturesHome: TeamFixtureResponse[] = await Promise.all(
      fixturesHomePromises
    );
    const allFixturesAway: TeamFixtureResponse[] = await Promise.all(
      fixturesAwayPromises
    );

    let normalizedTeams = getTeams.map((team: TeamData) => {
      const tablePosition = team.table_position;
      const teamStats = overAllStats.find((s: TeamStats) => s.id === team.id);
      const last5 = last5Stats.find((s: TeamStats) => s.id === team.id);
      const last5Home = last5HomeStats.find((s: TeamStats) => s.id === team.id);
      const last5Away = last5AwayStats.find((s: TeamStats) => s.id === team.id);
      const last5FixturesTotal = allFixtures.find((f: TeamFixtureResponse) => {
        const teamKey =
          TeamsForFixtures[
            team.dataValues.name as keyof typeof TeamsForFixtures
          ];
        return f.teamName === teamKey;
      });
      const last5FixturesHome = allFixturesHome.find(
        (f: TeamFixtureResponse) =>
          f.teamName ===
          TeamsForFixtures[team.name as keyof typeof TeamsForFixtures]
      );
      const last5FixturesAway = allFixturesAway.find(
        (f: TeamFixtureResponse) =>
          f.teamName ===
          TeamsForFixtures[team.name as keyof typeof TeamsForFixtures]
      );

      if (!teamStats || !last5 || !last5Home || !last5Away) {
        throw new Error(`Missing stats for team ${team.name}`);
      }

      return {
        name: NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam],
        logo: NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam],
        home_kits: `/api/images/home/${
          NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam]
        }.svg`,
        away_kits: `/api/images/away/${
          NormalizedPlTeam[team.name as keyof typeof NormalizedPlTeam]
        }.svg`,
        overall: this.mapStatsSection(teamStats, undefined, tablePosition),
        last5: this.mapStatsSection(last5, last5FixturesTotal, null),
        last5Home: this.mapStatsSection(last5Home, last5FixturesHome, null),
        last5Away: this.mapStatsSection(last5Away, last5FixturesAway, null),
      };
    });

    const data: any = {
      teams: normalizedTeams,
    };

    return data;
  }

  private mapStatsSection(
    stats: TeamStats,
    last5Games?: TeamFixtureResponse,
    tablePosition?: number | null
  ): StatsSection {
    return {
      position: tablePosition ? tablePosition : "TO FIX",
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
      chance2score: this.chance2score(stats),
      chance2scoreHome: this.chance2scoreHome(stats),
      chance2scoreAway: this.chance2scoreAway(stats),
      cornersWonAvg: parseFloat(stats.cornersWonAvg),
      cornersWonOver0_5: this.cornersWonOver0_5(stats),
      cornersWonOver1_5: this.cornersWonOver1_5(stats),
      cornersWonHighest: parseInt(stats.cornersWonHighest),
      BTTS: parseFloat(stats.BTTS),
      BTTSOver0_5: this.BTTSOver0_5(stats),
      BTTSOver1_5: this.BTTSOver1_5(stats),
      BTTSHighest: this.BTTSHighest(stats),
      xG: parseFloat(stats.xG),
      dxG: parseFloat(stats.dxG),
      shotsTaken: parseFloat(stats.shotsTaken),
      shotsTakenFirstHalf: this.shotsTakenFirstHalf(stats),
      shotsTakenSecondHalf: this.shotsTakenSecondHalf(stats),
      shotsConceded: parseFloat(stats.shotsConceded),
      shotsConcededFirstHalf: this.shotsConcededFirstHalf(stats),
      shotsConcededSecondHalf: this.shotsConcededSecondHalf(stats),
      shotsCR: this.shotsCR(stats),
      shotsConcededCR: this.shotsConcededCR(stats),
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
      dangerousAttacksConceded: this.dangerousAttacksConceded(stats),
      dangerousAttacksConcededHome: this.dangerousAttacksConcededHome(stats),
      dangerousAttacksConcededAway: this.dangerousAttacksConcededAway(stats),
      ppgHome: parseFloat(stats.ppgHome),
      ppgAway: parseFloat(stats.ppgAway),
      games: last5Games?.fixtures || undefined,
      // games: last5Games || undefined,
    };
  }

  private chance2score(teamStats: TeamStats): number {
    const xg = parseFloat(teamStats.xG);
    const dxg = parseFloat(teamStats.dxG);

    if (xg === 0 || isNaN(xg) || isNaN(dxg)) return 0;

    const result = Number(((xg + dxg) / xg).toFixed(2));
    return result;
  }

  private chance2scoreHome(teamStats: TeamStats): number {
    const homeXg = parseFloat(teamStats.homeXg);
    const homeOpponentXg = parseFloat(teamStats.awayXg);

    if (homeXg === 0 || isNaN(homeXg) || isNaN(homeOpponentXg)) return 0;

    const result = Number(((homeXg + homeOpponentXg) / homeXg).toFixed(2));
    return result;
  }

  private chance2scoreAway(teamStats: TeamStats): number {
    const awayXg = parseFloat(teamStats.awayXg);
    const awayOpponentXg = parseFloat(teamStats.homeXg);
    const result = Number(((awayXg + awayOpponentXg) / awayXg).toFixed(2));
    return result;
  }

  private cornersWonOver0_5(teamStats: TeamStats): number {
    const cornersWonAvg = parseFloat(teamStats.cornersWonAvg);
    const cornersWonOver1_5 = parseFloat(teamStats.cornersWonOver1_5);
    const cornersWonHighest = parseInt(teamStats.cornersWonHighest);

    if (
      cornersWonAvg === 0 ||
      isNaN(cornersWonAvg) ||
      isNaN(cornersWonOver1_5) ||
      isNaN(cornersWonHighest)
    )
      return 0;

    const result = Number(
      ((cornersWonAvg + cornersWonOver1_5 + cornersWonHighest) / 3).toFixed(2)
    );
    return result;
  }

  private cornersWonOver1_5(teamStats: TeamStats): number {
    const cornersWonOver1_5 = parseFloat(teamStats.cornersWonOver1_5);
    const cornersWonHighest = parseInt(teamStats.cornersWonHighest);

    if (
      cornersWonOver1_5 === 0 ||
      isNaN(cornersWonOver1_5) ||
      isNaN(cornersWonHighest)
    )
      return 0;

    const result = Number(
      ((cornersWonOver1_5 + cornersWonHighest) / 2).toFixed(2)
    );
    return result;
  }

  private BTTSOver0_5(teamStats: TeamStats): number | null {
    const BTTSOver0_5 = parseFloat(teamStats.BTTSOver0_5);

    if (BTTSOver0_5 === 0 || isNaN(BTTSOver0_5)) return null;

    return BTTSOver0_5;
  }

  private BTTSOver1_5(teamStats: TeamStats): number | null {
    const BTTSOver1_5 = parseFloat(teamStats.BTTSOver1_5);

    if (BTTSOver1_5 === 0 || isNaN(BTTSOver1_5)) return null;

    return BTTSOver1_5;
  }

  private BTTSHighest(teamStats: TeamStats): number | null {
    const BTTSHighest = parseFloat(teamStats.BTTSHighest);

    if (BTTSHighest === 0 || isNaN(BTTSHighest)) return null;

    return BTTSHighest;
  }

  private shotsTakenFirstHalf(teamStats: TeamStats): number | null {
    const shotsTaken = parseFloat(teamStats.shotsTaken);
    const shotsTakenHome = parseFloat(teamStats.shotsTakenHome);
    const shotsTakenAway = parseFloat(teamStats.shotsTakenAway);

    if (
      shotsTaken === 0 ||
      isNaN(shotsTaken) ||
      isNaN(shotsTakenHome) ||
      isNaN(shotsTakenAway)
    )
      return null;

    const result = Number(((shotsTakenHome + shotsTakenAway) / 2).toFixed(2));
    return result;
  }

  private shotsTakenSecondHalf(teamStats: TeamStats): number | null {
    const shotsTaken = parseFloat(teamStats.shotsTaken);
    const shotsTakenHome = parseFloat(teamStats.shotsTakenHome);
    const shotsTakenAway = parseFloat(teamStats.shotsTakenAway);

    if (
      shotsTaken === 0 ||
      isNaN(shotsTaken) ||
      isNaN(shotsTakenHome) ||
      isNaN(shotsTakenAway)
    )
      return null;

    const result = Number(((shotsTakenHome + shotsTakenAway) / 2).toFixed(2));
    return result;
  }

  private shotsConcededFirstHalf(teamStats: TeamStats): number | null {
    const shotsConceded = parseFloat(teamStats.shotsConceded);
    const shotsConcededHome = parseFloat(teamStats.shotsConcededHome);
    const shotsConcededAway = parseFloat(teamStats.shotsConcededAway);

    if (
      shotsConceded === 0 ||
      isNaN(shotsConceded) ||
      isNaN(shotsConcededHome) ||
      isNaN(shotsConcededAway)
    )
      return null;

    const result = Number(
      ((shotsConcededHome + shotsConcededAway) / 2).toFixed(2)
    );
    return result;
  }

  private shotsConcededSecondHalf(teamStats: TeamStats): number | null {
    const shotsConceded = parseFloat(teamStats.shotsConceded);
    const shotsConcededHome = parseFloat(teamStats.shotsConcededHome);
    const shotsConcededAway = parseFloat(teamStats.shotsConcededAway);

    if (
      shotsConceded === 0 ||
      isNaN(shotsConceded) ||
      isNaN(shotsConcededHome) ||
      isNaN(shotsConcededAway)
    )
      return null;

    const result = Number(
      ((shotsConcededHome + shotsConcededAway) / 2).toFixed(2)
    );
    return result;
  }

  private shotsCR(teamStats: TeamStats): number {
    const shotsTaken = parseFloat(teamStats.shotsTaken);
    const shotsConceded = parseFloat(teamStats.shotsConceded);

    if (shotsTaken === 0 || isNaN(shotsTaken) || isNaN(shotsConceded)) return 0;

    const result = Number(
      ((shotsTaken - shotsConceded) / shotsTaken).toFixed(2)
    );
    return result;
  }

  private shotsConcededCR(teamStats: TeamStats): number {
    const shotsConceded = parseFloat(teamStats.shotsConceded);
    const shotsConcededHome = parseFloat(teamStats.shotsConcededHome);
    const shotsConcededAway = parseFloat(teamStats.shotsConcededAway);

    if (
      shotsConceded === 0 ||
      isNaN(shotsConceded) ||
      isNaN(shotsConcededHome) ||
      isNaN(shotsConcededAway)
    )
      return 0;

    const result = Number(
      ((shotsConcededHome + shotsConcededAway) / 2).toFixed(2)
    );
    return result;
  }

  private dangerousAttacksConceded(teamStats: TeamStats): number {
    const dangerousAttacks = parseInt(teamStats.dangerousAttacks);
    const dangerousAttacksHome = parseInt(teamStats.dangerousAttacksHome);
    const dangerousAttacksAway = parseInt(teamStats.dangerousAttacksAway);

    if (
      dangerousAttacks === 0 ||
      isNaN(dangerousAttacks) ||
      isNaN(dangerousAttacksHome) ||
      isNaN(dangerousAttacksAway)
    )
      return 0;

    const result = Number(
      ((dangerousAttacksHome + dangerousAttacksAway) / 2).toFixed(2)
    );
    return result;
  }

  private dangerousAttacksConcededHome(teamStats: TeamStats): number {
    const dangerousAttacksHome = parseInt(teamStats.dangerousAttacksHome);

    if (dangerousAttacksHome === 0 || isNaN(dangerousAttacksHome)) return 0;

    return dangerousAttacksHome;
  }

  private dangerousAttacksConcededAway(teamStats: TeamStats): number {
    const dangerousAttacksAway = parseInt(teamStats.dangerousAttacksAway);

    if (dangerousAttacksAway === 0 || isNaN(dangerousAttacksAway)) return 0;

    return dangerousAttacksAway;
  }
}
