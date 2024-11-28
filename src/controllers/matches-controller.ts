import { Request, Response, NextFunction } from "express";
import { MatchesService } from "../services/matches-service";

export async function getMatches(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const matchesService = new MatchesService();
    const matches = await matchesService.getMatches(req.query);
    res.json(matches);
  } catch (err) {
    next(err);
  }
}

export async function fetchMatchData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const matchesService = new MatchesService();
    const fetchedData = await matchesService.fetchAndSaveMatches();
    res.json({
      message: "Match data fetched and saved successfully",
      matches: fetchedData.length,
    });
  } catch (err) {
    next(err);
  }
}
