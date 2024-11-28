"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("matches", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      home_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "league_teams",
          key: "id",
        },
      },
      away_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "league_teams",
          key: "id",
        },
      },
      season: Sequelize.STRING,
      status: Sequelize.STRING,
      date_unix: Sequelize.INTEGER,
      competition_id: Sequelize.INTEGER,
      stadium_name: Sequelize.STRING,
      attendance: Sequelize.INTEGER,
      referee_id: Sequelize.INTEGER,
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("matches", ["competition_id"]);
    await queryInterface.addIndex("matches", ["date_unix"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("matches");
  },
};
