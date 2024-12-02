import { Router } from "express";
import { fetchPredictions } from "../controllers/fetch-predictions-controller";

const router = Router();

router.post("/fetch-predictions", fetchPredictions);

export const predictionsRouter = router;
