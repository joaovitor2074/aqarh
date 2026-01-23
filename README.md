# Grupo Interdisciplinar em Ensino, Pesquisa e Inovação- GIEPI

## 📌 Visão Geral

O **Grupo Interdisciplinar em Ensino, Pesquisa e Inovação- GIEPI** é um sistema web desenvolvido com o objetivo de **dar visibilidade, transparência e organização** às atividades de um grupo de pesquisa acadêmico. O projeto surgiu a partir da necessidade de centralizar informações que antes ficavam restritas a plataformas consideradas pouco acessíveis ao público geral, como o Lattes.

Atualmente, grande parte das produções, linhas de pesquisa e atualizações dos pesquisadores só eram visíveis individualmente em seus currículos. O GIEPI resolve esse problema ao **centralizar, organizar e publicar essas informações de forma institucional**, com controle administrativo.

---

## 🎯 Problema Identificado

* Baixa visibilidade das atividades do grupo de pesquisa
* Informações acessíveis apenas individualmente via Lattes
* Falta de um canal institucional público
* Atualizações não padronizadas
* Ausência de histórico e comunicação estruturada

---

## 💡 Solução Proposta

O GIEPI automatiza a coleta de dados acadêmicos do grupo de pesquisa, organiza essas informações em um banco de dados próprio e permite que apenas conteúdos **validados por um administrador** sejam publicados para o público.

O sistema atua como uma ponte entre os dados acadêmicos e a divulgação científica institucional.

---

## ⚙️ Funcionalidades Principais

### 🔎 Coleta de Dados (Scraping)

* Scraping manual dos dados do Lattes
* Coleta de currículos, pesquisadores e linhas de pesquisa
* Armazenamento inicial dos dados brutos

### 🔄 Processamento e Comparação

* Normalização dos dados coletados
* Comparação com dados já existentes no banco
* Identificação automática de alterações ou novidades

### 🔔 Sistema de Notificações

* Novos dados geram notificações internas
* Cada notificação representa uma possível atualização institucional

### 🛂 Aprovação Administrativa

O administrador pode:

* Aprovar ou     rejeitar alterações
* Definir o status da informação

**Status possíveis:**

* **Rascunho**: visível apenas no painel admin
* **Ativo**: publicado no site público
* **Arquivado**: conteúdo histórico já publicado

### 🌐 Divulgação Pública

* Site institucional próprio
* Exibição de pesquisadores, linhas de pesquisa e comunicados
* Atualizações só aparecem após aprovação

---

## 🗂️ Estrutura de Pastas (Resumo)

A organização do projeto foi pensada para garantir **clareza, escalabilidade e separação de responsabilidades** entre backend, front-end e recursos públicos.

```
/giepi
 ├─ backend/
 │   ├─ src/
 │   │   ├─ config/        # Configurações (DB, env, e-mail)
 │   │   ├─ controllers/   # Controllers da API
 │   │   ├─ services/      # Regras de negócio (scraping, notificações, comunicados)
 │   │   ├─ routes/        # Definição das rotas
 │   │   ├─ middlewares/   # Autenticação, validações, uploads
 │   │   ├─ jobs/          # Rotinas automatizadas (scraping, tarefas agendadas)
 │   │   ├─ utils/         # Funções utilitárias e helpers
 │   │   └─ app.js         # Inicialização do backend
 │   └─ package.json
 │
 ├─ src/                  # Front-end (site público e painel admin)
 │   ├─ pages/            # Páginas do sistema
 │   ├─ components/       # Componentes reutilizáveis
 │   ├─ services/         # Comunicação com a API
 │   └─ assets/           # Estilos e recursos visuais
 │
 ├─ public/               # Arquivos públicos (imagens, mídia)
 ├─ README.md             # Documentação principal
 └─ package.json
```

Essa estrutura facilita a manutenção do sistema e permite sua evolução para novos módulos ou outros grupos de pesquisa.

---
---

## 🧠 Documentação do Backend

O backend do GIEPI é responsável por **coletar, processar, validar, armazenar e publicar** as informações do grupo de pesquisa, garantindo controle administrativo e integridade dos dados.

Ele foi desenvolvido seguindo boas práticas de separação de responsabilidades, utilizando uma arquitetura baseada em **controllers**, **services** e **rotas**.

---

### ⚙️ Tecnologias Utilizadas

* **Node.js**
* **Express**
* Uso parcial de **TypeScript**
* **MySQL** como banco de dados relacional
* API REST própria

---

### 🗂️ Organização do Backend

O backend está localizado na pasta `backend/` e possui a seguinte estrutura principal:

* `config/` → configurações globais (banco de dados, variáveis de ambiente, e-mails)
* `controllers/` → recebem as requisições HTTP e orquestram o fluxo
* `services/` → regras de negócio do sistema
* `routes/` → definição das rotas da API
* `middlewares/` → autenticação, validações e controle de acesso
* `jobs/` → rotinas automatizadas (scraping periódico, tarefas futuras)
* `utils/` → funções auxiliares e helpers

---

### 🔄 Fluxo Geral do Backend

1. O administrador executa manualmente o scraping
2. O backend coleta os dados do Lattes
3. Os dados brutos são armazenados
4. O sistema normaliza e compara com o banco atual
5. Alterações geram **notificações internas**
6. O administrador avalia cada notificação
7. Apenas dados aprovados são persistidos como dados oficiais
8. As informações aprovadas podem se tornar comunicados públicos

---

### 🔎 Controllers

Os controllers são responsáveis por:

* receber requisições HTTP
* validar dados de entrada
* chamar os services adequados
* retornar respostas padronizadas

Eles **não contêm lógica pesada**, apenas controle de fluxo.

Exemplos de responsabilidades:

* iniciar scraping
* listar notificações
* aprovar ou rejeitar alterações

---

### 🧠 Services (Regras de Negócio)

Os **services** concentram toda a lógica central do GIEPI. Eles são responsáveis por transformar dados brutos em informações institucionais confiáveis, sempre respeitando o fluxo de validação administrativa.

Essa camada é o núcleo do sistema e garante **consistência, rastreabilidade e governança dos dados**.

---

### 🔎 Service de Scraping

Responsável por:

* realizar o scraping manual dos dados do Lattes
* coletar informações do grupo de pesquisa e dos pesquisadores
* salvar os dados brutos para posterior processamento

Esse service não publica informações automaticamente, atuando apenas como **fonte de dados**.

---

### 🔄 Service de Normalização e Comparação

Após o scraping, este service:

* organiza os dados coletados
* normaliza formatos e estruturas
* compara os novos dados com os registros existentes no banco

O objetivo é identificar:

* novos pesquisadores
* novas linhas de pesquisa
* alterações em informações já existentes

---

### 🔔 Service de Notificações

Toda diferença identificada gera uma **notificação interna**.

Esse service:

* cria registros de notificações no banco
* classifica o tipo de alteração
* vincula a notificação ao conteúdo afetado

As notificações representam **propostas de atualização institucional**, não mudanças definitivas.

---

### 📰 Service de Comunicados

Após aprovação administrativa, as notificações podem se tornar comunicados.

Esse service permite:

* criar comunicados a partir de notificações aprovadas
* definir o status do comunicado

**Status possíveis:**

* **Rascunho**: visível apenas para o administrador
* **Ativo**: publicado no site público
* **Arquivado**: registro histórico de publicações

Esse mecanismo cria um **histórico institucional auditável**.

---

### 🛡️ Garantia de Governança

A separação entre scraping, comparação, notificação e publicação garante que:

* nenhuma informação seja divulgada sem validação
* o administrador tenha controle total
* o sistema mantenha integridade e confiabilidade

Essa abordagem diferencia o GIEPI de soluções automatizadas sem controle humano.

---
---

## 🗄️ Documentação do Banco de Dados (MySQL)

O banco de dados do GIEPI foi modelado utilizando o **MySQL**, com foco em **estrutura relacional**, **integridade dos dados** e **rastreabilidade das alterações**.

A escolha por um banco relacional se deve à necessidade de:

* manter relações claras entre pesquisadores, grupos e linhas de pesquisa
* registrar histórico de mudanças
* garantir consistência institucional

---

### 📐 Modelo Conceitual

O banco de dados é organizado em torno das seguintes entidades principais:

* **Pesquisadores**
* **Grupos de Pesquisa**
* **Linhas de Pesquisa**
* **Notificações**
* **Comunicados**
* **Administrador**

Essas entidades se relacionam para refletir fielmente a estrutura acadêmica do grupo.

---

### 👥 Tabela de Pesquisadores

Armazena informações dos pesquisadores vinculados ao grupo.

Exemplos de dados armazenados:

* nome
* identificador Lattes
* vínculo com o grupo
* status (ativo/inativo)

---

### 🧪 Tabela de Linhas de Pesquisa

Registra as linhas de pesquisa associadas ao grupo.

Cada linha pode:

* ser criada automaticamente via scraping
* gerar notificações em caso de novidade ou alteração
* tornar-se visível ao público apenas após aprovação

---

### 🔔 Tabela de Notificações

Responsável por armazenar todas as alterações detectadas pelo sistema.

Características:

* registra o tipo de alteração
* armazena dados antigos e novos
* mantém vínculo com a entidade afetada

Essa tabela é fundamental para o controle administrativo.

---

### 📰 Tabela de Comunicados

Armazena os comunicados institucionais publicados pelo sistema.

Cada comunicado possui:

* referência à notificação de origem
* status (rascunho, ativo, arquivado)
* data de criação e atualização

Isso permite a construção de um **histórico institucional**.

---

### 🔐 Tabela de Administradores

Controla o acesso ao painel administrativo.

Responsabilidades:

* autenticação
* autorização de ações críticas
* aprovação de notificações

---

### 🔄 Integridade e Histórico

O banco de dados foi projetado para:

* evitar sobrescrita direta de dados sensíveis
* preservar histórico de alterações
* permitir auditoria das decisões administrativas

Essa estrutura garante **segurança, transparência e confiabilidade** ao GIEPI.

---

### 🔔 Sistema de Notificações

Cada alteração detectada pelo backend gera uma notificação interna.

Essas notificações representam possíveis atualizações institucionais e passam por aprovação administrativa.

Status possíveis:

* **Rascunho**: apenas no painel administrativo
* **Ativo**: publicado no site público
* **Arquivado**: histórico de publicações

---

### 🛡️ Controle Administrativo

O backend implementa um modelo onde:

* nenhuma alteração é publicada automaticamente
* todas as mudanças passam por validação humana
* o administrador possui controle total sobre o que é divulgado

Esse modelo garante **segurança, confiabilidade e legitimidade institucional**.

---

## 🧱 Arquitetura do Sistema

### Backend

* **Node.js**
* **Express**
* Uso parcial de **TypeScript**
* API REST própria
* Sistema de scraping e processamento

### Banco de Dados

* **MySQL**
* Estrutura relacional
* Histórico de alterações

### Front-end

* Site público próprio
* Painel administrativo próprio
* Separação clara entre público e administração

### Hospedagem

* Backend atualmente rodando na **Vercel**

---


## 🧱 Arquitetura do Sistema

### Backend

* **Node.js**
* **Express**
* Uso parcial de **TypeScript**
* API REST própria
* Sistema de scraping e processamento

### Banco de Dados

* **MySQL**
* Estrutura relacional
* Histórico de alterações

### Front-end

* Site público próprio
* Painel administrativo próprio
* Separação clara entre público e administração

### Hospedagem

* Backend atualmente rodando na **Vercel**

---

## 🔄 Fluxo Geral do Sistema

1. Execução manual do scraping
2. Coleta dos dados do Lattes
3. Armazenamento dos dados brutos
4. Normalização e comparação com banco atual
5. Geração de notificações
6. Avaliação pelo administrador
7. Publicação ou arquivamento

---

## 🎓 Contexto Acadêmico

O GIEPI é um projeto acadêmico com foco em:

* Divulgação científica
* Transparência institucional
* Automação de processos acadêmicos
* Governança de dados

O sistema foi pensado para ser **escalável**, podendo futuramente atender outros grupos de pesquisa ou instituições.

---

## 🚀 Considerações Finais

O GIEPI não é apenas um sistema de scraping, mas uma **plataforma institucional de gestão e divulgação científica**, unindo tecnologia, organização e comunicação acadêmica.

---

📄 *Este README faz parte da documentação oficial do projeto GIEPI.*
