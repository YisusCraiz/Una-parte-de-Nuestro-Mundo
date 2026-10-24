import assert from 'node:assert/strict';
import {translate} from '../locale.js';
import {GUIDES} from '../game-guides.js';
import {EN,GUIDE_EN} from '../locale-data.js';
assert.equal(translate(' Iniciar sesión ↗ '),' Sign in ↗ ');
assert.equal(translate('Crear cuenta','es'),'Crear cuenta');
assert.equal(translate('Turno de Julissa'),"Julissa's turn");
assert.equal(translate('Jugar Última carta'),'Play Last Card');
assert.equal(translate('2–6 · local / en línea'),'2–6 · local / online');
assert.equal(translate('Mi mensaje personal sin traducción'),'Mi mensaje personal sin traducción');
assert.equal(translate('Jesús & Julissa'),'Jesús & Julissa');
for(const [id,lines] of Object.entries(GUIDES)){assert.equal(GUIDE_EN[id].length,lines.length);lines.forEach((line,i)=>assert.equal(translate(line),GUIDE_EN[id][i]))}
for(const text of ['Nombre de usuario','Contraseña','¿Cómo empiezo?','Bienvenido a Nuestro Mundo','Explorar sin cuenta'])assert.notEqual(translate(text),text);
for(const [key,value] of Object.entries(EN)){assert.equal(typeof value,'string');assert.ok(value.length,key)}
console.log('Idioma: acceso, navegación, 16 guías, turnos, preferencias y contenido original: OK');

// The startup gate must not interrupt a saved session or an activation link.
const {readFileSync}=await import('node:fs');
const {runInNewContext}=await import('node:vm');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const welcome=app.slice(app.indexOf('function welcome()'),app.indexOf('function authDialog'));
for(const [user,opened,hash] of [[{id:'saved'},false,''],[null,true,''],[null,false,'#activar?usuario=yisus']]){
 runInNewContext('('+welcome+')()',{api:{user},modal:{open:opened},location:{hash},gameFeel:{clear(){throw Error('Must not open welcome')}}});
}
assert.ok(app.includes('restoreAccount().finally(welcome)'));
console.log('Bienvenida: respeta sesión guardada, ventana abierta y enlace de activación: OK');
