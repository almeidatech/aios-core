#!/usr/bin/env node

/**
 * Link all @aios/* workspace packages globally for consumption by external projects.
 *
 * Usage:
 *   node scripts/link-all.js          # Link all packages
 *   node scripts/link-all.js --dry-run # Show what would be linked
 *
 * In consuming projects:
 *   npm link @aios/core @aios/cli @aios/infrastructure @aios/installer @aios/wizard
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

// Read workspaces from package.json
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const workspacePaths = rootPkg.workspaces || [];

const packages = [];

for (const wsPattern of workspacePaths) {
  if (wsPattern.includes('*')) {
    // Glob pattern like "packages/*"
    const baseDir = path.join(ROOT, wsPattern.replace('/*', ''));
    if (fs.existsSync(baseDir)) {
      for (const dir of fs.readdirSync(baseDir)) {
        const pkgJsonPath = path.join(baseDir, dir, 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
          packages.push({ name: pkg.name, dir: path.join(baseDir, dir) });
        }
      }
    }
  } else {
    // Explicit path like ".aios-core/core"
    const pkgJsonPath = path.join(ROOT, wsPattern, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      packages.push({ name: pkg.name, dir: path.join(ROOT, wsPattern) });
    }
  }
}

console.log('\n  AIOS Monorepo - Link All Packages\n');
console.log(`  Found ${packages.length} workspace packages:\n`);

const linked = [];
const failed = [];

for (const pkg of packages) {
  const relative = path.relative(ROOT, pkg.dir);
  process.stdout.write(`  ${pkg.name} (${relative})`);

  if (dryRun) {
    console.log(' -> would link');
    linked.push(pkg.name);
  } else {
    try {
      execSync('npm link', { cwd: pkg.dir, stdio: 'pipe' });
      console.log(' -> linked');
      linked.push(pkg.name);
    } catch (err) {
      console.log(` -> FAILED: ${err.message.split('\n')[0]}`);
      failed.push(pkg.name);
    }
  }
}

console.log('');

if (failed.length > 0) {
  console.log(`  ${failed.length} package(s) failed to link.`);
}

if (linked.length > 0) {
  console.log(dryRun ? '  (dry run - no links created)\n' : '');
  console.log('  To use in other projects, run:\n');
  console.log(`  npm link ${linked.join(' ')}\n`);
}
