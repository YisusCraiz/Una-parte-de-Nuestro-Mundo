const base=new URL('./',import.meta.url),button=document.querySelector('#install-app'),help=document.querySelector('#install-help'),status=document.querySelector('#install-status');
let promptEvent=null,registration=null,updating=false;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function paint(){button.textContent=standalone()?'✓ App instalada':'↓ Instalar app';button.disabled=standalone()}
function notice(text){const el=document.querySelector('#toast');el.textContent=text;setTimeout(()=>{if(el.textContent===text)el.textContent=''},6000)}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;paint()});
window.addEventListener('appinstalled',()=>{promptEvent=null;paint();notice('Nuestro Mundo ya tiene su lugar en tu teléfono. ♡')});
matchMedia('(display-mode: standalone)').addEventListener?.('change',paint);
button.onclick=async()=>{if(standalone())return;if(promptEvent){const event=promptEvent;promptEvent=null;await event.prompt();await event.userChoice;paint();return}help.showModal()};
help.querySelector('[data-install-close]').onclick=()=>help.close();
function offerUpdate(){const next=document.querySelector('#update-app');next.hidden=false;next.onclick=async()=>{if(document.querySelector('#modal')?.open){notice('Termina o cierra tu partida antes de actualizar.');return}if(registration?.waiting){updating=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'})}else location.reload()}}
if('serviceWorker'in navigator){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating)location.reload()});
 navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname,updateViaCache:'none'}).then(reg=>{registration=reg;if(reg.waiting)offerUpdate();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)offerUpdate()})});navigator.serviceWorker.ready.then(()=>{status.textContent='Los juegos de este dispositivo pueden abrirse sin conexión después de la primera carga. Las cuentas, monedas y salas necesitan internet.'})}).catch(()=>{status.textContent='Puedes añadir la app a tu pantalla de inicio. El modo sin conexión no está disponible en este navegador.'});
 const refresh=document.querySelector('#refresh');refresh.onclick=async()=>{if(document.querySelector('#modal')?.open){notice('Cierra la partida antes de actualizar.');return}try{await registration?.update()}catch{}if(registration?.waiting){updating=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'})}else location.reload()};
}
window.addEventListener('offline',()=>notice('Sin conexión. Puedes seguir con los juegos locales; las salas y monedas volverán al reconectarte.'));
window.addEventListener('online',()=>notice('Ya tienes conexión otra vez.'));
paint();
