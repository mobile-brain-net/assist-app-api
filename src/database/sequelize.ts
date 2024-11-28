import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST || "127.0.0.1",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "assist_app",
  port: Number(process.env.DB_PORT) || 8889,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export async function initDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Unable to connect to database:", err);
    process.exit(1);
  }
}

export default sequelize;
