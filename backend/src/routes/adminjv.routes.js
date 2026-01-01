import { Router } from "express"
import { runScrape } from "../controllers/scrape.controller.js"

const router = Router()

router.post("/scrape/run", (req, res) => {
  return runScrape(req, res)
})

export default router
