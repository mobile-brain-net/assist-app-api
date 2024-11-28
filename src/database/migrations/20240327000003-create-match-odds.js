"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("match_odds", {
      match_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "matches",
          key: "id",
        },
      },
      odds_ft_1: Sequelize.FLOAT,
      odds_ft_x: Sequelize.FLOAT,
      odds_ft_2: Sequelize.FLOAT,
      odds_btts_yes: Sequelize.FLOAT,
      odds_btts_no: Sequelize.FLOAT,
      odds_over25: Sequelize.FLOAT,
      odds_under25: Sequelize.FLOAT,
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
    await queryInterface.dropTable("match_odds");
  },
};
