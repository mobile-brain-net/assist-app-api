import { Router } from "express";
import { fetchLeagueTeams } from "../controllers/fetch-teams-controller";
const router = Router();

router.get("/fetch-league-teams", fetchLeagueTeams);

export const teamsRouter = router;
