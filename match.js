// Shared series scoring. A tied round awards no victories.
export const SERIES_MODES=['uno','eights','twentyone','highcard','piano','pool','lottery','draw','wands','bombitas'];
export function winsRequired(value=1){const n=Number(value);if(![1,2,3,5].includes(n))throw Error('Elige 1, 2, 3 o 5 victorias.');return n}
export function newSeries(players,required=1){return{wins:Array(players).fill(0),required:winsRequired(required),round:0,champion:null}}
export function scoreRound(series,winners){const s=structuredClone(series);if(s.champion!==null||s.draw)throw Error('La serie terminó.');s.round++;s.draw=false;const valid=[...new Set(winners)].filter(i=>Number.isInteger(i)&&i>=0&&i<s.wins.length);if(valid.length!==1&&s.required===1)s.draw=true;if(valid.length===1){const i=valid[0];s.wins[i]++;if(s.wins[i]>=s.required)s.champion=i}return s}
export function roundWinners(mode,g,players){
 if(['uno','eights','pool','lottery'].includes(mode))return g.winner>=0&&g.winner!==null?[g.winner]:[];
 if(['twentyone','highcard'].includes(mode))return g.winners||[];
 if(mode==='bombitas')return Number.isInteger(g.summary?.winner)?[g.summary.winner]:[];
 let scores;if(mode==='draw')scores=g.scores;else if(mode==='piano')scores=players.map(p=>g.scores?.[p.id]??0);else if(mode==='wands')scores=players.map(p=>Object.values(g.attempts?.[p.id]||{}).filter(Boolean).length);else return[];
 const max=Math.max(...scores);return scores.flatMap((v,i)=>v===max?[i]:[]);
}
