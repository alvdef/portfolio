import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VAULT_DIR = process.env.CONTENT_VAULT_DIR || path.join(ROOT, 'vault');
const MARKER_FILE = path.join(ROOT, 'src/generated/content-sync.json');
const SECTIONS_FILE = path.join(ROOT, 'src/generated/sections.ts');
const GROUPS_FILE = path.join(ROOT, 'src/generated/groups.ts');
const CONTENT_DIR = path.join(ROOT, 'src/content');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

function listFilesRecursively(directory) {
  if (!existsSync(directory)) return [];
  const out = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursively(fullPath));
    } else {
      out.push(fullPath);
    }
  }
  return out;
}

function isRelevant(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.md' || IMAGE_EXTENSIONS.has(ext) || ext === '.yaml' || ext === '.yml';
}

function getSourceHash(files) {
  const hash = crypto.createHash('sha256');
  for (const filePath of files.sort()) {
    hash.update(filePath);
    hash.update(String(statSync(filePath).mtimeMs));
    hash.update(readFileSync(filePath));
  }
  return hash.digest('hex');
}

if (!existsSync(CONTENT_DIR) || !existsSync(SECTIONS_FILE) || !existsSync(GROUPS_FILE) || !existsSync(MARKER_FILE)) {
  throw new Error('Content output missing. Run `npm run sync:content` before dev/build.');
}

if (!existsSync(VAULT_DIR)) {
  throw new Error(`Vault directory missing: ${VAULT_DIR}`);
}

const marker = JSON.parse(readFileSync(MARKER_FILE, 'utf8'));
const currentFiles = listFilesRecursively(VAULT_DIR).filter(isRelevant);
const currentHash = getSourceHash(currentFiles);

if (marker.sourceHash !== currentHash) {
  throw new Error('Content is stale. Re-run `npm run sync:content` before dev/build.');
}

console.log('Content freshness check passed.');
