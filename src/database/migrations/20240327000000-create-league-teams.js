const { DataTypes, QueryInterface } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("league_teams", {
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex("league_teams", ["competition_id"]);
    await queryInterface.addIndex("league_teams", ["country"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("league_teams");
  },
};
