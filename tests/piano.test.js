import assert from 'node:assert/strict';
import{chart,pianoScore}from '../piano-chart.js';
const a=chart(12345,600,30),b=chart(12345,600,30);assert.deepEqual(a,b);assert.ok(a.length>30);assert.ok(a.every(n=>n.lane>=0&&n.lane<4&&n.time<30000));
const hits=a.map((n,index)=>({index,lane:n.lane,time:n.time}));assert.equal(pianoScore(a,hits),a.length*10);assert.equal(pianoScore(a,[hits[0],hits[0]]),10);assert.equal(pianoScore(a,[{index:0,lane:(a[0].lane+1)%4,time:a[0].time}]),0);assert.equal(pianoScore(a,[{index:0,lane:a[0].lane,time:a[0].time+181}]),0);assert.equal(pianoScore(a,[{index:99999,lane:0,time:0}]),0);assert.throws(()=>pianoScore(a,Array(1001).fill(hits[0])));
console.log('Piano: patrón compartido, ventanas, duplicados y validación de resultados: OK');
