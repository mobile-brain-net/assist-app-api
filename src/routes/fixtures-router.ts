import { Router } from "express";
import {
  fetchFixtureData,
  fetchFixtures,
} from "../controllers/fixtures-controller";

const router = Router();

router.post("/fetch-fixtures", fetchFixtureData);

export const fixturesRouter = router;
