import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

export class MatchOdds extends Model {
  public match_id!: number;
  public odds_ft_1!: number;
  public odds_ft_x!: number;
  public odds_ft_2!: number;
  public odds_btts_yes!: number;
  public odds_btts_no!: number;
  public odds_over25!: number;
  public odds_under25!: number;
}

MatchOdds.init(
  {
    match_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "matches",
        key: "id",
      },
    },
    odds_ft_1: DataTypes.FLOAT,
    odds_ft_x: DataTypes.FLOAT,
    odds_ft_2: DataTypes.FLOAT,
    odds_btts_yes: DataTypes.FLOAT,
    odds_btts_no: DataTypes.FLOAT,
    odds_over25: DataTypes.FLOAT,
    odds_under25: DataTypes.FLOAT,
  },
  {
    sequelize,
    tableName: "match_odds",
    underscored: true,
  }
);

export default MatchOdds;
