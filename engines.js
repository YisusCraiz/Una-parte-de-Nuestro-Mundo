export function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const buf=new Uint32Array(1);crypto.getRandomValues(buf);const j=buf[0]%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
export function tttWinner(board){for(const [a,b,c] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]])if(board[a]&&board[a]===board[b]&&board[a]===board[c])return board[a];return board.every(Boolean)?'draw':null}
export function makeUno(n,{hand=7,stackDrawTwo=false}={}){if(!Number.isInteger(n)||n<2||n>6)throw Error('Se necesitan de 2 a 6 jugadores.');const deck=[];for(const color of ['r','b','g','y']){deck.push(color+'0');for(let i=0;i<2;i++)for(const rank of ['1','2','3','4','5','6','7','8','9','s','v','d'])deck.push(color+rank)}for(let i=0;i<4;i++)deck.push('w*','w4');const pile=shuffle(deck),hands=Array.from({length:n},()=>pile.splice(0,hand));let idx=pile.findIndex(c=>/^[rbgy][0-9]$/.test(c)),top=pile.splice(idx,1)[0];return{kind:'uno',stackDrawTwo:stackDrawTwo===true,pendingDraw:0,unoPending:null,hands,pile,discard:[top],color:top[0],turn:0,direction:1,winner:null,log:'La partida empieza con una carta numérica.'}}
function draw(g,n,player=g.turn){while(n-->0){if(!g.pile.length){g.pile=shuffle(g.discard.slice(0,-1));g.discard=g.discard.slice(-1)}if(!g.pile.length)break;g.hands[player].push(g.pile.pop())}}
export function unoLegal(g,c){const top=g.discard.at(-1);if(g.pendingDraw)return g.stackDrawTwo&&c[1]==='d';if(c==='w4')return !g.hands[g.turn].some(v=>v[0]===g.color);return c[0]==='w'||c[0]===g.color||c.slice(1)===top.slice(1)}
export function unoAction(old,action,index,color,actor=old.turn){
 const g=structuredClone(old);if(g.winner!==null)throw Error('La partida terminó.');
 const n=g.hands.length;if(!Number.isInteger(actor)||actor<0||actor>=n)throw Error('Jugador inválido.');
 if(action==='uno'||action==='catch_uno'){
  const target=g.unoPending;if(!Number.isInteger(target)||g.hands[target].length!==1)throw Error('No hay un UNO pendiente.');
  if(action==='uno'){if(actor!==target)throw Error('Solo puedes anunciar tu propio UNO.');g.log='¡UNO!';}
  else{if(actor===target)throw Error('No puedes reclamarte a ti mismo.');draw(g,2,target);g.log='¡No dijo UNO! Roba dos cartas.';}
  g.unoPending=null;return g;
 }
 if(actor!==g.turn)throw Error('Todavía no es tu turno.');
 if(!['draw','play'].includes(action))throw Error('Acción inválida.');
 const next=()=>g.turn=(g.turn+g.direction+n)%n;
 if(action==='draw'){const count=g.pendingDraw||1;draw(g,count);g.pendingDraw=0;g.unoPending=null;g.log=count>1?'Robó '+count+' cartas acumuladas y pasó el turno.':'Robó una carta y pasó el turno.';next();return g}
 const c=g.hands[g.turn][index];if(!c||!unoLegal(g,c))throw Error(g.pendingDraw?'Debes acumular otro +2 o robar la penalización.':'Esa carta no coincide con el color ni el símbolo.');
 if(c[0]==='w'&&!['r','b','g','y'].includes(color))throw Error('Elige un color.');
 g.unoPending=null;const who=g.turn;g.hands[who].splice(index,1);g.discard.push(c);g.color=c[0]==='w'?color:c[0];g.log='Carta jugada.';
 if(!g.hands[who].length){g.winner=who;return g}
 if(c[1]==='v')g.direction*=-1;next();
 if(c[1]==='d'&&g.stackDrawTwo){g.pendingDraw=(g.pendingDraw||0)+2;g.log='Hay '+g.pendingDraw+' cartas acumuladas.';}
 else if(c[1]==='d'||c==='w4'){draw(g,c==='w4'?4:2);next();g.log='Penalización aplicada; el siguiente jugador pierde turno.'}
 else if(c[1]==='s'||(c[1]==='v'&&n===2))next();
 if(g.hands[who].length===1){g.unoPending=who;g.log+=' Debe decir ¡UNO!';}return g;
}
export function makeEights(n){if(!Number.isInteger(n)||n<2||n>6)throw Error('Se necesitan de 2 a 6 jugadores.');const pile=shuffle(Array.from({length:52},(_,i)=>i)),hands=Array.from({length:n},()=>pile.splice(0,n>4?5:7));let idx=pile.findIndex(c=>c%13!==7),top=pile.splice(idx,1)[0];return{kind:'eights',hands,pile,discard:[top],suit:Math.floor(top/13),turn:0,winner:null,blocked:0,log:'Combina el palo o el valor. El ocho cambia el palo.'}}
export function eightsLegal(g,c){return c%13===7||Math.floor(c/13)===g.suit||c%13===g.discard.at(-1)%13}
export function eightsAction(old,action,index,suit){const g=structuredClone(old),n=g.hands.length;if(g.winner!==null)throw Error('La partida terminó.');if(action==='draw'){const before=g.hands[g.turn].length;draw(g,1);g.blocked=g.hands[g.turn].length===before?g.blocked+1:0;g.log='Robó una carta y pasó el turno.';if(g.blocked>=n){const lens=g.hands.map(h=>h.length),min=Math.min(...lens);g.winner=lens.filter(v=>v===min).length===1?lens.indexOf(min):-1}}else{const c=g.hands[g.turn][index];if(c===undefined||!eightsLegal(g,c))throw Error('Combina palo o valor, o juega un ocho.');if(c%13===7&&![0,1,2,3].includes(suit))throw Error('Elige un palo.');g.hands[g.turn].splice(index,1);g.discard.push(c);g.suit=c%13===7?suit:Math.floor(c/13);g.blocked=0;if(!g.hands[g.turn].length)g.winner=g.turn}g.turn=(g.turn+1)%n;return g}
export function blackjackValue(hand){let value=0,aces=0;for(const c of hand){const rank=c%13+1;value+=rank===1?11:Math.min(rank,10);if(rank===1)aces++}while(value>21&&aces-->0)value-=10;return value}
export const SUITS=['♣','♦','♥','♠'];export function cardText(c){const r=c%13+1;return({1:'A',11:'J',12:'Q',13:'K'}[r]||r)+' '+SUITS[Math.floor(c/13)]}
