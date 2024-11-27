import { Router } from "express";
import { getMatches } from "../controllers/matches-controller";
import { fetchMatchData } from "../controllers/fetch-matches-controller";
const router = Router();

router.get("/get-matches", getMatches);
router.post("/fetch-match-data", fetchMatchData);

export const matchesRouter = router;
