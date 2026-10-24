import {EN,GUIDE_EN} from './locale-data.js';
import {GUIDES} from './game-guides.js';
for(const [id,lines] of Object.entries(GUIDES))lines.forEach((line,i)=>{EN[line]=GUIDE_EN[id][i]});
const KEY='mundo-language';
export function translate(text,language='en'){
 if(language!=='en'||!text)return text;
 const lead=text.match(/^\s*/)[0],tail=text.match(/\s*$/)[0],raw=text.trim();
 if(EN[raw])return lead+EN[raw]+tail;
 const clean=raw.replace(/^[↓✓♦✦♡↻]\s*/, '').replace(/\s*↗$/, '');
 if(EN[clean])return lead+raw.replace(clean,EN[clean])+tail;
 const patterns=[[/^Turno de (.+)$/,m=>`${m[1]}'s turn`],[/^Juega (.+)$/,m=>`${m[1]} is playing`],[/^Ganó (.+)$/,m=>`${m[1]} won`],[/^(.+) gana esta ronda\.$/,m=>`${m[1]} wins this round.`],[/^Crear (.+)$/,m=>`Create ${EN[m[1]]||m[1]}`],[/^Jugar (.+)$/,m=>`Play ${EN[m[1]]||m[1]}`],[/^Color actual: (.+)$/,m=>`Current color: ${EN[m[1]]||m[1]}`],[/^Pregunta (\d+) de (\d+) · Sin repeticiones en esta ronda\.$/,m=>`Question ${m[1]} of ${m[2]} · No repeats this round.`],[/^(\d+) intercambios · Pulsa dos piezas para cambiarlas\.$/,m=>`${m[1]} swaps · Tap two pieces to swap them.`],[/^Casilla (\d+)(.*)$/,m=>`Cell ${m[1]}${m[2]}`],[/^Pieza en posición (\d+)$/,m=>`Piece in position ${m[1]}`],[/^Carril (\d+), tecla (.+)$/,m=>`Lane ${m[1]}, key ${m[2]}`],[/^(\d+)–(\d+) · local \/ en línea$/,m=>`${m[1]}–${m[2]} · local / online`],[/^(\d+)–(\d+) · local \/ sala en línea$/,m=>`${m[1]}–${m[2]} · local / online`],[/^(\d+)–(\d+) · por turnos locales$/,m=>`${m[1]}–${m[2]} · local turns`],[/^(\d+) local · (\d+)–(\d+) en sala$/,m=>`${m[1]} local · ${m[2]}–${m[3]} in a room`],[/^(\d+) local · (\d+)–(\d+) en línea$/,m=>`${m[1]} local · ${m[2]}–${m[3]} online`],[/^(\d+) · local \/ sala en línea$/,m=>`${m[1]} · local / online room`],[/^(\d+) · local \/ en línea$/,m=>`${m[1]} · local / online`]];
 for(const [re,render] of patterns){const match=raw.match(re);if(match)return lead+render(match)+tail}
 // Split interface separators, while preserving names and numerical values.
 if(raw.includes(' · ')){const parts=raw.split(' · ');const out=parts.map(p=>EN[p]||p);if(out.some((v,i)=>v!==parts[i]))return lead+out.join(' · ')+tail}
 return text;
}
export function installLocale(doc=document,storage=localStorage){
 let language='es';try{language=storage.getItem(KEY)==='en'?'en':'es'}catch{}
 const sources=new WeakMap();
 const skip='script,style,textarea,[translate="no"],.question,.player-tags,.guess-messages,.profile-preview h2,.profile-preview p,.posts article h3,.posts article p,.posts article small';
 function textNode(node){if(!node.parentElement||node.parentElement.closest(skip))return;const old=sources.get(node);const source=old&&node.nodeValue===old.output?old.source:node.nodeValue;const output=translate(source,language);sources.set(node,{source,output});if(output!==node.nodeValue){if(node.parentElement.tagName==='OPTION'&&!node.parentElement.hasAttribute('value'))node.parentElement.value=source;node.nodeValue=output}}
 function attributes(el){if(el.closest(skip))return;for(const attr of ['aria-label','placeholder','title']){if(!el.hasAttribute(attr))continue;let map=sources.get(el);if(!map){map={};sources.set(el,map)}const value=el.getAttribute(attr),old=map[attr],source=old&&old.output===value?old.source:value,output=translate(source,language);map[attr]={source,output};if(value!==output)el.setAttribute(attr,output)}}
 function scan(root){if(root.nodeType===3){textNode(root);return}if(root.nodeType!==1)return;attributes(root);const walker=doc.createTreeWalker(root,4);let n;while((n=walker.nextNode()))textNode(n);for(const el of root.querySelectorAll('[aria-label],[placeholder],[title]'))attributes(el)}
 const label=doc.createElement('label');label.className='language-control';label.innerHTML='<span>Idioma</span><select id="language" aria-label="Idioma"><option value="es" translate="no">Español</option><option value="en" translate="no">English</option></select>';
 doc.querySelector('header').append(label);const select=label.querySelector('select');select.value=language;
 const note=doc.createElement('p');note.className='language-note';note.textContent='La interfaz cambia de idioma. Las preguntas y el contenido de los jugadores conservan su idioma original.';doc.querySelector('footer').append(note);
 function paint(){for(const choice of doc.querySelectorAll('[data-language-choice]'))choice.value=language;doc.documentElement.lang=language;doc.title=translate('Una parte de Nuestro Mundo · J&J',language);scan(doc.body)}
 const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='childList')for(const n of r.addedNodes)scan(n);else if(r.type==='characterData')textNode(r.target);else attributes(r.target)}});observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
 select.onchange=()=>{language=select.value==='en'?'en':'es';try{storage.setItem(KEY,language)}catch{}paint()};paint();
 return {get language(){return language},translate:s=>translate(s,language)};
}
