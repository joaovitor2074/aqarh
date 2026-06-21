export const LINHA_IMAGES = [
  "/img/linhas/acessibilidade.jpg",
  "/img/linhas/agricultura-familiar.jpg",
  "/img/linhas/agricultura-irrigada.jpg",
  "/img/linhas/agricultura.jpg",
  "/img/linhas/agroindustria.jpg",
  "/img/linhas/alimentos.jpg",
  "/img/linhas/automacao.jpg",
  "/img/linhas/biologia-celular.jpeg",
  "/img/linhas/cerrado.jpg",
  "/img/linhas/diversidade-sociedade.jpg",
  "/img/linhas/educacao-saude.jpg",
  "/img/linhas/educacao.jpg",
  "/img/linhas/eletroquimica.jpg",
  "/img/linhas/fisica-ciencias.jpg",
  "/img/linhas/formacao-professores.jpg",
  "/img/linhas/fungos-micologia.jpeg",
  "/img/linhas/geografia-geociencias.jpg",
  "/img/linhas/inteligencia-artificial.jpg",
  "/img/linhas/iot-sensores.jpg",
  "/img/linhas/leitura-letramento.jpg",
  "/img/linhas/linguagens-cultura.jpg",
  "/img/linhas/matematica.jpg",
  "/img/linhas/medicina-clinica.jpeg",
  "/img/linhas/meio-ambiente.jpg",
  "/img/linhas/microbiologia.jpg",
  "/img/linhas/nanotecnologia.jpg",
  "/img/linhas/oleos-essenciais.jpg",
  "/img/linhas/polimeros-materiais.jpg",
  "/img/linhas/producao-animal.jpg",
  "/img/linhas/produtos-naturais.jpg",
  "/img/linhas/quimica-ambiental.jpg",
  "/img/linhas/quimica-laboratorio.jpg",
  "/img/linhas/recursos-hidricos.jpg",
  "/img/linhas/robotica.jpg",
  "/img/linhas/saude-publica.jpg",
  "/img/linhas/seguranca-informacao.jpg",
  "/img/linhas/sementes-agroecologia.jpg",
  "/img/linhas/software.jpg",
  "/img/linhas/solo.jpg",
  "/img/linhas/veterinaria.jpg",
];

const IMAGE_BY_KEYWORD = [
  { image: "/img/linhas/acessibilidade.jpg", priority: 35, keywords: ["acessibilidade", "assistiva", "tecnologia assistiva", "inclusao", "deficiencia"] },
  { image: "/img/linhas/leitura-letramento.jpg", priority: 34, keywords: ["leitura", "letramento", "letramentos", "alfabetizacao", "formacao de leitores"] },
  { image: "/img/linhas/linguagens-cultura.jpg", priority: 33, keywords: ["discurso", "linguistica", "lingua portuguesa", "linguagens", "linguagem", "literatura", "texto", "interculturalidade", "identidade", "praticas discursivas", "artes", "teatrais", "musicais", "cultura"] },
  { image: "/img/linhas/diversidade-sociedade.jpg", priority: 32, keywords: ["diversidade", "sociedade", "social", "genero", "etnico", "etnica", "raca", "cidadania", "trabalho", "educacao do campo"] },
  { image: "/img/linhas/formacao-professores.jpg", priority: 31, keywords: ["formacao docente", "formacao de professores", "professor", "professores", "docencia", "docente", "curriculo"] },
  { image: "/img/linhas/educacao-saude.jpg", priority: 30, keywords: ["educacao em saude", "saude politica educacao", "saude e educacao"] },
  { image: "/img/linhas/educacao.jpg", priority: 18, keywords: ["educacao", "ensino", "aprendizagem", "metodologia", "pratica da docencia", "educacional"] },
  { image: "/img/linhas/saude-publica.jpg", priority: 26, keywords: ["saude publica", "saude coletiva", "controle de insetos", "vetores", "epidemiologia"] },
  { image: "/img/linhas/medicina-clinica.jpeg", priority: 25, keywords: ["medicina", "clinica", "psicoterapia", "psicoterapias", "existencial", "humanista", "fisiopatologia"] },
  { image: "/img/linhas/robotica.jpg", priority: 31, keywords: ["robotica", "robo", "robos", "controle e robotica"] },
  { image: "/img/linhas/iot-sensores.jpg", priority: 30, keywords: ["iot", "internet das coisas", "sensores", "sensor", "monitoramento continuo"] },
  { image: "/img/linhas/inteligencia-artificial.jpg", priority: 29, keywords: ["inteligencia artificial", "sistemas inteligentes", "algoritmos inteligentes", "algoritmo inteligente", "machine learning", "aprendizado de maquina"] },
  { image: "/img/linhas/software.jpg", priority: 25, keywords: ["software", "arquitetura de software", "sistema", "sistemas distribuidos", "computacao", "programacao", "dados", "computacionais"] },
  { image: "/img/linhas/seguranca-informacao.jpg", priority: 29, keywords: ["seguranca da informacao", "ciberseguranca", "seguranca", "informacao"] },
  { image: "/img/linhas/automacao.jpg", priority: 24, keywords: ["automacao", "controle", "instrumentacao"] },
  { image: "/img/linhas/agricultura-irrigada.jpg", priority: 31, keywords: ["agricultura irrigada", "irrigada", "irrigacao", "cultivos irrigados", "manejo hidrico"] },
  { image: "/img/linhas/agricultura-familiar.jpg", priority: 30, keywords: ["agricultura familiar", "agrofloresta", "agroflorestal", "produtor", "produtores", "familia"] },
  { image: "/img/linhas/sementes-agroecologia.jpg", priority: 29, keywords: ["semente", "sementes", "agroecologia", "agroecologico"] },
  { image: "/img/linhas/agroindustria.jpg", priority: 28, keywords: ["agroindustria", "agroindustrial", "processamento de alimentos", "processamento", "agronegocio", "cadeias produtivas"] },
  { image: "/img/linhas/agricultura.jpg", priority: 23, keywords: ["agronomia", "agricultura", "fitotecnia", "olericultura", "cultivo", "plantio", "ciencias agrarias"] },
  { image: "/img/linhas/solo.jpg", priority: 28, keywords: ["solo", "solos", "fertilidade", "modelagem de agua no solo", "engenharia de agua e solo", "substrato"] },
  { image: "/img/linhas/producao-animal.jpg", priority: 29, keywords: ["producao animal", "animal", "animais", "zootecnia", "pecuaria", "sanidade animal"] },
  { image: "/img/linhas/veterinaria.jpg", priority: 29, keywords: ["veterinaria", "saude animal", "sanitario de animais", "controle sanitario"] },
  { image: "/img/linhas/alimentos.jpg", priority: 27, keywords: ["alimento", "alimentos", "alimentar", "nutric", "fruta", "frutas", "sensorial", "tecnologia de alimentos"] },
  { image: "/img/linhas/recursos-hidricos.jpg", priority: 27, keywords: ["recursos hidricos", "hidrologia", "hidrico", "hidrica", "bacia", "bacias", "rio", "rios", "poco", "agua"] },
  { image: "/img/linhas/geografia-geociencias.jpg", priority: 28, keywords: ["geografia", "geociencias", "geoprocessamento", "territorio", "cartografia"] },
  { image: "/img/linhas/meio-ambiente.jpg", priority: 22, keywords: ["meio ambiente", "ambiental", "sustentabilidade", "conservacao", "ecossistemas", "ecologia"] },
  { image: "/img/linhas/cerrado.jpg", priority: 25, keywords: ["cerrado", "bioma", "biodiversidade"] },
  { image: "/img/linhas/quimica-ambiental.jpg", priority: 30, keywords: ["quimica ambiental", "contaminante", "contaminantes", "poluicao", "fotocatalise"] },
  { image: "/img/linhas/eletroquimica.jpg", priority: 31, keywords: ["eletroquimica", "eletrodo", "eletrodos", "corrosao"] },
  { image: "/img/linhas/quimica-laboratorio.jpg", priority: 22, keywords: ["quimica", "laboratorio", "analitica", "quimiometrico", "quimiometricos", "metodos analiticos", "sintese"] },
  { image: "/img/linhas/produtos-naturais.jpg", priority: 30, keywords: ["produto natural", "produtos naturais", "planta medicinal", "plantas medicinais", "bioativo", "metabolitos secundarios", "extratos vegetais", "farmacologia"] },
  { image: "/img/linhas/oleos-essenciais.jpg", priority: 31, keywords: ["oleo essencial", "oleos essenciais", "oleo", "oleos", "essencial", "aroma"] },
  { image: "/img/linhas/biologia-celular.jpeg", priority: 27, keywords: ["biologia celular", "biologia molecular", "biologia", "celular", "celula", "biotecnologia", "fenomenos biologicos"] },
  { image: "/img/linhas/microbiologia.jpg", priority: 29, keywords: ["microbiologia", "microbiana", "microbiologico", "bacteria", "microorganismo", "micro-organismos"] },
  { image: "/img/linhas/fungos-micologia.jpeg", priority: 31, keywords: ["fungo", "fungos", "micologia", "taxonomia de fungos"] },
  { image: "/img/linhas/nanotecnologia.jpg", priority: 31, keywords: ["nanotecnologia", "nanoparticula", "nanoparticulas", "nano"] },
  { image: "/img/linhas/polimeros-materiais.jpg", priority: 30, keywords: ["polimero", "polimeros", "materiais", "material", "polissacarideos", "biodiesel"] },
  { image: "/img/linhas/matematica.jpg", priority: 30, keywords: ["matematica", "estatistica", "modelagem matematica", "modelagem computacional", "computacional", "ciencias exatas"] },
  { image: "/img/linhas/fisica-ciencias.jpg", priority: 28, keywords: ["fisica", "fenomenos fisicos", "ensino de ciencias", "ciencias da natureza"] },
];

export const DEFAULT_LINHA_IMAGE = "/img/linhas/quimica-laboratorio.jpg";

export function normalizeLinhaText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hashText(value) {
  return normalizeLinhaText(value)
    .split("")
    .reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function stringifyInput(input) {
  if (Array.isArray(input)) {
    return input.filter(Boolean).join(" ");
  }

  if (input && typeof input === "object") {
    return [
      input.nome,
      input.title,
      input.titulo,
      input.grupo,
      input.category,
      input.categoria,
      ...(Array.isArray(input.tags) ? input.tags : []),
      ...(Array.isArray(input.keywords) ? input.keywords : []),
    ]
      .filter(Boolean)
      .join(" ");
  }

  return input || "";
}

export function getLinhaImage(input, index = 0) {
  const text = normalizeLinhaText(stringifyInput(input));
  const match = IMAGE_BY_KEYWORD.map((entry, position) => {
    const score = entry.keywords.reduce((total, keyword) => {
      const normalizedKeyword = normalizeLinhaText(keyword);

      if (!normalizedKeyword || !text.includes(normalizedKeyword)) {
        return total;
      }

      const phraseBonus = normalizedKeyword.includes(" ") ? 18 : 0;
      return total + normalizedKeyword.length + phraseBonus + (entry.priority || 0);
    }, 0);

    return { ...entry, position, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.priority - a.priority || a.position - b.position)[0];

  if (match) {
    return match.image;
  }

  const fallbackIndex = Math.abs(hashText(text) + Number(index || 0)) % LINHA_IMAGES.length;
  return LINHA_IMAGES[fallbackIndex] || DEFAULT_LINHA_IMAGE;
}
