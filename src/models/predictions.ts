import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

export class Prediction extends Model {
  public fixture_id!: number;
  public predictions_winner_id!: number;
  public predictions_winner_name!: string;
  public predictions_winner_comment!: string | null;
  public predictions_win_or_draw!: boolean;
  public predictions_under_over!: string | null;
  public predictions_goals_home!: string | null;
  public predictions_goals_away!: string | null;
  public predictions_advice!: string | null;
  public predictions_percent_home!: string;
  public predictions_percent_draw!: string;
  public predictions_percent_away!: string;
  public league_id!: number;
  public league_name!: string;
  public league_country!: string;
  public league_logo!: string;
  public league_flag!: string;
  public league_season!: number;

  public home_team_id!: number;
  public home_team_name!: string;
  public home_team_logo!: string;
  public home_last_5_form!: string;
  public home_last_5_att!: string;
  public home_last_5_def!: string;
  public home_goals_for_total!: number;
  public home_goals_against_total!: number;

  public away_team_id!: number;
  public away_team_name!: string;
  public away_team_logo!: string;
  public away_last_5_form!: string;
  public away_last_5_att!: string;
  public away_last_5_def!: string;
  public away_goals_for_total!: number;
  public away_goals_against_total!: number;

  public comparison_form_home!: string;
  public comparison_form_away!: string;
  public comparison_att_home!: string;
  public comparison_att_away!: string;
  public comparison_def_home!: string;
  public comparison_def_away!: string;
  public comparison_poisson_distribution_home!: string;
  public comparison_poisson_distribution_away!: string;
  public comparison_h2h_home!: string;
  public comparison_h2h_away!: string;
}

Prediction.init(
  {
    fixture_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    predictions_winner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    predictions_winner_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predictions_winner_comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predictions_win_or_draw: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    predictions_under_over: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predictions_goals_home: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predictions_goals_away: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predictions_advice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predictions_percent_home: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predictions_percent_draw: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predictions_percent_away: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    league_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    league_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    league_country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    league_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    league_flag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    league_season: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    home_team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    home_team_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    home_team_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    home_last_5_form: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    home_last_5_att: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    home_last_5_def: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    home_goals_for_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    home_goals_against_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    away_team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    away_team_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    away_team_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    away_last_5_form: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    away_last_5_att: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    away_last_5_def: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    away_goals_for_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    away_goals_against_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    comparison_form_home: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_form_away: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_att_home: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_att_away: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_def_home: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_def_away: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_poisson_distribution_home: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_poisson_distribution_away: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_h2h_home: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comparison_h2h_away: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "predictions", // Specify the table name
    underscored: true, // Use snake_case for column names
  }
);

export default Prediction;
