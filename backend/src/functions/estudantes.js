// Rota de teste específica para estudantes
export async function testScrapeEstudantes(req, res) {
  try {
    console.log("🧪 TESTE DIRETO - SCRAPE ESTUDANTES");
    
    const { processarScrapeLinhasEstudantes } = await import("../services/compararbanco.service.js");
    
    const resultado = await processarScrapeLinhasEstudantes();
    
    return res.json({
      success: true,
      message: "Teste concluído",
      data: resultado,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ ERRO NO TESTE:", error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}