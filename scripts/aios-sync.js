#!/usr/bin/env node

/**
 * aios-sync - Sync AIOS agents to IDE directories in any project
 *
 * Usage (from any project directory):
 *   aios-sync                    # Sync to Claude Code + Antigravity (default)
 *   aios-sync --all              # Sync to all 5 IDEs
 *   aios-sync --ide claude-code  # Sync to specific IDE
 *   aios-sync --ide antigravity  # Sync to specific IDE
 *   aios-sync --dry-run          # Preview without writing
 *
 * Requires: npm link @aios/development @aios/infrastructure
 */

const path = require('path');
const fs = require('fs');

// ANSI colors
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// IDE target definitions
const IDE_TARGETS = {
  'claude-code': {
    enabled: true,
    path: '.claude/commands/AIOS/agents',
    format: 'full-markdown-yaml',
  },
  antigravity: {
    enabled: true,
    path: '.antigravity/rules/agents',
    format: 'cursor-style',
  },
  cursor: {
    enabled: false,
    path: '.cursor/rules/agents',
    format: 'condensed-rules',
  },
  windsurf: {
    enabled: false,
    path: '.windsurf/rules/agents',
    format: 'xml-tagged-markdown',
  },
  trae: {
    enabled: false,
    path: '.trae/rules/agents',
    format: 'project-rules',
  },
};

// Redirect map for deprecated agents
const REDIRECTS = {
  'aios-developer': 'aios-master',
  'aios-orchestrator': 'aios-master',
  'db-sage': 'data-engineer',
  'github-devops': 'devops',
};

// Parse CLI args
const args = process.argv.slice(2);
const flags = {
  dryRun: args.includes('--dry-run'),
  all: args.includes('--all'),
  ide: null,
  help: args.includes('--help') || args.includes('-h'),
};

const ideIdx = args.indexOf('--ide');
if (ideIdx !== -1 && args[ideIdx + 1]) {
  flags.ide = args[ideIdx + 1];
}

if (flags.help) {
  console.log(`
${c.bold}aios-sync${c.reset} - Sync AIOS agents to IDE directories

${c.bold}USAGE:${c.reset}
  aios-sync                     Sync to Claude Code + Antigravity (default)
  aios-sync --all               Sync to all 5 IDEs
  aios-sync --ide <name>        Sync to specific IDE
  aios-sync --dry-run           Preview without writing files

${c.bold}IDEs:${c.reset}
  claude-code    .claude/commands/AIOS/agents/
  antigravity    .antigravity/rules/agents/
  cursor         .cursor/rules/agents/
  windsurf       .windsurf/rules/agents/
  trae           .trae/rules/agents/

${c.bold}SETUP:${c.reset}
  cd <monorepo>  &&  npm run link:all
  cd <project>   &&  npm link @aios/development @aios/infrastructure
  aios-sync
`);
  process.exit(0);
}

/**
 * Resolve the path to a linked package directory
 */
function resolvePackagePath(packageName) {
  try {
    const pkgJson = require.resolve(`${packageName}/package.json`);
    return path.dirname(pkgJson);
  } catch {
    return null;
  }
}

/**
 * Try to find the ideSync modules directory
 */
function resolveIdeSyncDir() {
  // 1. Via npm link: @aios/infrastructure
  const infraPath = resolvePackagePath('@aios/infrastructure');
  if (infraPath) {
    const ideSyncDir = path.join(infraPath, 'scripts', 'ide-sync');
    if (fs.existsSync(ideSyncDir)) return ideSyncDir;
  }

  // 2. Relative path (running from monorepo)
  const localPath = path.join(__dirname, '..', '.aios-core', 'infrastructure', 'scripts', 'ide-sync');
  if (fs.existsSync(localPath)) return localPath;

  return null;
}

/**
 * Try to find the agents source directory
 */
function resolveAgentsDir() {
  // 1. Via npm link: @aios/development
  const devPath = resolvePackagePath('@aios/development');
  if (devPath) {
    const agentsDir = path.join(devPath, 'agents');
    if (fs.existsSync(agentsDir)) return agentsDir;
  }

  // 2. Relative path (running from monorepo)
  const localPath = path.join(__dirname, '..', '.aios-core', 'development', 'agents');
  if (fs.existsSync(localPath)) return localPath;

  return null;
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ── Main ──────────────────────────────────────────────

function main() {
  const projectRoot = process.cwd();

  console.log(`${c.bold}${c.blue}🔄 AIOS Agent Sync${c.reset}`);
  console.log(`${c.dim}Project: ${projectRoot}${c.reset}`);
  console.log('');

  // Resolve ideSync modules
  const ideSyncDir = resolveIdeSyncDir();
  if (!ideSyncDir) {
    console.error(`${c.red}✗ Could not find ideSync modules.${c.reset}`);
    console.error(`  Run: ${c.cyan}npm link @aios/infrastructure${c.reset}`);
    process.exit(1);
  }

  // Resolve agents directory
  const agentsDir = resolveAgentsDir();
  if (!agentsDir) {
    console.error(`${c.red}✗ Could not find AIOS agents.${c.reset}`);
    console.error(`  Run: ${c.cyan}npm link @aios/development${c.reset}`);
    process.exit(1);
  }

  console.log(`${c.dim}Agents:  ${agentsDir}${c.reset}`);
  console.log(`${c.dim}ideSync: ${ideSyncDir}${c.reset}`);
  console.log('');

  // Load ideSync modules
  const { parseAllAgents } = require(path.join(ideSyncDir, 'agent-parser'));
  const { generateAllRedirects, writeRedirects } = require(path.join(ideSyncDir, 'redirect-generator'));

  // Load transformers
  const transformers = {
    'full-markdown-yaml': require(path.join(ideSyncDir, 'transformers', 'claude-code')),
    'condensed-rules': require(path.join(ideSyncDir, 'transformers', 'cursor')),
    'xml-tagged-markdown': require(path.join(ideSyncDir, 'transformers', 'windsurf')),
    'project-rules': require(path.join(ideSyncDir, 'transformers', 'trae')),
    'cursor-style': require(path.join(ideSyncDir, 'transformers', 'antigravity')),
  };

  // Parse all agents
  const agents = parseAllAgents(agentsDir);
  console.log(`${c.dim}Found ${agents.length} agents${c.reset}`);
  console.log('');

  // Determine which IDEs to sync
  let targets = Object.entries(IDE_TARGETS);

  if (flags.ide) {
    // Specific IDE
    targets = targets.filter(([name]) => name === flags.ide);
    if (targets.length === 0) {
      console.error(`${c.red}✗ Unknown IDE: ${flags.ide}${c.reset}`);
      console.error(`  Available: ${Object.keys(IDE_TARGETS).join(', ')}`);
      process.exit(1);
    }
    // Enable it even if default is disabled
    targets = targets.map(([name, config]) => [name, { ...config, enabled: true }]);
  } else if (flags.all) {
    // All IDEs
    targets = targets.map(([name, config]) => [name, { ...config, enabled: true }]);
  }
  // Default: only claude-code + antigravity (already enabled)

  let totalAgents = 0;
  let totalRedirects = 0;

  for (const [ideName, ideConfig] of targets) {
    if (!ideConfig.enabled) continue;

    const targetDir = path.join(projectRoot, ideConfig.path);
    const transformer = transformers[ideConfig.format];

    if (!transformer) {
      console.error(`${c.yellow}⚠ No transformer for format: ${ideConfig.format}${c.reset}`);
      continue;
    }

    console.log(`${c.cyan}📁 ${ideName}${c.reset} → ${ideConfig.path}`);

    // Sync agents
    let agentCount = 0;
    let errorCount = 0;

    for (const agent of agents) {
      if (agent.error && (agent.error === 'Failed to parse YAML' || agent.error === 'No YAML block found')) {
        errorCount++;
        continue;
      }

      try {
        const content = transformer.transform(agent);
        const filename = transformer.getFilename(agent);
        const targetPath = path.join(targetDir, filename);

        if (!flags.dryRun) {
          ensureDirSync(targetDir);
          fs.writeFileSync(targetPath, content, 'utf8');
        }
        agentCount++;
      } catch (err) {
        console.error(`   ${c.red}✗ ${agent.id}: ${err.message}${c.reset}`);
        errorCount++;
      }
    }

    // Sync redirects
    const redirects = generateAllRedirects(REDIRECTS, targetDir, ideConfig.format);
    const redirectResult = writeRedirects(redirects, flags.dryRun);

    const redirectCount = redirectResult.written.length;
    totalAgents += agentCount;
    totalRedirects += redirectCount;

    const status = errorCount > 0 ? `${c.yellow}⚠${c.reset}` : `${c.green}✓${c.reset}`;
    console.log(`   ${status} ${agentCount} agents, ${redirectCount} redirects${errorCount > 0 ? `, ${errorCount} errors` : ''}`);
  }

  // Summary
  console.log('');
  if (flags.dryRun) {
    console.log(`${c.yellow}Dry run: ${totalAgents} agents + ${totalRedirects} redirects would be written${c.reset}`);
  } else {
    console.log(`${c.green}${c.bold}✓ Synced ${totalAgents} agents + ${totalRedirects} redirects${c.reset}`);
  }
}

main();
