#!/usr/bin/env node
/**
 * Construye el bulk models.jsonl.gz a partir de data/ (CI).
 * Cada linea es el JSON de metadatos con la ficha embebida (campo `ficha`).
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = new URL('..', import.meta.url).pathname;
const DATA = join(ROOT, 'data');
const DIST = join(ROOT, 'dist');

const jsonFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.json')) jsonFiles.push(full);
  }
}
walk(DATA);
jsonFiles.sort();

mkdirSync(DIST, { recursive: true });
const lines = [];
for (const file of jsonFiles) {
  const doc = JSON.parse(readFileSync(file, 'utf-8'));
  const mdPath = file.replace(/\.json$/, '.md');
  let ficha = null;
  try {
    const md = readFileSync(mdPath, 'utf-8');
    // Quitar la cabecera "# autor/modelo" que añade el exportador
    ficha = md.replace(/^# [^\n]+\n+/, '');
  } catch {
    // sin ficha
  }
  lines.push(JSON.stringify({ ...doc, ficha }));
}

const out = join(DIST, 'models.jsonl.gz');
writeFileSync(out, gzipSync(lines.join('\n') + '\n', { level: 9 }));
console.log(`✔ ${jsonFiles.length} modelos -> ${out}`);
rmSync(join(DIST, 'models.jsonl'), { force: true });
