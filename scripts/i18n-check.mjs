// npm run i18n:check — lists the UI strings missing in ar/fr (and plural forms missing in en/fr/ar).
//   tr('key')        → `key` must exist in locales/{ar,fr}/ui.json
//   trn('key', n)    → plural forms `key_one` and `key_other` must exist (Arabic: its CLDR forms one/two/few/many/other)
// Only static string literals are checked (a key built at runtime can't be found by reading the source).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const LOCALES = ['ar', 'fr', 'en'];
const PLURALS = { en: ['one', 'other'], fr: ['one', 'other'], ar: ['zero', 'one', 'two', 'few', 'many', 'other'] };

const files = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? (f === 'locales' ? [] : files(p)) : /\.(ts|tsx)$/.test(f) && !/\.test\./.test(f) ? [p] : [];
  });

const STRING = String.raw`(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)")`;
const TR = new RegExp(String.raw`\btr\(\s*${STRING}`, 'g');
const TRN = new RegExp(String.raw`\btrn\(\s*${STRING}`, 'g');
const unescape = (s) => s.replace(/\\(['"\\])/g, '$1');

const tr = new Map();
const trn = new Map();
for (const file of files(SRC)) {
  const text = readFileSync(file, 'utf8');
  for (const [re, into] of [[TR, tr], [TRN, trn]]) {
    for (const m of text.matchAll(re)) {
      const key = unescape(m[1] ?? m[2]);
      if (!into.has(key)) into.set(key, 'src/' + relative(SRC, file).split(/[\\/]/).join('/'));
    }
  }
}

const problems = [];
for (const lng of LOCALES) {
  const ui = JSON.parse(readFileSync(new URL(`../src/i18n/locales/${lng}/ui.json`, import.meta.url), 'utf8'));
  // English tr() keys are their own text; only its plural forms live in en/ui.json
  if (lng !== 'en') for (const [key, file] of tr) if (!(key in ui)) problems.push(`${lng}: missing "${key}"  (${file})`);
  for (const [key, file] of trn) for (const form of PLURALS[lng]) if (!(`${key}_${form}` in ui)) problems.push(`${lng}: missing plural "${key}_${form}"  (${file})`);
}

console.log(`i18n:check — ${tr.size} tr() keys, ${trn.size} trn() keys, ${LOCALES.join('/')}`);
if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log('OK');
