"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("predictions", {
      fixture_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      predictions_winner_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      predictions_winner_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      predictions_winner_comment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      predictions_win_or_draw: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      predictions_under_over: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      predictions_goals_home: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      predictions_goals_away: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      predictions_advice: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      predictions_percent_home: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      predictions_percent_draw: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      predictions_percent_away: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      league_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      league_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      league_country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      league_logo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      league_flag: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      league_season: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      home_team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      home_team_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      home_team_logo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      home_last_5_form: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      home_last_5_att: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      home_last_5_def: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      home_goals_for_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      home_goals_against_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      away_team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      away_team_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      away_team_logo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      away_last_5_form: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      away_last_5_att: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      away_last_5_def: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      away_goals_for_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      away_goals_against_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      comparison_form_home: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_form_away: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_att_home: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_att_away: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_def_home: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_def_away: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_poisson_distribution_home: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_poisson_distribution_away: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_h2h_home: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comparison_h2h_away: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("predictions");
  },
};
