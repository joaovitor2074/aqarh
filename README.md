# GIEPI — Gestão e Divulgação Científica

Sistema web full stack para centralizar, validar e publicar informações de grupos de pesquisa acadêmica.

O GIEPI transforma dados dispersos da Plataforma Lattes em uma experiência institucional organizada, com site público, painel administrativo e fluxo de aprovação humana.

[Ver aplicação](https://aqarh.vercel.app) · [Painel administrativo](https://aqarh.vercel.app/admin/dashboard) · [Documentação técnica](./docs/ARCHITECTURE.md)

## Problema

Produções, pesquisadores e linhas de pesquisa costumam ficar distribuídos em currículos individuais, dificultando a divulgação pública e a atualização institucional.

## Solução

A plataforma coleta dados acadêmicos, normaliza e compara as informações, gera notificações de mudança e permite que um administrador aprove o que será publicado.

## Principais funcionalidades

- Coleta automatizada de dados da Plataforma Lattes
- Normalização e comparação de informações acadêmicas
- Detecção de novidades e alterações
- Painel administrativo com autenticação e controle de acesso
- Aprovação ou rejeição antes da publicação
- Gestão de pesquisadores, linhas de pesquisa e comunicados
- Site público para divulgação científica
- Histórico de conteúdo ativo, em rascunho ou arquivado

## Arquitetura

```text
Plataforma Lattes
       ↓
Scraping e processamento
       ↓
MySQL + detecção de mudanças
       ↓
Notificações para revisão
       ↓
Aprovação administrativa
       ↓
Publicação no site
```

## Tecnologias

**Front-end:** React, Vite, Tailwind CSS, Axios e React Router.

**Back-end:** Node.js, Express, MySQL, JWT, Puppeteer e Nodemailer.

**Infraestrutura:** Vercel e Git/GitHub.

## Estrutura do projeto

```text
aqarh/
├── src/          # aplicação React e painel administrativo
├── backend/      # API REST, scraping e regras de negócio
├── public/       # arquivos públicos
├── docs/         # documentação técnica
└── README.md
```

## Como executar

### Front-end

```bash
npm install
npm run dev
```

### Back-end

```bash
cd backend
npm install
npm run dev
```

Crie as variáveis de ambiente necessárias para banco de dados, autenticação, e-mail e URLs autorizadas antes de iniciar a API.

## Documentação

Veja [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) para detalhes sobre banco de dados, serviços, fluxo de scraping, notificações, governança e publicação.

## Contexto

Projeto acadêmico voltado à divulgação científica, transparência institucional, automação de processos e governança de dados.

---

Desenvolvido por [João Vitor](https://github.com/joaovitor2074).
