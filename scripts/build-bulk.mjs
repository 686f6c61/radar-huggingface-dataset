#!/usr/bin/env node
/**
 * Construye el bulk models.jsonl.gz a partir de data/ (CI).
 * Cada linea es el JSON de metadatos con la ficha embebida (campo `ficha`).
 *
 * Se escribe en streaming: V8 limita un string a ~512 MiB y el JSONL
 * completo (ficha embebida) ya lo supera, asi que `lines.join('\n')`
 * lanzaba `RangeError: Invalid string length`.
 */
import { readdirSync, readFileSync, mkdirSync, rmSync, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

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

/** Genera una linea JSONL por modelo, leyendo cada fichero bajo demanda. */
function* jsonlLines() {
  for (const file of jsonFiles) {
    const doc = JSON.parse(readFileSync(file, 'utf-8'));
    const mdPath = file.replace(/\.json$/, '.md');
    let ficha = null;
    try {
      const md = readFileSync(mdPath, 'utf-8');
      // Quitar la cabecera "# autor/modelo" que añade el exportador
      ficha = md.replace(/^# [^\n]+\n+/, '');
    } catch (err) {
      // Solo "no existe" es un modelo sin ficha; cualquier otro error de
      // lectura debe romper la CI, no publicar ficha: null en silencio
      if (err.code !== 'ENOENT') throw err;
    }
    yield `${JSON.stringify({ ...doc, ficha })}\n`;
  }
}

mkdirSync(DIST, { recursive: true });

const out = join(DIST, 'models.jsonl.gz');
await pipeline(Readable.from(jsonlLines()), createGzip({ level: 9 }), createWriteStream(out));
console.log(`✔ ${jsonFiles.length} modelos -> ${out}`);
rmSync(join(DIST, 'models.jsonl'), { force: true });
