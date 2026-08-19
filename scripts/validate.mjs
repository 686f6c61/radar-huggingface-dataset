#!/usr/bin/env node
/**
 * Validador del dataset (CI). Sin dependencias: Node 22+.
 * Recorre data/ e index.json y comprueba integridad, schema y emparejado
 * de ficheros. Sale con codigo 1 si hay cualquier error.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DATA = join(ROOT, 'data');

const errors = [];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const LICENSE_FAMILIES = new Set(['oss', 'non-commercial', 'unknown']);

function fail(msg) {
  errors.push(msg);
}

function isStr(v) { return typeof v === 'string'; }
function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function isBool(v) { return typeof v === 'boolean'; }
function isArr(v) { return Array.isArray(v); }
function isNullOr(t) { return (v) => v === null || t(v); }

const CHECKS = [
  ['schema', (v) => v === 1, 'schema debe ser 1'],
  ['id', (v) => isStr(v) && v.includes('/'), 'id debe ser "autor/modelo"'],
  ['slug', (v) => isStr(v) && /^[a-z0-9_-]+$/.test(v), 'slug invalido'],
  ['author', isStr, 'author debe ser string'],
  ['url', (v) => isStr(v) && v.startsWith('https://huggingface.co/'), 'url invalida'],
  ['created_at', isNullOr(isStr), 'created_at debe ser string|null'],
  ['updated_at', isNullOr(isStr), 'updated_at debe ser string|null'],
  ['license', isNullOr(isStr), 'license debe ser string|null'],
  ['license_family', (v) => LICENSE_FAMILIES.has(v), 'license_family invalido'],
  ['pipeline_tag', isNullOr(isStr), 'pipeline_tag debe ser string|null'],
  ['library', isNullOr(isStr), 'library debe ser string|null'],
  ['languages', isArr, 'languages debe ser array'],
  ['tags', isArr, 'tags debe ser array'],
  ['likes', (v) => isNum(v) && v >= 0, 'likes debe ser numero >= 0'],
  ['downloads_30d', (v) => isNum(v) && v >= 0, 'downloads_30d debe ser numero >= 0'],
  ['trending_score', isNum, 'trending_score debe ser numero'],
  ['parameters', isNullOr(isNum), 'parameters debe ser numero|null'],
  ['parameters_human', isNullOr(isStr), 'parameters_human debe ser string|null'],
  ['storage_bytes', isNullOr(isNum), 'storage_bytes debe ser numero|null'],
  ['storage_human', isNullOr(isStr), 'storage_human debe ser string|null'],
  ['base_model', isNullOr(isStr), 'base_model debe ser string|null'],
  ['formats', (v) => isArr(v) && v.every(isStr), 'formats debe ser array de strings'],
  ['is_conversational', isBool, 'is_conversational debe ser boolean'],
  ['gated', isBool, 'gated debe ser boolean'],
  ['removed', isBool, 'removed debe ser boolean'],
  ['removed_at', isNullOr(isStr), 'removed_at debe ser string|null'],
  ['benchmarks', isArr, 'benchmarks debe ser array'],
  [
    'sources',
    (v) =>
      isArr(v) &&
      v.every(
        (s) =>
          s && isStr(s.title) && isStr(s.url) && /^https?:\/\//.test(s.url),
      ),
    'sources debe ser array de {title,url} validos',
  ],
];

const jsonFiles = [];
const mdFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.json')) {
      jsonFiles.push(full);
    } else if (entry.name.endsWith('.md')) {
      mdFiles.push(full);
    }
  }
}

console.log('→ Recorriendo data/...');
walk(DATA);
console.log(`  ${jsonFiles.length} JSON · ${mdFiles.length} MD`);

// 1. Validacion de cada JSON
let validated = 0;
for (const file of jsonFiles) {
  const rel = relative(ROOT, file);
  if (statSync(file).size > MAX_FILE_BYTES) {
    fail(`${rel}: supera 5MB`);
    continue;
  }
  let doc;
  try {
    doc = JSON.parse(readFileSync(file, 'utf-8'));
  } catch (err) {
    fail(`${rel}: JSON invalido (${err.message})`);
    continue;
  }
  for (const [field, check, msg] of CHECKS) {
    if (!check(doc[field])) {
      fail(`${rel}: ${msg} (valor: ${JSON.stringify(doc[field])?.slice(0, 80)})`);
    }
  }
  // Coherencia ruta <-> contenido
  const parts = rel.split('/');
  const authorDir = parts[parts.length - 2];
  if (doc.author && doc.author.toLowerCase() !== authorDir.toLowerCase()) {
    fail(`${rel}: author "${doc.author}" no coincide con el directorio`);
  }
  if (doc.id && !rel.endsWith('.json')) fail(`${rel}: extension rara`);
  validated++;
}

// 2. Emparejado JSON <-> MD
const jsonSet = new Set(jsonFiles.map((f) => f.replace(/\.json$/, '')));
const mdSet = new Set(mdFiles.map((f) => f.replace(/\.md$/, '')));
for (const base of jsonSet) {
  if (!mdSet.has(base)) fail(`${base}: falta el .md hermano`);
}
for (const base of mdSet) {
  if (!jsonSet.has(base)) fail(`${base}: falta el .json hermano`);
}

// 3. MD no vacio y con cabecera
for (const file of mdFiles) {
  const content = readFileSync(file, 'utf-8');
  const rel = relative(ROOT, file);
  if (content.trim().length < 20) fail(`${rel}: MD practicamente vacio`);
  if (!content.startsWith('# ')) fail(`${rel}: MD no empieza por cabecera '# '`);
}

// 4. index.json consistente
const indexPath = join(ROOT, 'index.json');
if (!existsSync(indexPath)) {
  fail('index.json no existe');
} else {
  let index;
  try {
    index = JSON.parse(readFileSync(indexPath, 'utf-8'));
  } catch (err) {
    fail(`index.json: JSON invalido (${err.message})`);
  }
  if (index) {
    if (index.schema !== 1) fail('index.json: schema debe ser 1');
    if (!isArr(index.entries)) fail('index.json: entries debe ser array');
    else {
      if (index.models !== index.entries.length) {
        fail(`index.json: models (${index.models}) != entries (${index.entries.length})`);
      }
      if (index.entries.length !== jsonFiles.length) {
        fail(`index.json: ${index.entries.length} entradas pero hay ${jsonFiles.length} JSON en data/`);
      }
      const slugsInIndex = new Set(index.entries.map((e) => e.slug));
      if (slugsInIndex.size !== index.entries.length) {
        fail('index.json: slugs duplicados');
      }
      for (const file of jsonFiles) {
        let doc;
        try {
          doc = JSON.parse(readFileSync(file, 'utf-8'));
        } catch {
          continue;
        }
        if (doc.slug && !slugsInIndex.has(doc.slug)) {
          fail(`${relative(ROOT, file)}: slug "${doc.slug}" no esta en index.json`);
        }
      }
    }
  }
}

// 5. Documentacion obligatoria
for (const doc of ['README.md', 'SCHEMA.md', 'LICENSE', 'CHANGELOG.md']) {
  if (!existsSync(join(ROOT, doc))) fail(`falta ${doc}`);
}

console.log(`  ${validated} JSON validados`);
if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} errores:`);
  for (const e of errors.slice(0, 30)) console.error(`  - ${e}`);
  if (errors.length > 30) console.error(`  ... y ${errors.length - 30} mas`);
  process.exit(1);
}
console.log('\n✔ Dataset valido');
