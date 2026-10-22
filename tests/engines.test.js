import assert from 'node:assert/strict';
import {makeUno,unoAction,unoLegal,makeEights,eightsAction,tttWinner,blackjackValue} from '../engines.js';
assert.equal(tttWinner(['X','X','X',null,'O',null,'O',null,null]),'X');
assert.equal(tttWinner(['X','O','X','X','O','O','O','X','X']),'draw');
assert.equal(blackjackValue([0,13,9]),12);assert.equal(blackjackValue([0,12]),21);
for(let n=2;n<=6;n++){const g=makeUno(n);assert.equal(g.hands.length,n);assert.ok(g.hands.every(h=>h.length===7));assert.equal(g.pile.length+g.discard.length+g.hands.flat().length,108);const e=makeEights(n);assert.equal(e.pile.length+e.discard.length+e.hands.flat().length,52)}
const base={kind:'uno',hands:[['r5','b3'],['b2'],['y2']],pile:['r1','g2','b6'],discard:['r3'],color:'r',turn:0,direction:1,winner:null};
assert.equal(unoLegal(base,'b3'),true);assert.equal(unoLegal(base,'g4'),false);assert.equal(unoAction(base,'play',0).turn,1);assert.equal(base.hands[0].length,2,'La acción no debe mutar el estado anterior');
const penal=structuredClone(base);penal.hands[0]=['rd','r1'];const p=unoAction(penal,'play',0);assert.equal(p.turn,2);assert.equal(p.hands[1].length,3);
const reverse=structuredClone(base);reverse.hands= [['rv','b1'],['g1']];assert.equal(unoAction(reverse,'play',0).turn,0);
const wild=structuredClone(base);wild.hands[0]=['w4','r1'];assert.equal(unoLegal(wild,'w4'),false);assert.throws(()=>unoAction(wild,'play',0,'b'));
const win=structuredClone(base);win.hands[0]=['r5'];assert.equal(unoAction(win,'play',0).winner,0);
const recycle={kind:'eights',hands:[[0],[2]],pile:[],discard:[3,4,5],suit:0,turn:0,winner:null,blocked:0};const r=eightsAction(recycle,'draw');assert.equal(r.hands[0].length,2);assert.equal(r.discard.length,1);
// Jugar partidas completas detecta bloqueos, corrupción del mazo y turnos inválidos.
for(let n=2;n<=6;n++){for(let round=0;round<10;round++){let g=makeUno(n),moves=0;while(g.winner===null&&moves++<5000){const i=g.hands[g.turn].findIndex(c=>unoLegal(g,c));g=unoAction(g,i<0?'draw':'play',i,'r');assert.ok(g.turn>=0&&g.turn<n);assert.equal(g.pile.length+g.discard.length+g.hands.flat().length,108)}assert.notEqual(g.winner,null,'La partida debe poder terminar')}}
console.log('Motores: ganador, reparto 2–6, penalizaciones, comodines, reciclado y 50 partidas completas: OK');
