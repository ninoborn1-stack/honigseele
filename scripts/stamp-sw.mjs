// Stempelt die Build-Version in out/sw.js, damit jeder Deploy einen frischen Cache bekommt.
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'out/sw.js';
const stamp = process.env.GITHUB_SHA?.slice(0, 7) ?? Date.now().toString(36);
writeFileSync(file, readFileSync(file, 'utf8').replace('__BUILD__', stamp));
console.log(`sw.js gestempelt: ${stamp}`);
