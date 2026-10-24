// Validación de solo lectura: las pruebas nunca reescriben el banco editorial.
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async()=>{
  const {QUESTION_BANK:bank} = await import('./questions.js');
  const old = /nadie entiende las instrucciones|sin exigir adivinaciones|decida (?:improvisar|asumir)|marcado una distancia temporal y explicar/;
  let total=0;
  for(const game of ['never','whatif','likely']) {
    const unique=new Set();
    for(const audience of ['amigos','familia','solteros','parejas']) for(const level of ['normal','intimo','intenso']) {
      const questions=bank[game][audience][level];
      assert.equal(questions.length,100,`${game}/${audience}/${level}`);
      assert.equal(new Set(questions).size,100,'No debe haber duplicados en la ronda');
      for(const q of questions) {
        assert.equal(typeof q,'string');
        if(game!=='whatif') {
          assert.ok(!old.test(q),`Plantilla anterior: ${q}`);
          assert.ok(q.length<210,`Frase demasiado larga: ${q}`);
          assert.ok(game==='never'?/^Nunca nunca (he |me he )/.test(q):/^¿Quién es más probable que .+\?$/.test(q),q);
          const normalized=q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
          assert.ok(!unique.has(normalized),`Repetición entre modos: ${q}`);
          unique.add(normalized);
        }
        total++;
      }
    }
  }
  const editorial=fs.readFileSync(require('node:path').join(__dirname,'tools/preguntas-editoriales.txt'),'utf8');
  let blocks=0;
  for(const block of editorial.split('@').filter(Boolean)) {
    const [key,...lines]=block.trim().split(/\r?\n/),[game,audience,level]=key.split('/');
    const compiled=lines.join('|').split('|').map(s=>s.trim()).filter(Boolean).map(s=>game==='never'?`Nunca nunca ${s}.`:`¿Quién es más probable que ${s}?`);
    assert.deepEqual(bank[game][audience][level],compiled,`Banco sin compilar: ${key}`);blocks++;
  }
  assert.equal(blocks,24);
  assert.equal(total,3600);
  console.log('Contenido OK: 2,400 preguntas reescritas únicas, 100 por combinación; 1,200 de Qué pasaría si conservadas.');
})().catch(e=>{console.error(e);process.exitCode=1});
