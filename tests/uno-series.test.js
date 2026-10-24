import assert from 'node:assert/strict';
import {makeUno,unoAction,unoLegal} from '../engines.js';
import {newSeries,scoreRound} from '../match.js';
const fixture=()=>({...makeUno(3),hands:[['r5','b3'],['bd','g3'],['y2','gd']],pile:['r1','g2','b6','r7','g8','b9','y4','r0'],discard:['r3'],color:'r',turn:0});
let g=unoAction(fixture(),'play',0);assert.equal(g.unoPending,0);
const announced=unoAction(g,'uno',undefined,undefined,0);assert.equal(announced.unoPending,null);assert.equal(announced.turn,g.turn);assert.throws(()=>unoAction(announced,'catch_uno',undefined,undefined,1));
const caught=unoAction(g,'catch_uno',undefined,undefined,2);assert.equal(caught.hands[0].length,3);assert.equal(caught.turn,g.turn);assert.throws(()=>unoAction(caught,'catch_uno',undefined,undefined,1));assert.throws(()=>unoAction(g,'catch_uno',undefined,undefined,0));assert.throws(()=>unoAction(g,'uno',undefined,undefined,1));
const passed=unoAction(g,'draw');assert.equal(passed.unoPending,null);assert.throws(()=>unoAction(passed,'catch_uno',undefined,undefined,2));assert.equal(g.hands[0].length,1);
g=fixture();g.stackDrawTwo=true;g.hands[0]=['rd','r1'];g=unoAction(g,'play',0);assert.equal(g.pendingDraw,2);assert.equal(g.turn,1);assert.equal(unoLegal(g,'w4'),false);assert.equal(unoLegal(g,'g3'),false);assert.equal(unoLegal(g,'bd'),true);g=unoAction(g,'play',0);assert.equal(g.pendingDraw,4);assert.equal(g.turn,2);g=unoAction(g,'play',1);assert.equal(g.pendingDraw,6);assert.equal(g.turn,0);const before=g.hands[0].length;g=unoAction(g,'draw');assert.equal(g.hands[0].length,before+6);assert.equal(g.pendingDraw,0);assert.equal(g.turn,1);
let s=newSeries(2,2);s=scoreRound(s,[0,1]);assert.deepEqual(s.wins,[0,0]);s=scoreRound(s,[1]);assert.equal(s.champion,null);s=scoreRound(s,[1]);assert.equal(s.champion,1);assert.throws(()=>scoreRound(s,[0]));assert.throws(()=>newSeries(2,100));
// Real Edge Function handler, fake Auth and transactional RPC; no network or real accounts.
let room,actor='a';const fetchBefore=globalThis.fetch,denoBefore=globalThis.Deno;
globalThis.Deno={env:{get:()=> 'test'},serve:()=>{}};
globalThis.fetch=async(url,opts)=>{if(url.endsWith('/auth/v1/user'))return Response.json({id:actor});if(url.endsWith('/rest/v1/rpc/mundo_session')){const p=JSON.parse(opts.body);if(p.p_action==='commit'){if(p.p_revision!==room.revision)return Response.json({message:'STALE'},{status:400});room={...room,state:p.p_state,status:p.p_status,settings:p.p_settings,revision:room.revision+1}}return Response.json(room)}throw Error('No network allowed')};
try{
 const {handle}=await import('../supabase/functions/mundo-room/index.js');
 const send=async(action,extra={},revision=room.revision)=>{const response=await handle(new Request('https://test.invalid',{method:'POST',headers:{Authorization:'Bearer fake'},body:JSON.stringify({action,code:room.code,revision,...extra})}));return response.json()};
 room={code:'ABCDEF12',mode:'uno',host:'a',players:[{id:'a',name:'A'},{id:'b',name:'B'}],settings:{hand:7,winsTo:2,maxPlayers:2,stackDrawTwo:true},status:'lobby',revision:1,state:null};
 await send('start');assert.equal(room.state.stackDrawTwo,true);assert.equal(room.state.series.required,2);
 room.state={...room.state,hands:[['r5','b3'],['g1','b2']],discard:['r3'],color:'r',turn:0};
 let view=await send('play',{index:0});assert.equal(view.game.unoPending,0);assert.equal(view.game.hands,undefined);assert.equal(view.game.hand.length,1);
 const revision=room.revision;actor='b';view=await send('catch_uno');assert.equal(room.state.hands[0].length,3);actor='a';view=await send('uno',{},revision);assert.match(view.message,/STALE/);assert.equal(room.state.hands[0].length,3);
 // Finish two rounds and preserve wins when returning through the lobby.
 room.state.hands[0]=['r7'];room.state.turn=0;room.state.color='r';await send('play',{index:0});assert.equal(room.status,'finished');assert.deepEqual(room.state.series.wins,[1,0]);
 actor='b';view=await send('next_round');assert.ok(view.message);actor='a';view=await send('next_round');assert.equal(view.message,undefined);assert.equal(room.status,'lobby');await send('start');assert.deepEqual(room.state.series.wins,[1,0]);
 room.state.hands[0]=['r7'];room.state.turn=0;room.state.color='r';await send('play',{index:0});assert.equal(room.state.series.champion,0);view=await send('next_round');assert.ok(view.message);await send('rematch');await send('start');assert.deepEqual(room.state.series.wins,[0,0]);
 // Party game series: winner accounting and automatic private view remain compatible.
 room={...room,mode:'lottery',settings:{maxPlayers:2,size:3,win:'line',callSeconds:0,cards:['a','b','c','d','e','f','g','h','i'],winsTo:2},status:'lobby',state:null};await send('start');room.state.called=9;room.state.boards.a=[0,1,2,3,4,5,6,7,8];room.state.marks.a=[0,1];await send('mark',{card:2});assert.equal(room.status,'finished');assert.deepEqual(room.state.series.wins,[1,0]);await send('next_round');await send('start');assert.deepEqual(room.state.series.wins,[1,0]);
 // Acceptance is explicit for each actor, and a forfeit works during a funded series.
 room={...room,mode:'uno',settings:{hand:7,winsTo:1,maxPlayers:2,stake:100},status:'lobby',state:null};
 actor='a';view=await send('start');assert.match(view.message,/aceptar/);view=await send('accept_stake');assert.equal(view.message,undefined);assert.equal(view.economy.consent.a,true);assert.equal(view.game,null);
 actor='b';view=await send('accept_stake');assert.equal(view.economy.consent.b,true);actor='a';view=await send('start');assert.equal(view.status,'playing');actor='b';view=await send('leave');assert.equal(view.status,'finished');assert.equal(view.game.forfeit,1);assert.equal(view.series.champion,0);
 actor='a';room={...room,mode:'highcard',settings:{maxPlayers:2,winsTo:1,stake:100},status:'playing',state:{cards:[0,13],flipped:[false,false],winners:[],series:{wins:[0,0],required:1,round:0,champion:null}}};await send('flip');actor='b';view=await send('flip');assert.equal(view.series.draw,true);actor='a';view=await send('rematch');assert.equal(view.status,'lobby');assert.equal(view.message,undefined);
 console.log('UNO y series: anuncio, reclamo, ventana, +2 acumulados, empate, campeón, revancha, privacidad y carrera STALE: OK');
}finally{globalThis.fetch=fetchBefore;if(denoBefore===undefined)delete globalThis.Deno;else globalThis.Deno=denoBefore}
