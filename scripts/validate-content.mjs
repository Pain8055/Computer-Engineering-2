#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateContentGraph } from '../content/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(root, 'content');

async function readJsonIfPresent(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function main() {
  const collections = {};
  const files = {
    programme: 'syllabus/programme.json',
    scheme: 'syllabus/schemes.json',
    semester: 'syllabus/semesters.json',
    subject: 'syllabus/subjects.json',
    unit: 'syllabus/units.json',
    topic: 'syllabus/topics.json',
    pyq: 'pyqs/index.json',
    resource: 'resources/index.json',
    note: 'notes/index.json',
    practice: 'practice/index.json'
  };

  for (const [type, relativePath] of Object.entries(files)) {
    const value = await readJsonIfPresent(path.join(contentRoot, relativePath));
    if (value === null) continue;
    collections[type] = Array.isArray(value) ? value : value.records ?? [];
  }

  const errors = validateContentGraph(collections);
  if (errors.length) {
    console.error(`ByteCore content validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`ByteCore content validation passed (${Object.values(collections).flat().length} records).`);
}

await main();
