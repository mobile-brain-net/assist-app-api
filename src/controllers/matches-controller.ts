import { Request, Response, NextFunction } from "express";
import { MatchesService } from "../services/matches-service";
import { validateQueryParams } from "../utils/validate-params";

export async function getMatches(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const queryParams = validateQueryParams(req.query);
    const matchesService = new MatchesService();
    const matches = await matchesService.getMatches(queryParams);
    res.json(matches);
  } catch (err) {
    next(err);
  }
}
