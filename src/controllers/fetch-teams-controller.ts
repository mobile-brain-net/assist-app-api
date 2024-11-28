import { Request, Response, NextFunction } from "express";
import { DatabaseService } from "../database/database-service";
import { TeamsService } from "../services/teams-service";

/**
 * Fetches league teams from the API and saves them to the database
 * @param req
 * @param res
 * @param next
 */
export async function fetchLeagueTeams(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teamsService = new TeamsService();
    const fetchedData = await teamsService.fetchLeagueTeams();
    const dbService = new DatabaseService();
    const saved = await dbService.saveLeagueTeams(fetchedData);
    res.json({
      message: "League teams fetched successfully",
      teams: fetchedData,
      count: fetchedData.length,
      saved,
      success: true,
      status: 200,
    });
  } catch (err) {
    next(err);
  }
}
