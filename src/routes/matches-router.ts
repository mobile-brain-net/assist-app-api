import { Router } from "express";
import { getMatches, fetchMatchData } from "../controllers/matches-controller";

const router = Router();

router.get("/matches", getMatches);
router.post("/fetch-matches", fetchMatchData);

export const matchesRouter = router;
