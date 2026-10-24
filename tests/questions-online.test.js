// Prueba sin red, cuentas ni datos persistentes: la sala debe leer el banco nuevo.
import assert from 'node:assert/strict';
import {QUESTION_BANK} from '../questions.js';
const oldFetch=globalThis.fetch,oldDeno=globalThis.Deno;
let room;
globalThis.Deno={env:{get:()=> 'test-only'},serve:()=>{}};
globalThis.fetch=async(url)=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:'test-host'});
  if(url.endsWith('/rest/v1/rpc/mundo_session'))return Response.json(room);
  throw Error('La prueba no permite red');
};
try{
  const {handle}=await import('../supabase/functions/mundo-room/index.js');
  let checked=0;
  for(const mode of ['never','likely']) for(const audience of ['amigos','familia','solteros','parejas']) for(const level of ['normal','intimo','intenso']) {
    const questions=QUESTION_BANK[mode][audience][level];
    room={code:'ABCDEF12',mode,players:[{id:'test-host',name:'A'},{id:'test-guest',name:'B'}],host:'test-host',settings:{audience,level},status:'playing',revision:1,state:{queue:Array.from({length:100},(_,i)=>i),index:0,votes:{}}};
    for(let i=0;i<100;i++) {
      room.state.index=i;
      const response=await handle(new Request('https://example.invalid',{method:'POST',headers:{Authorization:'Bearer test-token'},body:JSON.stringify({action:'read',code:room.code})}));
      assert.equal(response.status,200);
      const data=await response.json();
      assert.equal(data.game.question,questions[i]);
      assert.equal(data.game.total,100);
      checked++;
    }
  }
  assert.equal(checked,2400);
  console.log('Salas: las 2,400 preguntas editoriales se entregan desde el mismo banco, sin red ni cuentas de prueba.');
}finally{globalThis.fetch=oldFetch;if(oldDeno===undefined)delete globalThis.Deno;else globalThis.Deno=oldDeno;}
