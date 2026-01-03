import { scrapeEmitter } from "../utils/scrapeEmitter.js";

export function scrapeStatus(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  scrapeEmitter.on("status", send);

  req.on("close", () => {
    scrapeEmitter.off("status", send);
  });
}
