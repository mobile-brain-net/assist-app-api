import { Request, Response, NextFunction } from "express";
import { MatchesService } from "../services/matches-service";
import { StatsSection } from "../types/stats";

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
      status: 200,
      success: true,
      matches: fetchedData.length,
      data: fetchedData,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMatchesForJson(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date, league_name } = req.query;

    if (typeof date !== "string" || typeof league_name !== "string") {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    const matchesService = new MatchesService();
    const matches = await matchesService.getMatchesForJson({
      date,
      league_name,
    });
    res.status(200).json(matches);
  } catch (err) {
    next(err);
  }
}

export async function getAggregateMatches(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { year, league_name } = req.query;

    if (typeof year !== "string" || typeof league_name !== "string") {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }
    const matchesService = new MatchesService();
    const matches = await matchesService.aggregateMatches({
      year,
      league_name,
    });
    res.json(matches);
  } catch (err) {
    next(err);
  }
}
