import assert from 'node:assert/strict';
import {poolRack,poolShot,poolPlace}from '../pool-engine.js';
import {BombitasEngine as B}from '../vendor/bombitas-engine.js';
const rack=poolRack();assert.equal(rack.balls.length,16);assert.equal(rack.balls.filter(b=>b.active).length,16);
for(const angle of [0,.1,.5,1,2,3,4,5]){const {game,frames}=poolShot(rack,angle,.75);assert.ok(frames.length>1);assert.equal(game.balls.length,16);assert.ok(game.balls.every(b=>Number.isFinite(b.x)&&Number.isFinite(b.y)));assert.equal(game.shots,1);assert.equal(rack.shots,0)}
const foul=poolShot(rack,Math.PI,.2).game;assert.equal(foul.inhand,true);assert.equal(foul.turn,1);assert.throws(()=>poolPlace(foul,650,250));assert.equal(poolPlace(foul,200,200).inhand,false);assert.throws(()=>poolShot(foul,0,.5));
const g=B.create(()=>.5,{seconds:30});assert.equal(g.players.length,2);assert.equal(B.input(g,0,null,true),'placed');for(let i=0;i<150;i++)B.tick(g,16,()=>.5);assert.equal(g.players[0].alive,false);assert.equal(g.over,true);assert.equal(g.winner,1);
console.log('Billar y Bombitas: saque, simulación, falta, bola en mano y explosión: OK');
