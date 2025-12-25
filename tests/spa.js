const axios = require("axios");
const cheerio = require("cheerio");

const URL = "http://dgp.cnpq.br/dgp/espelhorh/0106312928";

async function main() {
    const projetos = await scrapeProjetos();
    console.log(projetos);
}

async function scrapeProjetos() {
    const response = await axios.get(URL);
    const html = response.data;

    const $ = cheerio.load(html);

    const projetos = [];

    $('#formVisualizarRH\\:tblEspelhoRHLPAtuacao_data > tr').each((_, el) => {
        const tds = $(el).find('td');

        if (tds.length >= 2) {
            const linha = $(tds[0]).text().trim();
            const grupo = $(tds[1]).text().trim();

            projetos.push({ linha, grupo });
        }
    });

    console.log(projetos);


    return projetos;
}

main();
