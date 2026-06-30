import { scrapeEmitter } from "../utils/scrapeEmitter.js";
import { getScrapeSnapshot } from "./scrape.controller.js";

export function scrapeStatus(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.flushHeaders();

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send({
    etapa: "snapshot",
    status: getScrapeSnapshot().isScraping ? "executando" : "parado",
    mensagem: "Status atual carregado",
    snapshot: getScrapeSnapshot(),
    timestamp: new Date().toISOString(),
  });

  const heartbeat = setInterval(() => {
    send({
      etapa: "heartbeat",
      status: getScrapeSnapshot().isScraping ? "executando" : "parado",
      snapshot: getScrapeSnapshot(),
      timestamp: new Date().toISOString(),
    });
  }, 15000);

  scrapeEmitter.on("status", send);

  req.on("close", () => {
    clearInterval(heartbeat);
    scrapeEmitter.off("status", send);
  });
}
