const balanceStates=new Map();
export const STAKE_MODES=['uno','eights','highcard','twentyone','pool','lottery','draw'];
export const STAKES=[0,25,50,100,250,500];
export function stakeSettings(mode,input={}){const stake=Number(input.stake??0);if(!STAKES.includes(stake)||stake>0&&!STAKE_MODES.includes(mode))throw Error('Apuesta inválida para este juego.');return {stake,...(stake>0?{maxPlayers:2}:{})}}
export function consentState(room,uid){if(room.status!=='lobby'||!room.settings.stake)throw Error('No hay una apuesta pendiente.');const consent={...(room.state?.economyConsent||{})};consent[uid]=true;return{...(room.state||{}),economyConsent:consent}}
export function stakeFields(mode,settings={}){if(!STAKE_MODES.includes(mode))return '';return `<label>Apuesta por persona · JJV2<select name="stake">${STAKES.map(n=>`<option value="${n}" ${Number(settings.stake||0)===n?'selected':''}>${n===0?'Sin apuesta':n+' JJV2'}</option>`).join('')}</select></label><p class="muted">Con apuesta: duelo de 2 personas. Ambos aceptan antes de empezar. Abandonar pierde la apuesta; una sala caducada devuelve las monedas.</p>`}
export function mountEconomy(container,room,send,refresh){
 const e=room.economy;if(!e)return;const phase=room.status+':'+(e.receipt?.match||'');if(balanceStates.get(room.code)!==phase){balanceStates.set(room.code,phase);if(['playing','finished'].includes(room.status))refresh?.();}const el=document.createElement('section');el.className='economy-panel';
 el.innerHTML='<p class="muted">Premios por serie: ganar 60 · perder 20 · empate 30 JJV2. Mínimo 30 segundos; máximo 400 JJV2 de premios al día. Las partidas locales son de práctica.</p>';
 if(e.stake){el.insertAdjacentHTML('beforeend',`<p class="notice">Apuesta: ${e.stake} JJV2 por persona · Bote: ${e.stake*room.players.length} JJV2</p>`);if(room.status==='lobby'&&!room.series){const accepted=e.consent[room.players[room.me].id];el.insertAdjacentHTML('beforeend',`<p>${room.players.filter(p=>e.consent[p.id]).length}/${room.players.length} aceptaron la apuesta.</p><button class="button pink" data-accept-stake ${accepted?'disabled':''}>${accepted?'Apuesta aceptada':'Aceptar apuesta · '+e.stake+' JJV2'}</button>`);el.querySelector('[data-accept-stake]').onclick=()=>send('accept_stake');}}
 if(e.receipt){const p=e.receipt;el.insertAdjacentHTML('beforeend',`<div class="notice" role="status"><b>Resultado de monedas</b><p>Premio: +${p.reward} JJV2 · Bote / devolución: +${p.pot} JJV2 · Apuesta inicial: ${p.stake} JJV2</p><p>Neto: ${p.reward+p.pot-p.stake} JJV2</p></div>`);}
 container.append(el);
}
