import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

export class MatchStats extends Model {
  public match_id!: number;
  public home_goals!: number;
  public away_goals!: number;
  public home_corners!: number;
  public away_corners!: number;
  public home_shots_on_target!: number;
  public away_shots_on_target!: number;
  public home_possession!: number;
  public away_possession!: number;
  public home_xg!: number;
  public away_xg!: number;
}

MatchStats.init(
  {
    match_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "matches",
        key: "id",
      },
    },
    home_goals: DataTypes.INTEGER,
    away_goals: DataTypes.INTEGER,
    home_corners: DataTypes.INTEGER,
    away_corners: DataTypes.INTEGER,
    home_shots_on_target: DataTypes.INTEGER,
    away_shots_on_target: DataTypes.INTEGER,
    home_possession: DataTypes.INTEGER,
    away_possession: DataTypes.INTEGER,
    home_xg: DataTypes.FLOAT,
    away_xg: DataTypes.FLOAT,
  },
  {
    sequelize,
    tableName: "match_stats",
    underscored: true,
  }
);

export default MatchStats;
