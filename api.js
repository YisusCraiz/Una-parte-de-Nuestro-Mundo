const cfg=window.MUNDO_CONFIG||{};
export const configured=Boolean(/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl)&&cfg.supabasePublishableKey);
let session=null;try{session=JSON.parse(localStorage.getItem('mundo-session')||'null')}catch{}
let refreshing;
const save=s=>{session=s;if(s)localStorage.setItem('mundo-session',JSON.stringify(s));else localStorage.removeItem('mundo-session')};
async function raw(path,body,token,method='POST'){
 const r=await fetch(cfg.supabaseUrl+path,{method,headers:{apikey:cfg.supabasePublishableKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const data=await r.json().catch(()=>null);if(!r.ok){const error=Error(data?.msg||data?.message||data?.error_description||'No se pudo completar la operación.');error.status=r.status;throw error}return data;
}
async function token(){
 if(!session)return null;
 if(Date.now()/1000>(session.expires_at||0)-90){
  refreshing ||= raw('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token}).then(d=>{save({...d,expires_at:Date.now()/1000+d.expires_in});return session.access_token}).catch(e=>{if(e.status===400||e.status===401)save(null);throw e}).finally(()=>refreshing=null);
  return refreshing;
 }return session.access_token;
}
export const api={
 async accessToken(){return token()},
 get user(){return session?.user||null},
 async login(username,password){const d=await raw('/auth/v1/token?grant_type=password',{email:username.toLowerCase()+'@players.jj.invalid',password});save({...d,expires_at:Date.now()/1000+d.expires_in});return d.user},
 async signup(username,password,invitation=null){const d=await raw('/auth/v1/signup',{email:username.toLowerCase()+'@players.jj.invalid',password,data:{username:username.toLowerCase(),...(invitation?{owner_invitation:invitation}:{})}});if(d.access_token)save({...d,expires_at:Date.now()/1000+d.expires_in});return d},
 async logout(){try{await raw('/auth/v1/logout',{},await token())}finally{save(null)}},
 async room(args){return raw('/functions/v1/mundo-room',args,await token())},
 async uploadAudio(path,file){const access=await token();if(!access)throw Error('Inicia sesión.');const r=await fetch(cfg.supabaseUrl+'/storage/v1/object/mundo-audio/'+path,{method:'POST',headers:{apikey:cfg.supabasePublishableKey,Authorization:'Bearer '+access,'Content-Type':file.type||'audio/mpeg'},body:file});const d=await r.json();if(!r.ok)throw Error(d.message||'No se pudo subir el audio.');return d},
 async uploadImage(path,file){const access=await token();if(!access)throw Error('Inicia sesión.');const r=await fetch(cfg.supabaseUrl+'/storage/v1/object/mundo-images/'+path,{method:'POST',headers:{apikey:cfg.supabasePublishableKey,Authorization:'Bearer '+access,'Content-Type':file.type},body:file});const d=await r.json();if(!r.ok)throw Error(d.message||'No se pudo subir la imagen.');return d},
 async signedImage(path){const d=await raw('/storage/v1/object/sign/mundo-images/'+path,{expiresIn:3600},await token());return cfg.supabaseUrl+'/storage/v1'+d.signedURL},
 async signedAudio(path){const d=await raw('/storage/v1/object/sign/mundo-audio/'+path,{expiresIn:3600},await token());return cfg.supabaseUrl+'/storage/v1'+d.signedURL},
 async rpc(name,args={}){if(!configured)throw Error('El servicio de cuentas todavía no está configurado. Puedes jugar en modo de prueba.');return raw('/rest/v1/rpc/'+name,args,await token())},
 async read(table,query=''){return raw('/rest/v1/'+table+'?'+query,undefined,await token(),'GET')}
};

