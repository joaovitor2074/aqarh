// test-compararbanco.js
import { processarScrapeLinhasEstudantes } from "/dev/aqarh/backend/src/services/compararbanco.service.js";

async function testeCompararbanco() {
  console.log("🧪 TESTE - compararbanco.service.js");
  console.log("==================================\n");
  
  try {
    console.log("Chamando processarScrapeLinhasEstudantes()...");
    const resultado = await processarScrapeLinhasEstudantes();
    
    console.log("\n✅ FUNÇÃO EXECUTADA COM SUCESSO!");
    console.log("Resultado:", JSON.stringify(resultado, null, 2));
    
  } catch (error) {
    console.error("\n💥 ERRO NA FUNÇÃO:", error.message);
    console.error("Stack:", error.stack);
    
    // Verifica se é erro de importação
    if (error.message.includes("Cannot find module") || error.message.includes("import")) {
      console.error("\n🔍 PROBLEMA DE IMPORTAÇÃO DETECTADO!");
      console.error("Verifique se o arquivo 'scrapelinhasestudantes.service.js' existe no diretório correto.");
    }
  }
}

testeCompararbanco();