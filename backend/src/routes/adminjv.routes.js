import { Router } from "express"
import { runScrape } from "../controllers/scrapeController.js"

const router = Router()

router.post("/scrape/run", (req, res) => {
  res.json({ ok: true })
})

export default router
