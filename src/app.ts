import express from "express";
import dotenv from "dotenv";
import { teamsRouter } from "./routes/teams-router";
import { errorHandler } from "./middleware/error-handler";
import { initDatabase } from "./database/sequelize";
import { matchesRouter } from "./routes/matches-router";
import { fixturesRouter } from "./routes/fixtures-router";
import { predictionsRouter } from "./routes/predictions-router";
import "./models"; // This ensures associations are initialized

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/api", teamsRouter);
app.use("/api", matchesRouter);
app.use("/api", fixturesRouter);
app.use("/api", predictionsRouter);
// Error handling
app.use(errorHandler);

// Initialize DB before starting server
initDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

export default app;
