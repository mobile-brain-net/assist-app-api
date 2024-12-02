import { LeagueTeam } from "../models/league-team";
import { TeamResponse } from "../types/api-types";
import { Match } from "../models/match";
import MatchStats from "../models/match-stats";
import { MatchOdds } from "../models/match-odds";
import sequelize from "../database/sequelize";
import Fixture from "../models/fixtures";

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
          "country",
          "founded",
          "image",
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

  async getMatches(params: any): Promise<Match[]> {
    return Match.findAll({
      where: params,
      include: [
        {
          model: MatchStats,
          as: "stats",
        },
        {
          model: MatchOdds,
          as: "odds",
        },
      ],
    });
  }

  async saveMatches(matches: any[]): Promise<void> {
    try {
      for (const match of matches) {
        // First check if match exists
        const existingMatch = await Match.findByPk(match.id);
        if (existingMatch) {
          continue; // Skip if exists
        }

        // Validate required fields
        if (!match.id || !match.homeID || !match.awayID) {
          console.warn(`Skipping match due to missing required fields:`, match);
          continue;
        }

        // Check if teams exist
        const homeTeam = await LeagueTeam.findByPk(match.homeID);
        const awayTeam = await LeagueTeam.findByPk(match.awayID);
        if (!homeTeam || !awayTeam) {
          console.warn(
            `Skipping match due to missing team(s): Home=${match.homeID}, Away=${match.awayID}`
          );
          continue;
        }

        // Create match with transaction
        await sequelize.transaction(async (t) => {
          const createdMatch = await Match.create(
            {
              id: match.id,
              homeTeamId: match.homeID,
              awayTeamId: match.awayID,
              season: match.season,
              status: match.status,
              date_unix: match.date_unix,
              competition_id: match.competition_id,
              stadium_name: match.stadium_name,
              attendance: match.attendance,
              referee_id: match.refereeID,
            },
            { transaction: t }
          );

          if (match.homeGoalCount !== undefined) {
            await MatchStats.create(
              {
                match_id: match.id,
                home_goals: match.homeGoalCount,
                away_goals: match.awayGoalCount,
                home_corners: match.team_a_corners,
                away_corners: match.team_b_corners,
                home_shots_on_target: match.team_a_shotsOnTarget,
                away_shots_on_target: match.team_b_shotsOnTarget,
                home_possession: match.team_a_possession,
                away_possession: match.team_b_possession,
                home_xg: match.team_a_xg,
                away_xg: match.team_b_xg,
              },
              { transaction: t }
            );
          }

          if (match.odds_ft_1 !== undefined) {
            await MatchOdds.create(
              {
                match_id: match.id,
                odds_ft_1: match.odds_ft_1,
                odds_ft_x: match.odds_ft_x,
                odds_ft_2: match.odds_ft_2,
                odds_btts_yes: match.odds_btts_yes,
                odds_btts_no: match.odds_btts_no,
                odds_over25: match.odds_ft_over25,
                odds_under25: match.odds_ft_under25,
              },
              { transaction: t }
            );
          }
        });
      }
    } catch (error) {
      console.error("Error saving matches:", error);
    }
  }

  async saveFixtures(fixtures: any[]): Promise<void> {
    await Fixture.bulkCreate(
      fixtures.map((fixture) => ({
        fixture_id: fixture.fixture?.id,
        referee: fixture.fixture?.referee,
        timezone: fixture.fixture?.timezone,
        fixture_date: fixture.fixture?.date,
        timestamp: fixture.fixture?.timestamp,
        first_period_start: fixture.fixture?.periods?.first,
        second_period_start: fixture.fixture?.periods?.second,
        venue_id: fixture.fixture?.venue?.id,
        venue_name: fixture.fixture?.venue?.name,
        venue_city: fixture.fixture?.venue?.city,
        status_long: fixture.fixture?.status?.long,
        status_short: fixture.fixture?.status?.short,
        status_elapsed: fixture.fixture?.status?.elapsed,
        league_id: fixture.league?.id,
        league_name: fixture.league?.name,
        league_country: fixture.league?.country,
        league_logo: fixture.league?.logo,
        league_flag: fixture.league?.flag,
        league_season: fixture.league?.season,
        league_round: fixture.league?.round,
        home_team_id: fixture.teams?.home?.id,
        home_team_name: fixture.teams?.home?.name,
        home_team_logo: fixture.teams?.home?.logo,
        home_team_winner: fixture.teams?.home?.winner,
        away_team_id: fixture.teams?.away?.id,
        away_team_name: fixture.teams?.away?.name,
        away_team_logo: fixture.teams?.away?.logo,
        away_team_winner: fixture.teams?.away?.winner,
        home_goals: fixture.goals?.home,
        away_goals: fixture.goals?.away,
        halftime_score_home: fixture.score?.halftime?.home,
        halftime_score_away: fixture.score?.halftime?.away,
        fulltime_score_home: fixture.score?.fulltime?.home,
        fulltime_score_away: fixture.score?.fulltime?.away,
        extra_time_score_home: fixture.score?.extratime?.home,
        extra_time_score_away: fixture.score?.extratime?.away,
        penalty_score_home: fixture.score?.penalty?.home,
        penalty_score_away: fixture.score?.penalty?.away,
      })),
      {
        updateOnDuplicate: [
          "referee",
          "timezone",
          "fixture_date",
          "timestamp",
          "status_long",
          "status_short",
          "status_elapsed",
          "home_goals",
          "away_goals",
          "halftime_score_home",
          "halftime_score_away",
          "fulltime_score_home",
          "fulltime_score_away",
          "home_team_id",
          "away_team_id",
          "home_team_name",
          "home_team_logo",
          "away_team_name",
          "away_team_logo",
          "extra_time_score_home",
          "extra_time_score_away",
          "penalty_score_home",
          "penalty_score_away",
          "first_period_start",
          "second_period_start",
          "home_team_winner",
          "away_team_winner",
          "league_id",
          "league_name",
          "league_country",
          "league_logo",
          "league_flag",
          "league_season",
          "league_round",
        ],
      }
    );
  }
}
