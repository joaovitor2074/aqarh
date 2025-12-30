const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

const URL = "http://dgp.cnpq.br/dgp/espelhogrupo/6038878475345897";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log("========================================");
    console.log("Iniciando scraping de estudantes egressos");
    console.log("========================================");

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: CHROME_PATH,
        defaultViewport: null,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    console.log("Navegador iniciado");

    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );
    function escapeCssId(id) {
        return id.replace(/[:.#\[\],=]/g, match => `\\${match}`);
    }
    const ESCAPED = `#${escapeCssId('idFormVisualizarGrupoPesquisa:j_idt354_data')}`;


    console.log("Acessando página do grupo...");
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
    console.log("Página carregada com sucesso");

    // id que contém ':' precisa ser escapado para uso em querySelector
    const ESCAPED_TBODY = "#idFormVisualizarGrupoPesquisa\\:j_idt354_data";
    const ROW_SELECTOR = `${ESCAPED_TBODY} > tr`;

    console.log("Aguardando tbody da tabela...");
    await page.waitForSelector(ESCAPED_TBODY, { timeout: 30000 });
    console.log("Tbody encontrado");

    const totalRows = await page.$$eval(ROW_SELECTOR, els => els.length);
    console.log(`Total de estudantes encontrados: ${totalRows}`);

    const resultados = [];

    for (let i = 0; i < totalRows; i++) {
        const rowNth = `${ROW_SELECTOR}:nth-of-type(${i + 1})`;

        try {
            // Extrai as colunas desejadas (ajuste os td:nth-child se necessário)
            const nome = await page.$eval(
                `${rowNth} td:nth-child(1)`,
                td => td.innerText.trim()
            );

            const titulacao_MAX = await page.$eval(
                `${rowNth} td:nth-child(2)`,
                td => td.innerText.trim()
            );

            const data_inclusao = await page.$eval(
                `${rowNth} td:nth-child(3)`,
                td => td.innerText.trim()
            );

            resultados.push({
                nome,
                titulacao_MAX,
                data_inclusao
            });

            console.log(`OK - ${nome}`);

        } catch (err) {
            // Em caso de célula ausente ou selector inválido para aquela linha
            console.error(`Erro linha ${i + 1}: ${err.message}`);
        }
    }

    console.log("----------------------------------------");
    console.log("Salvando arquivo JSON...");

    const outFile = "resultado_final_estudantes_egresos.json";
    fs.writeFileSync(outFile, JSON.stringify(resultados, null, 2), "utf-8");

    console.log(`Arquivo salvo: ${outFile}`);
    console.log("Scraping finalizado com sucesso");

    await browser.close();
})();
