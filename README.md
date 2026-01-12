# 🔬 GIEPI – Gerenciador de Informações de Pesquisa Institucional

O **GIEPI** é um sistema backend desenvolvido para **coletar, organizar, normalizar e gerenciar dados acadêmicos** de pesquisadores, linhas de pesquisa e projetos institucionais, com foco em automação e padronização de informações.

O projeto utiliza **scraping de dados do Lattes**, processamento assíncrono e armazenamento em banco de dados, servindo como base para geração de informações institucionais, comunicados e histórico acadêmico.

---

## 🎯 Objetivo do Projeto

- Automatizar a coleta de dados acadêmicos
- Evitar preenchimento manual repetitivo
- Centralizar informações de pesquisadores e linhas de pesquisa
- Facilitar atualizações institucionais futuras
- Servir como base para sistemas administrativos e sites institucionais

---

## ⚙️ Funcionalidades

- 🔎 Scraping de dados públicos do Lattes
- 📄 Armazenamento de dados brutos em JSON
- 🔄 Normalização dos dados coletados
- 🗃️ Persistência em banco de dados
- 🔗 Relacionamento entre pesquisadores e linhas de pesquisa
- 📡 Acompanhamento do status do scraping (SSE)
- 🛠️ Controle manual de execução via painel administrativo *(em desenvolvimento)*

---

## 🛠️ Tecnologias Utilizadas

- Node.js
- JavaScript / TypeScript
- Puppeteer + Puppeteer Extra (Stealth)
- Express
- MySQL
- SSE (Server-Sent Events)
- JSON

---

## 🧠 Conceitos Aplicados

- Programação assíncrona
- Scraping de dados
- Normalização de dados
- Arquitetura backend
- Relacionamentos em banco de dados
- Organização de projetos Node.js
- Boas práticas de código

---

## 📂 Estrutura do Projeto (resumida)

```txt
backend/
├── data/
├── src/
|   ├── config/
│   ├── controllers/
|   ├── functions/
|   ├── imports
|   ├── jobs
|   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
├── scripts/
├── output/
└── server.js
