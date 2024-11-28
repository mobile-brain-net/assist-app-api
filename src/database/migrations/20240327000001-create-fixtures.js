const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("fixtures", {
      fixture_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      referee: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fixture_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      first_period_start: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      second_period_start: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      venue_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      venue_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      venue_city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status_long: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status_short: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status_elapsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      league_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      league_name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      league_round: {
        type: DataTypes.STRING,
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
      home_team_winner: {
        type: DataTypes.BOOLEAN,
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
      away_team_winner: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      home_goals: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      away_goals: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      halftime_score_home: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      halftime_score_away: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fulltime_score_home: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fulltime_score_away: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      extratime_score_home: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      extratime_score_away: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      penalty_score_home: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      penalty_score_away: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
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

    // Add useful indexes
    await queryInterface.addIndex("fixtures", ["fixture_id"]);
    await queryInterface.addIndex("fixtures", ["league_id"]);
    await queryInterface.addIndex("fixtures", ["home_team_id"]);
    await queryInterface.addIndex("fixtures", ["away_team_id"]);
    await queryInterface.addIndex("fixtures", ["fixture_date"]);
    await queryInterface.addIndex("fixtures", ["status_short"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("fixtures");
  },
};
