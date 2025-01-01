"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("league_teams", "normalized_name", {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "", // Temporary default value for existing rows
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("league_teams", "normalized_name");
  },
};
