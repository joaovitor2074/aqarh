import { Router } from "express";
import { runScrape } from "../controllers/scrape.controller.js";
import { scrapeStatus } from "../controllers/scrapeStatus.controller.js";

const router = Router();

router.post("/scrape/run", runScrape);
router.get("/scrape/status", scrapeStatus);

export default router;
