import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

export class Match extends Model {
  public id!: number;
  public homeTeamId!: number;
  public awayTeamId!: number;
  public season!: string;
  public status!: string;
  public date_unix!: number;
  public competition_id!: number;
  public stadium_name?: string;
  public attendance?: number;
  public referee_id?: number;
}

Match.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    homeTeamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "home_team_id",
    },
    awayTeamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "away_team_id",
    },
    season: DataTypes.STRING,
    status: DataTypes.STRING,
    date_unix: DataTypes.INTEGER,
    competition_id: DataTypes.INTEGER,
    stadium_name: DataTypes.STRING,
    attendance: DataTypes.INTEGER,
    referee_id: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: "matches",
    underscored: true,
  }
);

export default Match;
