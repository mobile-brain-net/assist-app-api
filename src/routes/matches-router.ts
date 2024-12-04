import { Router } from "express";
import {
  getMatches,
  fetchMatchData,
  getMatchesForJson,
} from "../controllers/matches-controller";

const router = Router();

router.get("/matches", getMatches);
router.post("/fetch-matches", fetchMatchData);
router.get("/get-matches",  getMatchesForJson)

export const matchesRouter = router;
