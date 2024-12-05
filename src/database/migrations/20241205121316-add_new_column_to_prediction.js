"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("predictions", "home_goals_for_average", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("predictions", "away_goals_for_average", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("predictions", "home_goals_for_average");
    await queryInterface.removeColumn("predictions", "away_goals_for_average");
  },
};
