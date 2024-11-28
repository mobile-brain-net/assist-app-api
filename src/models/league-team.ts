import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

export class LeagueTeam extends Model {
  public id!: number;
  public name!: string;
  public clean_name?: string;
  public english_name?: string;
  public country?: string;
  public founded?: string;
  public image?: string;
  public season?: string;
  public season_clean?: string;
  public url?: string;
  public table_position?: number;
  public performance_rank?: number;
  public risk?: number;
  public season_format?: string;
  public competition_id?: number;
  public full_name?: string;
  public alt_names?: string[];
  public official_sites?: string[];
}

LeagueTeam.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clean_name: DataTypes.STRING,
    english_name: DataTypes.STRING,

    country: DataTypes.STRING,
    founded: DataTypes.STRING,
    image: DataTypes.STRING,
    season: DataTypes.STRING,
    season_clean: DataTypes.STRING,
    url: DataTypes.STRING,
    table_position: DataTypes.INTEGER,
    performance_rank: DataTypes.INTEGER,
    risk: DataTypes.INTEGER,
    season_format: DataTypes.STRING,
    competition_id: DataTypes.INTEGER,
    full_name: DataTypes.STRING,
    alt_names: DataTypes.JSON,
    official_sites: DataTypes.JSON,
  },
  {
    sequelize,
    tableName: "league_teams",
    underscored: true,
  }
);

export default LeagueTeam;
