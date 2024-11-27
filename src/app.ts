import express from "express";
import dotenv from "dotenv";
import { matchesRouter } from "./routes/matches-router";
import { errorHandler } from "./middleware/error-handler";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/api", matchesRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
