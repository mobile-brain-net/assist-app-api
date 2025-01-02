import { Request, Response, NextFunction } from "express";
import { FixturesService } from "../services/fixtures-service";

export async function fetchFixtures(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const fixturesService = new FixturesService();
    const fetchedData = await fixturesService.fetchAndSaveFixtures();
    res.json(fetchedData);
  } catch (err) {
    next(err);
  }
}

export async function fetchFixtureData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const fixturesService = new FixturesService();
    const fetchedData = await fixturesService.fetchAndSaveFixtures();

    res.json({
      message: "Fixtures data fetched and saved successfully",
      data: fetchedData,
      status: 200,
      success: true,
      matches: fetchedData.length,
    });
  } catch (err) {
    next(err);
  }
}
