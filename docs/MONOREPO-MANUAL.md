# AIOS-Core Monorepo - Manual Completo

> Guia definitivo para usar, implantar e estender o monorepo aios-core.

---

## Sumario

1. [Visao Geral](#1-visao-geral)
2. [Pre-requisitos](#2-pre-requisitos)
3. [Instalacao Inicial](#3-instalacao-inicial)
4. [Estrutura do Monorepo](#4-estrutura-do-monorepo)
5. [Mapa de Pacotes](#5-mapa-de-pacotes)
6. [Como Usar em Outros Projetos (npm link)](#6-como-usar-em-outros-projetos-npm-link)
7. [Usando os Pacotes no Codigo](#7-usando-os-pacotes-no-codigo)
8. [CLI - Comandos Disponiveis](#8-cli---comandos-disponiveis)
9. [Trabalhando com Squads](#9-trabalhando-com-squads)
10. [Apps (Dashboard e Monitor)](#10-apps-dashboard-e-monitor)
11. [Workflows](#11-workflows)
12. [Adicionando Novos Pacotes](#12-adicionando-novos-pacotes)
13. [Adicionando Novos Squads](#13-adicionando-novos-squads)
14. [Scripts Utilitarios](#14-scripts-utilitarios)
15. [Troubleshooting](#15-troubleshooting)
16. [Referencia Rapida](#16-referencia-rapida)
17. [Quick Setup - Usar em Outros Projetos e Maquinas](#17-quick-setup---usar-em-outros-projetos-e-maquinas)

---

## 1. Visao Geral

O `aios-core` e um monorepo npm workspaces que organiza o framework AIOS (AI-Orchestrated System) em **10 pacotes** independentes, todos consumiveis via `npm link` por qualquer projeto local.

```text
aios-core/                          # Root (v3.10.0)
  packages/                         # Pacotes npm reutilizaveis
  squads/                           # Squads de agentes especializados
  apps/                             # Aplicacoes (dashboard, monitor)
  src/                              # Wizard de instalacao
  .aios-core/                      # Engine central (core, cli, infrastructure, development)
  bin/                              # Entry points do CLI
```

**Principio arquitetural**: In-Place Wrapping. Os pacotes foram criados adicionando `package.json` nos diretorios existentes, sem mover arquivos. Isso preserva todos os caminhos relativos internos.

---

## 2. Pre-requisitos

| Ferramenta | Versao Minima | Verificar |
| ------------ | -------------- | ----------- |
| Node.js | >= 18.0.0 | `node -v` |
| npm | >= 9.0.0 | `npm -v` |
| Git | Qualquer | `git --version` |
| Bun (opcional) | Qualquer | `bun -v` (so para monitor-server) |

---

## 3. Instalacao Inicial

### 3.1 Obter o repositorio

O monorepo funciona de **qualquer origem Git** - repo privado, fork, ou clone direto.

```bash
# Opcao A: Seu repo privado (recomendado)
git clone https://github.com/SEU-USUARIO/aios-core.git
cd aios-core

# Opcao B: Repo original publico
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core

# Opcao C: Ja tem o repo local? Basta entrar no diretorio
cd /caminho/para/aios-core
```

O monorepo e 100% auto-contido. Nao depende do repo original para funcionar.
Tudo que importa e a estrutura local de arquivos + npm workspaces.

### 3.2 Instalar dependencias

```bash
npm install
```

Isso faz automaticamente:

- Instala todas as dependencias do root e dos workspaces
- Cria symlinks em `node_modules/@aios/` para cada pacote workspace
- Faz hoisting de dependencias compartilhadas para o root `node_modules/`

### 3.3 Verificar que os workspaces foram resolvidos

```bash
npm run link:dry
```

Saida esperada:

```text
  Found 10 workspace packages:

  @aios/installer (packages\installer) -> would link
  @aios/squad-copy (squads\copy) -> would link
  @aios/squad-creator (squads\squad-creator) -> would link
  @aios/wizard (src) -> would link
  @aios/core (.aios-core\core) -> would link
  @aios/cli (.aios-core\cli) -> would link
  @aios/infrastructure (.aios-core\infrastructure) -> would link
  @aios/development (.aios-core\development) -> would link
  @aios/dashboard (apps\dashboard) -> would link
  @aios/monitor-server (apps\monitor-server) -> would link
```

### 3.4 Verificar que os symlinks existem

```bash
ls node_modules/@aios/
```

Deve listar: `cli`, `core`, `dashboard`, `development`, `infrastructure`, `installer`, `monitor-server`, `squad-copy`, `squad-creator`, `wizard`

---

## 4. Estrutura do Monorepo

```text
aios-core/
 |
 |-- packages/                      # PACOTES REUTILIZAVEIS
 |   |-- installer/                 # @aios/installer (v3.2.0)
 |   |   |-- src/
 |   |   |   |-- config/            # Configuracao de ambiente
 |   |   |   |-- detection/         # Deteccao de tipo de projeto
 |   |   |   |-- wizard/            # Wizard de setup
 |   |   |   |-- index.js           # Entry point
 |   |   |-- tests/
 |   |   |-- package.json
 |
 |-- squads/                        # SQUADS DE AGENTES
 |   |-- copy/                      # @aios/squad-copy (v3.0.0)
 |   |   |-- agents/                # 9 agentes (Hopkins, Schwartz, Halbert...)
 |   |   |-- tasks/                 # 37 tasks de copywriting
 |   |   |-- workflows/             # 7 workflows
 |   |   |-- templates/             # Templates de output
 |   |   |-- checklists/            # Checklists de qualidade
 |   |   |-- data/                  # Base de conhecimento
 |   |   |-- docs/                  # Frameworks e pesquisa
 |   |   |-- swipe/                 # Swipe files organizados
 |   |   |-- scripts/               # Scripts de automacao
 |   |   |-- config.yaml            # Configuracao do squad
 |   |   |-- package.json
 |   |
 |   |-- squad-creator/             # @aios/squad-creator (v2.9.0)
 |       |-- agents/                # 5 meta-agentes
 |       |-- tasks/                 # 26 tasks de criacao de squads
 |       |-- workflows/             # 8 workflows
 |       |-- templates/             # Templates de squad
 |       |-- checklists/            # 10 checklists de qualidade
 |       |-- scripts/               # Scripts Python (validacao, analytics)
 |       |-- data/                  # Frameworks de decisao
 |       |-- config.yaml            # Configuracao do meta-squad
 |       |-- package.json
 |
 |-- apps/                          # APLICACOES
 |   |-- dashboard/                 # @aios/dashboard (v0.1.0) - Next.js
 |   |-- monitor-server/            # @aios/monitor-server (v1.0.0) - Bun
 |
 |-- src/                           # @aios/wizard (v3.10.0)
 |   |-- wizard/                    # Wizard interativo de instalacao
 |   |-- installer/                 # Logica de instalacao
 |   |-- config/                    # Configuracoes IDE
 |   |-- utils/                     # Utilitarios (cores, etc.)
 |   |-- package.json
 |
 |-- .aios-core/                    # ENGINE CENTRAL
 |   |-- core/                      # @aios/core (v3.10.0)
 |   |   |-- config/                # Cache e loader de config
 |   |   |-- elicitation/           # Motor de elicitacao
 |   |   |-- execution/             # Execucao autonoma (build loop)
 |   |   |-- health-check/          # 60+ checks de saude
 |   |   |-- manifest/              # Gerador/validador de manifesto
 |   |   |-- mcp/                   # Configuracao MCP
 |   |   |-- memory/                # Memoria de contexto
 |   |   |-- orchestration/         # Orquestrador master + executors
 |   |   |-- permissions/           # Sistema de permissoes
 |   |   |-- quality-gates/         # Gates de qualidade (3 camadas)
 |   |   |-- registry/              # Service registry
 |   |   |-- session/               # Detector/loader de contexto
 |   |   |-- utils/                 # Formatters e validators
 |   |   |-- index.js               # Barrel export (32 exports)
 |   |   |-- package.json
 |   |
 |   |-- cli/                       # @aios/cli (v3.10.0)
 |   |   |-- commands/
 |   |   |   |-- workers/           # Busca de workers
 |   |   |   |-- manifest/          # Gerenciamento de manifesto
 |   |   |   |-- mcp/               # Comandos MCP
 |   |   |   |-- qa/                # Quality assurance
 |   |   |   |-- migrate/           # Migracao
 |   |   |   |-- metrics/           # Metricas
 |   |   |   |-- generate/          # Geracao de codigo
 |   |   |   |-- validate/          # Validacao
 |   |   |-- index.js               # CLI principal (Commander.js)
 |   |   |-- package.json
 |   |
 |   |-- infrastructure/            # @aios/infrastructure (v3.10.0)
 |   |   |-- scripts/               # 70+ scripts utilitarios
 |   |   |-- integrations/          # Adapters PM (GitHub, Jira, ClickUp)
 |   |   |-- index.js               # Barrel export (53 exports)
 |   |   |-- package.json
 |   |
 |   |-- development/               # @aios/development (v3.10.0)
 |       |-- agents/                # 12 definicoes de agentes
 |       |-- tasks/                 # 176 definicoes de tasks
 |       |-- workflows/             # YAMLs + Markdowns de workflows
 |       |-- templates/             # Templates de desenvolvimento
 |       |-- agent-teams/           # Configuracoes de times
 |       |-- checklists/            # Checklists de auto-critica
 |       |-- package.json
 |
 |-- bin/                           # CLI entry points
 |   |-- aios.js                    # Comando principal
 |   |-- aios-init.js               # Wizard de inicializacao
 |   |-- aios-minimal.js            # Modo minimal
 |   |-- modules/                   # Modulos auxiliares
 |
 |-- scripts/                       # Scripts de build e utilitarios
 |   |-- link-all.js                # Link global de todos os pacotes
 |
 |-- templates/                     # Templates (squad, etc.)
 |-- tools/                         # Ferramentas de diagnostico
 |-- tests/                         # Testes
 |-- docs/                          # Documentacao
 |-- package.json                   # Root config (workspaces)
 |-- tsconfig.json                  # TypeScript config
```

---

## 5. Mapa de Pacotes

### 5.1 Pacotes de Engine

| Pacote | O que faz | Exports principais |
| -------- | ----------- | ------------------- |
| **@aios/core** | Motor central do AIOS | `ConfigCache`, `ElicitationEngine`, `HealthCheckEngine`, `ServiceRegistry`, `SessionContextLoader`, `loadAgentConfig`, `loadRegistry`, `validateYAML` (32 total) |
| **@aios/cli** | Comandos CLI (Commander.js) | `run()` - roda workers, manifest, mcp, qa, migrate, metrics, generate, validate |
| **@aios/infrastructure** | 70+ ferramentas utilitarias | `GitWrapper`, `TemplateEngine`, `DependencyAnalyzer`, `ComponentGenerator`, `TestGenerator`, `PerformanceAnalyzer`, `BackupManager`, `RepositoryDetector` (53 total) |
| **@aios/development** | Assets de desenvolvimento | Agents (12), Tasks (176), Workflows, Templates, Agent Teams, Checklists |

### 5.2 Pacotes de Instalacao

| Pacote | O que faz | Exports principais |
| -------- | ----------- | ------------------- |
| **@aios/wizard** | Wizard interativo de instalacao | `runWizard()`, validadores, configurador IDE, i18n |
| **@aios/installer** | Automacao de setup | `configureEnvironment()`, `detectProjectType()`, `wizard()` |

### 5.3 Squads

| Pacote | O que faz | Conteudo |
| -------- | ----------- | ------------------- |
| **@aios/squad-copy** | Copywriting de alta conversao | 9 agentes (Hopkins, Schwartz, Halbert, Ogilvy, Kennedy, Todd Brown, Benson, Bencivenga, Sugarman), 37 tasks, 7 workflows, swipe files |
| **@aios/squad-creator** | Meta-squad: fabrica de squads | 5 meta-agentes (Squad Architect, Diagnostician, Oalanicolas, Pedro Valerio), 26 tasks, 8 workflows, scripts Python |

### 5.4 Apps

| Pacote | O que faz | Tech |
| -------- | ----------- | ------------------- |
| **@aios/dashboard** | Dashboard web do AIOS | Next.js 16, React 19, Zustand, Tailwind, Radix UI |
| **@aios/monitor-server** | Servidor de eventos real-time | Bun, TypeScript |

---

## 6. Como Usar em Outros Projetos (npm link)

### 6.1 Linkar todos os pacotes globalmente (uma vez)

No diretorio do monorepo:

```bash
cd d:/aios-core
npm run link:all
```

Isso registra todos os 10 pacotes globalmente no npm. Voce so precisa rodar isso uma vez (ou quando adicionar novos pacotes).

### 6.2 Consumir em um projeto externo

Em qualquer outro projeto:

```bash
cd /caminho/do/meu-projeto

# Linkar pacotes especificos que voce precisa:
npm link @aios/core @aios/infrastructure

# Ou linkar todos de uma vez:
npm link @aios/core @aios/cli @aios/infrastructure @aios/installer @aios/wizard @aios/development @aios/squad-copy @aios/squad-creator @aios/dashboard @aios/monitor-server
```

### 6.3 Verificar que o link funcionou

```bash
# No projeto consumidor:
node -e "const core = require('@aios/core'); console.log(Object.keys(core))"
```

### 6.4 Remover links

```bash
# No projeto consumidor:
npm unlink @aios/core

# Para remover o link global (no monorepo):
cd d:/aios-core
npm unlink --global @aios/core
```

### 6.5 Importante: Links sao simbolicos

Os links apontam para os arquivos **reais** no monorepo. Qualquer alteracao que voce fizer no monorepo e refletida imediatamente nos projetos consumidores sem precisar re-linkar.

---

## 7. Usando os Pacotes no Codigo

### 7.1 @aios/core - Motor Central

```javascript
// Carregar configuracao de agentes
const { loadAgentConfig, loadFullConfig } = require('@aios/core');
const agentConfig = loadAgentConfig('/caminho/projeto');

// Health check
const { HealthCheckEngine } = require('@aios/core');
const engine = new HealthCheckEngine();
const report = await engine.runAll('/caminho/projeto');

// Service Registry (buscar workers)
const { loadRegistry, getRegistry } = require('@aios/core');
await loadRegistry('/caminho/projeto');
const registry = getRegistry();

// Elicitacao (perguntas inteligentes ao usuario)
const { ElicitationEngine } = require('@aios/core');
const elicitation = new ElicitationEngine();

// Validar YAML
const { validateYAML } = require('@aios/core');
const result = validateYAML(yamlString);

// Cache de config (singleton)
const { ConfigCache, globalConfigCache } = require('@aios/core');
```

### 7.2 @aios/infrastructure - Ferramentas

```javascript
// Git
const { GitWrapper, BranchManager, CommitMessageGenerator } = require('@aios/infrastructure');
const git = new GitWrapper('/caminho/repo');

// Templates
const { TemplateEngine, ComponentGenerator } = require('@aios/infrastructure');
const engine = new TemplateEngine();

// Analise
const { DependencyAnalyzer, FrameworkAnalyzer, SecurityChecker } = require('@aios/infrastructure');
const deps = new DependencyAnalyzer('/caminho/projeto');

// Testes
const { TestGenerator, CoverageAnalyzer } = require('@aios/infrastructure');

// Performance
const { PerformanceAnalyzer, PerformanceOptimizer } = require('@aios/infrastructure');

// Qualidade
const { CodeQualityImprover, RefactoringSuggester } = require('@aios/infrastructure');

// PM Adapters
const { getPMAdapter, isPMToolConfigured } = require('@aios/infrastructure');
const adapter = getPMAdapter('github'); // ou 'jira', 'clickup', 'local'

// Backup e Recovery
const { BackupManager, TransactionManager } = require('@aios/infrastructure');

// Deteccao de repositorio
const { RepositoryDetector } = require('@aios/infrastructure');
```

### 7.3 @aios/cli - Executar Comandos

```javascript
const { run } = require('@aios/cli');

// Executar o CLI programaticamente
await run(['node', 'aios', 'workers', 'search', 'json']);
await run(['node', 'aios', 'manifest', 'validate']);
await run(['node', 'aios', 'mcp', 'status']);
```

### 7.4 @aios/installer - Setup

```javascript
const { configureEnvironment, detectProjectType } = require('@aios/installer');

// Detectar tipo de projeto (greenfield/brownfield)
const projectType = await detectProjectType('/caminho/projeto');

// Configurar ambiente
await configureEnvironment('/caminho/projeto', options);
```

### 7.5 @aios/wizard - Wizard Interativo

```javascript
const { runWizard } = require('@aios/wizard');

// Rodar o wizard de instalacao completo
await runWizard();
```

### 7.6 Importar subpaths especificos

Cada pacote expoe subpaths via `exports` no package.json:

```javascript
// Core - submodulos especificos
const healthCheck = require('@aios/core/health-check');
const registry = require('@aios/core/registry');
const orchestration = require('@aios/core/orchestration');
const permissions = require('@aios/core/permissions');

// CLI - comandos especificos
const workersCmd = require('@aios/cli/commands/workers');
const mcpCmd = require('@aios/cli/commands/mcp');

// Installer - submodulos
const configValidator = require('@aios/installer/config/validation/config-validator');
const detection = require('@aios/installer/detection');

// Wizard - submodulos
const feedback = require('@aios/wizard/wizard/feedback');
const validation = require('@aios/wizard/wizard/validation');
const ideConfig = require('@aios/wizard/config');
```

---

## 8. CLI - Comandos Disponiveis

### 8.1 Comando principal

```bash
# Via npx (instalacao remota)
npx @synkra/aios-core@latest

# Via node (local)
node bin/aios.js
```

### 8.2 Comandos

| Comando | Descricao |
| --------- | ----------- |
| `aios` | Roda o wizard de instalacao |
| `aios install` | Instala no projeto atual |
| `aios init <nome>` | Cria novo projeto |
| `aios validate` | Valida integridade da instalacao |
| `aios validate --repair` | Repara arquivos faltantes |
| `aios info` | Mostra informacoes do sistema |
| `aios doctor` | Roda diagnosticos |
| `aios workers search <query>` | Busca workers por query |
| `aios --version` | Mostra versao |
| `aios --help` | Mostra ajuda |

### 8.3 Scripts npm do monorepo

| Script | Descricao |
| -------- | ----------- | ------------------- |
| `npm test` | Roda testes (Jest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com cobertura |
| `npm run lint` | Roda ESLint |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run format` | Formata markdowns com Prettier |
| `npm run link:all` | Linka todos os pacotes globalmente |
| `npm run link:dry` | Mostra o que seria linkado (dry run) |
| `npm run validate:structure` | Valida estrutura de arquivos |
| `npm run sync:ide` | Sincroniza configs de IDE |
| `npm run generate:manifest` | Gera manifesto de instalacao |
| `npm run validate:manifest` | Valida manifesto |

---

## 9. Trabalhando com Squads

### 9.1 O que e um Squad?

Um squad e um pacote de agentes especializados com tasks, workflows, templates e checklists. Cada squad e auto-contido e configurado via `config.yaml`.

### 9.2 Squad Copy (@aios/squad-copy)

**Proposito**: Time de copywriters lendarios para criar pecas de alta conversao.

**Agentes por Tier**:

- **Tier 0 (Diagnostico)**: Claude Hopkins, Eugene Schwartz
- **Tier 1 (Masters $500M+)**: Gary Halbert, Gary Bencivenga, David Ogilvy
- **Tier 2 (Sistematizadores)**: Dan Kennedy, Todd Brown
- **Tier 3 (Especialistas de Formato)**: Jon Benson (VSL)
- **Tool**: Joe Sugarman 30 Triggers (checklist pos-copy)

**37 Tasks** incluem: sales pages, email sequences, VSLs, ads, headlines, leads, CTAs, e mais.

**7 Workflows**: Full Launch, Paid Traffic, High-Ticket, Organic Content, Email Marketing, Funnel Optimization, Direct Mail.

**Uso**: Consulte `squads/copy/README.md` para guia completo.

### 9.3 Squad Creator (@aios/squad-creator)

**Proposito**: Meta-squad para criar novos squads baseados em "elite minds" reais.

**Meta-Agentes**:

- **Orchestrator**: Squad Architect
- **Tier 0**: Squad Diagnostician
- **Tier 1**: Oalanicolas (mind cloning), Pedro Valerio (process design)

**26 Tasks** incluem: create-squad, create-agent, deep-research, extract-thinking-dna, extract-voice-dna, validate-squad, squad-fusion, e mais.

**8 Workflows**: criacao de squad, pesquisa de mind, clonagem, fusao, validacao.

**Scripts Python**: validacao de estrutura, analytics, scoring RICE/WSJF, checklist validation.

**Uso**: Consulte `squads/squad-creator/README.md` e `squads/squad-creator/docs/QUICK-START.md`.

### 9.4 Acessar assets de squads no codigo

```javascript
const path = require('path');

// Resolver caminho para assets do squad
const squadCopyPath = require.resolve('@aios/squad-copy/package.json');
const squadDir = path.dirname(squadCopyPath);

// Ler config do squad
const fs = require('fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync(path.join(squadDir, 'config.yaml'), 'utf8'));
console.log(config.pack.name); // "copy"

// Listar agentes
const agents = fs.readdirSync(path.join(squadDir, 'agents'));
console.log(agents); // ['claude-hopkins.md', 'david-ogilvy.md', ...]
```

---

## 10. Apps (Dashboard e Monitor)

### 10.1 Dashboard (@aios/dashboard)

**Tech**: Next.js 16, React 19, Zustand, Tailwind CSS 4, Radix UI

**Paginas**:

- Agents - Gerenciamento de agentes
- GitHub - Integracao GitHub
- Kanban - Board de tarefas
- Monitor - Monitoramento real-time
- Settings - Configuracoes
- Terminals - Terminais integrados

**Rodar localmente**:

```bash
cd apps/dashboard
npm run dev
# Abre em http://localhost:3000
```

**Build de producao**:

```bash
cd apps/dashboard
npm run build
npm start
```

### 10.2 Monitor Server (@aios/monitor-server)

**Tech**: Bun runtime, TypeScript

**Rodar localmente** (requer Bun):

```bash
cd apps/monitor-server
bun run dev
# ou
bun run start
```

---

## 11. Workflows

Os workflows ficam em `.aios-core/development/workflows/` em dois formatos:

| Formato | Extensao | Proposito |
|---------|----------|-----------|
| YAML | `.yaml` | Definicao executavel (lido pelo orchestrator) |
| Markdown | `.md` | Documentacao detalhada com diagramas Mermaid |

### Workflows disponiveis

| Workflow                      | YAML                           | Markdown                                    |
|-------------------------------|--------------------------------|---------------------------------------------|
| Greenfield Full-Stack         | `greenfield-fullstack.yaml`    | `GREENFIELD-FULLSTACK-WORKFLOW.md`          |
| Greenfield Service            | `greenfield-service.yaml`      | `GREENFIELD-SERVICE-WORKFLOW.md`            |
| Greenfield UI                 | `greenfield-ui.yaml`           | `GREENFIELD-UI-WORKFLOW.md`                 |
| Brownfield Discovery          | `brownfield-discovery.yaml`    | `BROWNFIELD-DISCOVERY-WORKFLOW.md`          |
| Brownfield Full-Stack         | `brownfield-fullstack.yaml`    | `BROWNFIELD-FULLSTACK-WORKFLOW.md`          |
| Brownfield Service            | `brownfield-service.yaml`      | `BROWNFIELD-SERVICE-WORKFLOW.md`            |
| Brownfield UI                 | `brownfield-ui.yaml`           | `BROWNFIELD-UI-WORKFLOW.md`                 |
| Auto Worktree                 | `auto-worktree.yaml`           | `AUTO-WORKTREE-WORKFLOW.md`                 |
| QA Loop                       | `qa-loop.yaml`                 | `QA-LOOP-WORKFLOW.md`                       |
| Spec Pipeline                 | `spec-pipeline.yaml`           | `SPEC-PIPELINE-WORKFLOW.md`                 |
| Story Development Cycle       | -                              | `STORY-DEVELOPMENT-CYCLE-WORKFLOW.md`       |
| Design System Build Quality   | -                              | `DESIGN-SYSTEM-BUILD-QUALITY-WORKFLOW.md`   |

---

## 12. Adicionando Novos Pacotes

### 12.1 Pacote em packages/

```bash
# 1. Criar diretorio
mkdir -p packages/meu-pacote/src

# 2. Criar package.json
cat > packages/meu-pacote/package.json << 'EOF'
{
  "name": "@aios/meu-pacote",
  "version": "1.0.0",
  "description": "Descricao do pacote",
  "main": "src/index.js",
  "license": "MIT",
  "private": true
}
EOF

# 3. Criar entry point
echo "module.exports = {};" > packages/meu-pacote/src/index.js

# 4. Instalar (resolve workspaces automaticamente via packages/*)
npm install

# 5. Verificar
node -e "require('@aios/meu-pacote')"
```

Pacotes em `packages/` sao detectados automaticamente pelo glob `packages/*` no workspaces.

### 12.2 Pacote em diretorio customizado

Se o pacote nao esta em `packages/` ou `squads/`, adicione o path explicitamente:

```jsonc
// package.json (root)
{
  "workspaces": [
    "packages/*",
    "squads/*",
    "src",
    "caminho/do/meu-pacote",     // <-- adicionar aqui
    ".aios-core/core",
    // ...
  ]
}
```

Depois: `npm install`

---

## 13. Adicionando Novos Squads

### 13.1 Criar manualmente

```bash
# 1. Criar estrutura
mkdir -p squads/meu-squad/{agents,tasks,workflows,templates,checklists}

# 2. Criar config.yaml
cat > squads/meu-squad/config.yaml << 'EOF'
name: meu-squad
version: 1.0.0
description: Descricao do squad
author: Seu Nome
slashPrefix: meuSquad
EOF

# 3. Criar package.json
cat > squads/meu-squad/package.json << 'EOF'
{
  "name": "@aios/squad-meu-squad",
  "version": "1.0.0",
  "description": "Descricao do squad",
  "keywords": ["aios", "aios-squad"],
  "license": "MIT",
  "private": true
}
EOF

# 4. Instalar (detectado automaticamente via squads/*)
npm install

# 5. Verificar
npm run link:dry
```

### 13.2 Usando o Squad Creator

O `@aios/squad-creator` automatiza a criacao de squads:

```text
Consulte: squads/squad-creator/docs/QUICK-START.md
```

### 13.3 Usando o template de squad

O monorepo inclui um template em `templates/squad/` com a estrutura padrao:

```text
templates/squad/
  agents/
  tasks/
  workflows/
  templates/
  tests/
  squad.yaml         # Config template com placeholders {{}}
  package.json        # package.json template
  README.md
  LICENSE
```

---

## 14. Scripts Utilitarios

### 14.1 link-all.js

```bash
# Linkar todos os pacotes globalmente
npm run link:all

# Ver o que seria linkado (dry run)
npm run link:dry
```

### 14.2 Validacao

```bash
# Validar estrutura de arquivos
npm run validate:structure

# Validar manifesto de instalacao
npm run validate:manifest

# Gerar manifesto
npm run generate:manifest
```

### 14.3 Sincronizacao IDE

```bash
# Sincronizar configs de todas as IDEs
npm run sync:ide

# Validar sincronizacao
npm run sync:ide:validate

# IDEs especificas
npm run sync:ide:cursor
npm run sync:ide:windsurf
npm run sync:ide:trae
```

### 14.4 Testes

```bash
# Todos os testes
npm test

# Com watch
npm run test:watch

# Com cobertura
npm run test:coverage

# Health checks
npm run test:health-check

# Testes de um workspace especifico
npm test --workspace=@aios/installer
```

### 14.5 Qualidade

```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Format markdowns
npm run format
```

---

## 15. Troubleshooting

### Problema: `npm install` falha com erro de workspace

**Causa**: Um `package.json` de workspace tem formato invalido.

**Solucao**:

```bash
# Verificar qual workspace falha
npm ls --workspaces 2>&1 | grep ERR

# Validar JSON de cada package.json
node -e "JSON.parse(require('fs').readFileSync('squads/copy/package.json'))"
```

### Problema: `require('@aios/core')` diz MODULE_NOT_FOUND

**Causa**: Os symlinks nao foram criados.

**Solucao**:

```bash
# Verificar symlinks
ls node_modules/@aios/

# Se vazio, reinstalar
rm -rf node_modules
npm install
```

### Problema: npm link nao funciona em projeto externo

**Causa**: O pacote nao foi linkado globalmente.

**Solucao**:

```bash
# No monorepo
npm run link:all

# Verificar links globais
npm ls -g --depth=0 2>/dev/null | grep @aios

# No projeto consumidor
npm link @aios/core
```

### Problema: Mudancas no monorepo nao aparecem no projeto linkado

**Causa**: npm link cria symlinks, entao mudancas devem aparecer automaticamente. Se nao aparecem, o modulo pode estar em cache.

**Solucao**:

```bash
# Limpar cache do Node
node -e "delete require.cache[require.resolve('@aios/core')]"

# Ou reiniciar o processo Node
```

### Problema: Dashboard nao roda (`next dev` falha)

**Causa**: Dependencias do dashboard nao foram instaladas.

**Solucao**:

```bash
# No root do monorepo (resolve todos os workspaces)
npm install

# Verificar
cd apps/dashboard
npm run dev
```

### Problema: Monitor server precisa de Bun

**Solucao**:

```bash
# Instalar Bun
npm install -g bun

# Rodar
cd apps/monitor-server
bun run dev
```

### Problema: Git diz "dubious ownership"

**Solucao**:

```bash
git config --global --add safe.directory D:/aios-core
```

---

## 16. Referencia Rapida

### Setup inicial (uma vez)

```bash
cd /caminho/para/aios-core  # seu repo local (privado ou publico)
npm install
npm run link:all             # registra todos os pacotes globalmente
```

### Usar em outro projeto

```bash
cd meu-projeto
npm link @aios/core @aios/infrastructure  # linkar o que precisar
```

### Dia a dia no monorepo

```bash
npm test                  # rodar testes
npm run lint              # verificar codigo
npm run typecheck         # verificar tipos
npm run link:dry          # listar pacotes
```

### Adicionar novo squad

```bash
mkdir -p squads/novo/{agents,tasks,workflows}
# criar config.yaml + package.json
npm install               # detecta automaticamente via squads/*
```

### Mapa de imports

```text
require('@aios/core')            ->  .aios-core/core/index.js
require('@aios/cli')             ->  .aios-core/cli/index.js
require('@aios/infrastructure')  ->  .aios-core/infrastructure/index.js
require('@aios/development')     ->  .aios-core/development/scripts/squad/index.js
require('@aios/wizard')          ->  src/wizard/index.js
require('@aios/installer')       ->  packages/installer/src/index.js
```

---

## 17. Quick Setup - Usar em Outros Projetos e Maquinas

### A. Mesma maquina - novo projeto greenfield

```bash
# 1. Garantir que o monorepo esta linkado (so precisa fazer 1x)
cd d:/aios-core
npm install
npm run link:all

# 2. Criar seu projeto novo
mkdir d:/meus-projetos/novo-projeto
cd d:/meus-projetos/novo-projeto
npm init -y

# 3. Linkar os pacotes que precisar
npm link @aios/core @aios/infrastructure @aios/cli @aios/development

# 4. Sincronizar agentes AIOS para Claude Code e Antigravity
aios-sync

# 5. Pronto! Use no seu codigo
node -e "console.log(Object.keys(require('@aios/core')))"
```

### B. Outra maquina - setup do zero

```bash
# 1. Clonar o repo (privado ou publico)
git clone https://github.com/almeidatech/aios-core.git
cd aios-core
git checkout feat/monorepo-workspaces

# 2. Instalar e linkar
npm install
npm run link:all

# 3. Ir para o projeto consumidor
cd /caminho/do/meu-projeto
npm link @aios/core @aios/infrastructure @aios/cli @aios/development

# 4. Sincronizar agentes AIOS
aios-sync

# 5. Verificar
node -e "console.log(Object.keys(require('@aios/core')))"
```

### C. Cheat sheet - copiar e colar

**Na maquina do monorepo (1x)**:

```bash
cd d:/aios-core && npm install && npm run link:all
```

**Em cada projeto novo**:

```bash
npm link @aios/core @aios/infrastructure @aios/cli @aios/development
```

**Linkar TUDO de uma vez**:

```bash
npm link @aios/core @aios/cli @aios/infrastructure @aios/development @aios/wizard @aios/installer @aios/squad-copy @aios/squad-creator @aios/dashboard @aios/monitor-server
```

### D. Dicas importantes

| Dica | Detalhe |
|------|---------|
| Links sao symlinks | Qualquer alteracao no monorepo reflete nos projetos automaticamente |
| `npm install` desfaz links | Apos rodar `npm install` no projeto, re-linke com `npm link @aios/...` |
| `npm run link:all` so no monorepo | Esse script existe apenas no `aios-core/package.json`, NAO no projeto consumidor |
| No projeto consumidor use `npm link` | Ex: `npm link @aios/core @aios/infrastructure` (sem `run`) |
| Node >= 18 obrigatorio | Todos os pacotes exigem Node 18+ |
| Windows: paths | Use `/` em scripts, `\` e aceito apenas no terminal |
| Bun so para monitor | `@aios/monitor-server` roda com Bun, todos os demais com Node |

### E. Sincronizar agentes AIOS (`aios-sync`)

O comando `aios-sync` sincroniza os 12 agentes AIOS como slash commands no Claude Code e rules no Antigravity.

```bash
# Pre-requisito: linkar os pacotes necessarios
npm link @aios/development @aios/infrastructure

# Sincronizar agentes (Claude Code + Antigravity por default)
aios-sync

# Sincronizar para todas as 5 IDEs
aios-sync --all

# Sincronizar so para uma IDE
aios-sync --ide claude-code
aios-sync --ide antigravity
aios-sync --ide cursor

# Preview sem escrever arquivos
aios-sync --dry-run
```

**Resultado**: Cria os diretorios com os agentes sincronizados:
- `.claude/commands/AIOS/agents/` → 12 agentes + 4 redirects (slash commands)
- `.antigravity/rules/agents/` → 12 agentes + 4 redirects (rules)

**Agentes disponiveis apos sync**:
`@aios-master`, `@analyst`, `@architect`, `@data-engineer`, `@dev`, `@devops`, `@pm`, `@po`, `@qa`, `@sm`, `@squad-creator`, `@ux-design-expert`

### F. Troubleshooting rapido

```bash
# Verificar se os links globais existem
npm ls -g --depth=0 2>/dev/null | grep @aios

# Se nao existem, re-linkar
cd d:/aios-core && npm run link:all

# Verificar no projeto consumidor
node -e "console.log(require.resolve('@aios/core'))"

# Se MODULE_NOT_FOUND, re-linkar no projeto
npm link @aios/core

# Se aios-sync nao encontra agentes, re-linkar development + infrastructure
npm link @aios/development @aios/infrastructure
```
