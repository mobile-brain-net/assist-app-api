import { Request, Response, NextFunction } from "express";
import { DatabaseService } from "../database/database-service";
import { TeamsService } from "../services/teams-service";
import { PredictionsService } from "../services/predictions-service";

/**
 * Fetches league teams from the API and saves them to the database
 * @param req
 * @param res
 * @param next
 */
export async function fetchPredictions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const predictionsService = new PredictionsService();
    const fetchedData = await predictionsService.fetchPredictions();

    if (fetchedData.length === 0) {
      res.json({
        message: "No new predictions found",
        success: true,
        status: 200,
      });
      return;
    }
    const dbService = new DatabaseService();
    await dbService.savePredictions(fetchedData);

    res.json({
      message: "Predictions fetched successfully",
      count: fetchedData.length,
      data: fetchedData,
      success: true,
      status: 200,
    });
  } catch (err) {
    next(err);
  }
}
