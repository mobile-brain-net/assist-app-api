import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

export class Fixture extends Model {
  public fixture_id!: number;
  public referee?: string;
  public timezone?: string;
  public fixture_date?: Date;
  public timestamp?: number;
  public first_period_start?: number;
  public second_period_start?: number;
  public venue_id?: number;
  public venue_name?: string;
  public venue_city?: string;
  public status_long!: string;
  public status_short!: string;
  public status_elapsed?: number;
  public league_id!: number;
  public league_name!: string;
  public league_country?: string;
  public league_logo?: string;
  public league_flag?: string;
  public league_season?: number;
  public league_round?: string;
  public home_team_id?: number;
  public home_team_name?: string;
  public home_team_logo?: string;
  public home_team_winner?: boolean;
  public away_team_id?: number;
  public away_team_name?: string;
  public away_team_logo?: string;
  public away_team_winner?: boolean;
  public home_goals?: number;
  public away_goals?: number;
  public halftime_score_home?: number;
  public halftime_score_away?: number;
  public fulltime_score_home?: number;
  public fulltime_score_away?: number;
  public extratime_score_home?: number;
  public extratime_score_away?: number;
  public penalty_score_home?: number;
  public penalty_score_away?: number;
}

Fixture.init(
  {
    fixture_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    referee: DataTypes.STRING,
    timezone: DataTypes.STRING,
    fixture_date: DataTypes.DATE,
    timestamp: DataTypes.NUMBER,
    first_period_start: DataTypes.NUMBER,
    second_period_start: DataTypes.NUMBER,
    venue_id: DataTypes.INTEGER,
    venue_name: DataTypes.STRING,
    venue_city: DataTypes.STRING,
    status_long: DataTypes.STRING,
    status_short: DataTypes.STRING,
    status_elapsed: DataTypes.INTEGER,
    league_id: DataTypes.INTEGER,
    league_name: DataTypes.STRING,
    league_country: DataTypes.STRING,
    league_logo: DataTypes.STRING,
    league_flag: DataTypes.STRING,
    league_season: DataTypes.INTEGER,
    league_round: DataTypes.STRING,
    home_team_id: DataTypes.INTEGER,
    home_team_name: DataTypes.STRING,
    home_team_logo: DataTypes.STRING,
    home_team_winner: DataTypes.BOOLEAN,
    away_team_id: DataTypes.INTEGER,
    away_team_name: DataTypes.STRING,
    away_team_logo: DataTypes.STRING,
    away_team_winner: DataTypes.BOOLEAN,
    home_goals: DataTypes.INTEGER,
    away_goals: DataTypes.INTEGER,
    halftime_score_home: DataTypes.INTEGER,
    halftime_score_away: DataTypes.INTEGER,
    fulltime_score_home: DataTypes.INTEGER,
    fulltime_score_away: DataTypes.INTEGER,
    extratime_score_home: DataTypes.INTEGER,
    extratime_score_away: DataTypes.INTEGER,
    penalty_score_home: DataTypes.INTEGER,
    penalty_score_away: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: "fixtures",
    underscored: true,
  }
);

export default Fixture;
