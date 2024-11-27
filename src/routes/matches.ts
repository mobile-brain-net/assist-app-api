import { Request, Response } from "express";
import { GetMatchesQueryParams } from "../types/query-params";

export async function getMatches(
  req: Request<{}, {}, {}, GetMatchesQueryParams>,
  res: Response
) {
  const { date, league_name } = req.query;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res
      .status(400)
      .json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  // TODO: Add your DB query logic here
}
