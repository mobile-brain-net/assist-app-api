"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("match_stats", {
      match_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "matches",
          key: "id",
        },
      },
      home_goals: Sequelize.INTEGER,
      away_goals: Sequelize.INTEGER,
      home_corners: Sequelize.INTEGER,
      away_corners: Sequelize.INTEGER,
      home_shots_on_target: Sequelize.INTEGER,
      away_shots_on_target: Sequelize.INTEGER,
      home_possession: Sequelize.INTEGER,
      away_possession: Sequelize.INTEGER,
      home_xg: Sequelize.FLOAT,
      away_xg: Sequelize.FLOAT,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("match_stats");
  },
};
