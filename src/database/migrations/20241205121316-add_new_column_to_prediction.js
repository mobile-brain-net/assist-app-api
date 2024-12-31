"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("predictions");

    const columnsToAdd = {
      home_goals_for_average: { type: Sequelize.FLOAT, allowNull: true },
      // ... other columns
    };

    for (const [columnName, config] of Object.entries(columnsToAdd)) {
      if (!table[columnName]) {
        await queryInterface.addColumn("predictions", columnName, config);
      }
    }
  },

  async down(queryInterface) {
    const columns = [
      "home_goals_for_average",
      // ... other columns
    ];

    return Promise.all(
      columns.map((column) =>
        queryInterface.removeColumn("predictions", column)
      )
    );
  },
};
