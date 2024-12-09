import { Router } from "express";
import {
  getMatches,
  fetchMatchData,
  getMatchesForJson,
  getAggregateMatches,
} from "../controllers/matches-controller";

const router = Router();

router.get("/matches", getMatches);
router.post("/fetch-matches", fetchMatchData);
router.get("/get-matches", getMatchesForJson);
router.get("/aggregate-matches", getAggregateMatches);

export const matchesRouter = router;
