import { LeagueTeam } from "../models/league-team";
import { PredictionResponse, TeamResponse } from "../types/api-types";
import { Match } from "../models/match";
import MatchStats from "../models/match-stats";
import { MatchOdds } from "../models/match-odds";
import sequelize from "../database/sequelize";
import Fixture from "../models/fixtures";
import Prediction from "../models/predictions";
import { Op, QueryTypes } from "sequelize";
import dayjs from "dayjs";

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
    const matches = await Match.findAll({
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
        {
          model: LeagueTeam,
          as: "home",
        },
        {
          model: LeagueTeam,
          as: "away",
        },
      ],
    });
    return matches.map((match) => match.toJSON());
  }

  async getOverAllStats(competitionId: number): Promise<any[]> {
    const query = `SELECT 
    t.id,
    t.name,
    COUNT(DISTINCT m.id) as matchesPlayed,
 AVG(CASE WHEN m.home_team_id = t.id THEN s.home_shots_on_target ELSE s.away_shots_on_target END) AS shotsTaken,
AVG(CASE WHEN m.home_team_id = t.id THEN s.away_shots_on_target ELSE s.home_shots_on_target END) AS shotsConceded,
AVG(CASE WHEN m.home_team_id = t.id THEN s.home_shots_on_target ELSE 0 END) AS shotsTakenHome,
AVG(CASE WHEN m.away_team_id = t.id THEN s.away_shots_on_target ELSE 0 END) AS shotsTakenAway,
AVG(CASE WHEN m.home_team_id = t.id THEN s.away_shots_on_target ELSE 0 END) AS shotsConcededHome, 
AVG(CASE WHEN m.away_team_id = t.id THEN s.home_shots_on_target ELSE 0 END) AS shotsConcededAway, 
    SUM(CASE WHEN 
        (m.home_team_id = t.id AND s.home_goals > s.away_goals) OR 
        (m.away_team_id = t.id AND s.away_goals > s.home_goals)
        THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN s.home_goals = s.away_goals THEN 1 ELSE 0 END) as draws,
    SUM(CASE WHEN 
        (m.home_team_id = t.id AND s.home_goals < s.away_goals) OR 
        (m.away_team_id = t.id AND s.away_goals < s.home_goals)
        THEN 1 ELSE 0 END) as losses,
    (SUM(CASE WHEN 
        (m.home_team_id = t.id AND s.home_goals > s.away_goals) OR 
        (m.away_team_id = t.id AND s.away_goals > s.home_goals)
        THEN 3 
        WHEN s.home_goals = s.away_goals THEN 1
        ELSE 0 END)) as points,
    SUM(CASE WHEN m.home_team_id = t.id THEN s.home_goals ELSE s.away_goals END) as goalsScored,
    SUM(CASE WHEN m.home_team_id = t.id THEN s.home_goals ELSE 0 END) as goalsScoredHome,
    SUM(CASE WHEN m.away_team_id = t.id THEN s.away_goals ELSE 0 END) as goalsScoredAway,
    SUM(CASE WHEN m.home_team_id = t.id THEN s.away_goals ELSE s.home_goals END) as goalsConceded,
    SUM(CASE WHEN m.home_team_id = t.id THEN s.away_goals ELSE 0 END) as goalsConcededHome,
    SUM(CASE WHEN m.away_team_id = t.id THEN s.home_goals ELSE 0 END) as goalsConcededAway,
ROUND(SUM(CASE WHEN m.home_team_id = t.id THEN s.home_xg ELSE s.away_xg END), 2) as xG,
ROUND(SUM(CASE WHEN m.home_team_id = t.id THEN s.away_xg ELSE s.home_xg END), 2) as dxG,
ROUND(SUM(CASE WHEN m.home_team_id = t.id THEN s.home_xg ELSE 0 END), 2) as homeXg,
ROUND(SUM(CASE WHEN m.away_team_id = t.id THEN s.away_xg ELSE 0 END), 2) as awayXg,
    ROUND(AVG(CASE WHEN m.home_team_id = t.id THEN s.home_corners ELSE s.away_corners END), 2) as cornersWonAvg,
    MAX(CASE WHEN m.home_team_id = t.id THEN s.home_corners ELSE s.away_corners END) as cornersWonHighest,
    SUM(CASE WHEN 
        (m.home_team_id = t.id AND s.home_goals > 0 AND s.away_goals > 0) OR 
        (m.away_team_id = t.id AND s.home_goals > 0 AND s.away_goals > 0)
        THEN 1 ELSE 0 END) as BTTS,
    ROUND(AVG(CASE WHEN m.home_team_id = t.id THEN s.home_shots_on_target ELSE s.away_shots_on_target END), 2) as shotsOnTarget,
    ROUND(AVG(CASE WHEN m.home_team_id = t.id THEN s.home_shots_on_target ELSE 0 END), 2) as shotsOnTargetHome,
    ROUND(AVG(CASE WHEN m.away_team_id = t.id THEN s.away_shots_on_target ELSE 0 END), 2) as shotsOnTargetAway,
    ROUND(AVG(CASE WHEN m.home_team_id = t.id THEN s.home_possession ELSE s.away_possession END), 2) as possessionAvg,
    ROUND(AVG(CASE WHEN m.home_team_id = t.id THEN s.home_possession ELSE 0 END), 2) as possessionHome,
    ROUND(AVG(CASE WHEN m.away_team_id = t.id THEN s.away_possession ELSE 0 END), 2) as possessionAway,
    SUM(CASE WHEN 
        (m.home_team_id = t.id AND s.away_goals = 0) OR 
        (m.away_team_id = t.id AND s.home_goals = 0)
        THEN 1 ELSE 0 END) as cleanSheets,
    SUM(CASE WHEN m.home_team_id = t.id AND s.away_goals = 0 THEN 1 ELSE 0 END) as cleanSheetsHome,
    SUM(CASE WHEN m.away_team_id = t.id AND s.home_goals = 0 THEN 1 ELSE 0 END) as cleanSheetsAway,
    ROUND(
        SUM(CASE WHEN m.home_team_id = t.id AND s.home_goals > s.away_goals THEN 3 
                 WHEN m.home_team_id = t.id AND s.home_goals = s.away_goals THEN 1 
                 ELSE 0 END) / 
        NULLIF(COUNT(CASE WHEN m.home_team_id = t.id THEN 1 END), 0),
        2
    ) as ppgHome,
    ROUND(
        SUM(CASE WHEN m.away_team_id = t.id AND s.away_goals > s.home_goals THEN 3 
                 WHEN m.away_team_id = t.id AND s.home_goals = s.away_goals THEN 1 
                 ELSE 0 END) / 
        NULLIF(COUNT(CASE WHEN m.away_team_id = t.id THEN 1 END), 0),
        2
    ) as ppgAway
    
FROM league_teams t
LEFT JOIN matches m ON t.id = m.home_team_id OR t.id = m.away_team_id
LEFT JOIN match_stats s ON m.id = s.match_id
WHERE m.status = 'complete'
GROUP BY t.id, t.name
ORDER BY points DESC;`;

    return sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
  }

  async saveMatches(matches: any[]): Promise<void> {
    try {
      for (const match of matches) {
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

        const existingMatch = await Match.findByPk(match.id);

        await sequelize.transaction(async (t) => {
          if (existingMatch) {
            // Update existing match
            await Match.update(
              {
                status: match.status,
                date_unix: match.date_unix,
                stadium_name: match.stadium_name,
                attendance: match.attendance,
                referee_id: match.refereeID,
              },
              { where: { id: match.id }, transaction: t }
            );

            // Update match stats
            await MatchStats.upsert(
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

            // Update match odds
            await MatchOdds.upsert(
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
          } else {
            // Create new match
            await Match.create(
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

  async getFixtures(params: any): Promise<Fixture[]> {
    const predictions = await Prediction.findAll({
      attributes: ["fixture_id"],
    });
    return Fixture.findAll({
      attributes: ["fixture_id"],
      where: {
        fixture_id: {
          [Op.notIn]: predictions.map((prediction) => prediction.fixture_id),
        },
      },
    });
  }

  async savePredictions(predictions: PredictionResponse[]): Promise<void> {
    await Prediction.bulkCreate(
      predictions.map((prediction) => ({
        fixture_id: prediction.fixture_id,
        predictions_winner_id: prediction.predictions?.winner?.id,
        predictions_winner_name: prediction.predictions?.winner?.name,
        predictions_winner_comment: prediction.predictions?.winner?.comment,
        predictions_win_or_draw: prediction.predictions?.win_or_draw,
        predictions_under_over: prediction.predictions?.under_over,
        predictions_goals_home: prediction.predictions?.goals?.home,
        predictions_goals_away: prediction.predictions?.goals?.away,
        predictions_advice: prediction.predictions?.advice,
        predictions_percent_home: prediction.predictions?.percent?.home,
        predictions_percent_draw: prediction.predictions?.percent?.draw,
        predictions_percent_away: prediction.predictions?.percent?.away,
        league_id: prediction.league?.id,
        league_name: prediction.league?.name,
        league_country: prediction.league?.country,
        league_logo: prediction.league?.logo,
        league_flag: prediction.league?.flag,
        league_season: prediction.league?.season,
        home_team_id: prediction.teams?.home?.id,
        home_team_name: prediction.teams?.home?.name,
        home_team_logo: prediction.teams?.home?.logo,
        home_last_5_form: prediction.teams?.home?.last_5?.form,
        home_last_5_att: prediction.teams?.home?.last_5?.att,
        home_last_5_def: prediction.teams?.home?.last_5?.def,
        home_goals_for_total: prediction.teams?.home?.last_5?.goals?.for?.total,
        home_goals_for_average:
          prediction.teams?.home?.last_5?.goals?.for?.average,
        home_goals_against_total:
          prediction.teams?.home?.last_5?.goals?.against?.total,
        home_goals_against_average:
          prediction.teams?.home?.last_5?.goals?.against?.average,
        away_team_id: prediction.teams?.away?.id,
        away_team_name: prediction.teams?.away?.name,
        away_team_logo: prediction.teams?.away?.logo,
        away_last_5_form: prediction.teams?.away?.last_5?.form,
        away_last_5_att: prediction.teams?.away?.last_5?.att,
        away_last_5_def: prediction.teams?.away?.last_5?.def,
        away_goals_for_total: prediction.teams?.away?.last_5?.goals?.for?.total,
        away_goals_for_average:
          prediction.teams?.away?.last_5?.goals?.for?.average,
        away_goals_against_total:
          prediction.teams?.away?.last_5?.goals?.against?.total,
        comparison_form_home: prediction.comparison?.form?.home,
        comparison_form_away: prediction.comparison?.form?.away,
        comparison_att_home: prediction.comparison?.att?.home,
        comparison_att_away: prediction.comparison?.att?.away,
        comparison_def_home: prediction.comparison?.def?.home,
        comparison_def_away: prediction.comparison?.def?.away,
        comparison_poisson_distribution_home:
          prediction.comparison?.poisson_distribution?.home,
        comparison_poisson_distribution_away:
          prediction.comparison?.poisson_distribution?.away,
        comparison_h2h_home: prediction.comparison?.h2h?.home,
        comparison_h2h_away: prediction.comparison?.h2h?.away,
      })),
      {
        updateOnDuplicate: [
          "prediction_winner_id",
          "prediction_winner_name",
          "prediction_winner_comment",
          "prediction_win_or_draw",
          "prediction_under_over",
          "prediction_goals_home",
          "prediction_goals_away",
          "prediction_advice",
          "prediction_percent_home",
          "prediction_percent_draw",
          "prediction_percent_away",
          "league_id",
          "league_name",
          "league_country",
          "league_logo",
          "league_flag",
          "league_season",
          "home_team_id",
          "home_team_name",
          "home_team_logo",
          "home_last_5_form",
          "home_last_5_att",
          "home_last_5_def",
          "home_goals_for_total",
          "home_goals_against_total",
          "away_team_id",
          "away_team_name",
          "away_team_logo",
          "away_last_5_form",
          "away_last_5_att",
          "away_last_5_def",
          "away_goals_for_total",
          "away_goals_against_total",
          "comparison_form_home",
          "comparison_form_away",
          "comparison_att_home",
          "comparison_att_away",
          "comparison_def_home",
          "comparison_def_away",
          "comparison_poisson_distribution_home",
          "comparison_poisson_distribution_away",
          "comparison_h2h_home",
          "comparison_h2h_away",
        ],
      }
    );
  }

  async getSeasons(competitionId: number): Promise<any[]> {
    return Match.findAll({
      attributes: ["season"],
      group: ["season"],
      where: {
        competition_id: competitionId,
        date_unix: {
          [Op.gt]: dayjs().subtract(14, "day").unix(), // Greater than 14 days ago
          [Op.lt]: dayjs().add(14, "day").unix(), // Less than 14 days from now
        },
      },
    });
  }

  async getMatchesForJson(date: string, competitionId: number): Promise<any[]> {
    if (!date || !competitionId) {
      return [];
    }
    return Match.findAll({
      where: {
        competition_id: competitionId,
        date_unix: {
          [Op.gt]: dayjs().subtract(15, "day").unix(), // Greater than 14 days ago
          [Op.lte]: dayjs().add(14, "day").unix(), // Less than 14 days from now
        },
      },
      include: [
        {
          model: LeagueTeam,
          attributes: ["id", "name", "image"],
          as: "home", // Assuming you have an alias for home team
          required: false, // Use true if you want to enforce the join
          where: {
            id: {
              [Op.eq]: sequelize.col("Match.home_team_id"),
            },
          },
        },
        {
          model: LeagueTeam,
          attributes: ["id", "name", "image"],
          as: "away", // Assuming you have an alias for away team
          required: false, // Use true if you want to enforce the join
          where: {
            id: {
              [Op.eq]: sequelize.col("Match.away_team_id"),
            },
          },
        },
        {
          model: MatchStats,
          attributes: ["home_goals", "away_goals"],
          as: "stats",
        },
        {
          model: MatchOdds,
          attributes: ["odds_ft_1", "odds_ft_x", "odds_ft_2"],
          as: "odds",
        },
      ],
      order: [["date_unix", "DESC"]],
    });
  }

  async getPredictionsByTeams(
    homeTeam: string,
    awayTeam: string,
    leagueId: number
  ): Promise<any[]> {
    return Prediction.findAll({
      attributes: [
        "fixture_id",
        "predictions_percent_home",
        "predictions_percent_draw",
        "predictions_percent_away",
        "league_id",
        "league_name",
        "league_country",
        "league_logo",
        "league_flag",
        "league_season",
        ["home_team_name", "teams_home_name"],
        ["away_team_name", "teams_away_name"],
        ["home_last_5_form", "teams_home_last_5_form"],
        ["away_last_5_form", "teams_away_last_5_form"],
        ["home_last_5_att", "teams_home_last_5_att"],
        ["away_last_5_att", "teams_away_last_5_att"],
        ["home_last_5_def", "teams_home_last_5_def"],
        ["away_last_5_def", "teams_away_last_5_def"],
        ["home_goals_for_total", "teams_home_goals_for_total"],
        ["home_goals_for_average", "teams_home_goals_for_average"],
        ["away_goals_for_total", "teams_away_goals_for_total"],
        ["away_goals_for_average", "teams_away_goals_for_average"],
      ],
      where: {
        league_id: leagueId,
        fixture_id: {
          [Op.eq]: sequelize.literal(
            `(SELECT max(fixture_id) FROM fixtures WHERE home_team_name = '${homeTeam}' AND away_team_name = '${awayTeam}')`
          ),
        },
      },
    });
  }

  async getTeams(competitionId: number): Promise<any[]> {
    try {
      return LeagueTeam.findAll({
        attributes: ["id", "name", "table_position"],
        where: {
          competition_id: competitionId,
        },
        order: [["name", "DESC"]],
      });
    } catch (error) {
      console.error("Error getting teams:", error);
      return [];
    }
  }
}
