import fs from 'node:fs';
import {QUESTION_BANK} from '../questions.js';
const source = fs.readFileSync(new URL('./preguntas-editoriales.txt', import.meta.url), 'utf8');
const bank = {never:{}, whatif:QUESTION_BANK.whatif, likely:{}};
const found = new Set();
for (const block of source.split('@').filter(Boolean)) {
  const [key, ...lines] = block.trim().split(/\r?\n/);
  const [game, audience, level] = key.split('/');
  if (!['never','likely'].includes(game) || !['amigos','familia','solteros','parejas'].includes(audience) || !['normal','intimo','intenso'].includes(level) || found.has(key)) throw Error(`Bloque inválido: ${key}`);
  found.add(key);
  const phrases = lines.join('|').split('|').map(s=>s.trim()).filter(Boolean);
  if (phrases.length !== 100 || new Set(phrases).size !== 100) throw Error(`Se necesitan 100 frases distintas: ${key}, recibidas ${phrases.length}`);
  bank[game][audience] ??= {};
  bank[game][audience][level] = phrases.map(s=>game === 'never' ? `Nunca nunca ${s}.` : `¿Quién es más probable que ${s}?`);
}
if (found.size !== 24) throw Error('Faltan bloques editoriales');
fs.writeFileSync(new URL('../questions.js', import.meta.url), '// Español. Nunca nunca y Más probable: 2,400 frases editoriales, sin combinaciones automáticas.\n// Los niveles se adaptan al público. Siempre se puede saltar una pregunta.\nexport const QUESTION_BANK = '+JSON.stringify(bank,null,2)+';\n');
console.log('2,400 preguntas editoriales compiladas; Qué pasaría si se conserva.');
