const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("match_stats", {
      match_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "matches",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      home_goals: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      away_goals: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      home_corners: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      away_corners: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      home_fouls: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      away_fouls: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      home_dangerous_attacks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      away_dangerous_attacks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      home_shots_on_target: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      away_shots_on_target: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      home_possession: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      away_possession: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      home_xg: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      away_xg: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("match_stats");
  },
};
