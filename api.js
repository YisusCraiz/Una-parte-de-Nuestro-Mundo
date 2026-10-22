const cfg=window.MUNDO_CONFIG||{};
export const configured=Boolean(/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl)&&cfg.supabasePublishableKey);
let session=null;try{session=JSON.parse(localStorage.getItem('mundo-session')||'null')}catch{}
let refreshing;
const save=s=>{session=s;if(s)localStorage.setItem('mundo-session',JSON.stringify(s));else localStorage.removeItem('mundo-session')};
async function raw(path,body,token,method='POST'){
 const r=await fetch(cfg.supabaseUrl+path,{method,headers:{apikey:cfg.supabasePublishableKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const data=await r.json().catch(()=>null);if(!r.ok)throw Error(data?.msg||data?.message||data?.error_description||'No se pudo completar la operación.');return data;
}
async function token(){
 if(!session)return null;
 if(Date.now()/1000>(session.expires_at||0)-90){
  refreshing ||= raw('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token}).then(d=>{save({...d,expires_at:Date.now()/1000+d.expires_in});return session.access_token}).catch(e=>{save(null);throw e}).finally(()=>refreshing=null);
  return refreshing;
 }return session.access_token;
}
export const api={
 get user(){return session?.user||null},
 async login(username,password){const d=await raw('/auth/v1/token?grant_type=password',{email:username.toLowerCase()+'@players.jj.invalid',password});save({...d,expires_at:Date.now()/1000+d.expires_in});return d.user},
 async signup(username,password){const d=await raw('/auth/v1/signup',{email:username.toLowerCase()+'@players.jj.invalid',password,data:{username:username.toLowerCase()}});if(d.access_token)save({...d,expires_at:Date.now()/1000+d.expires_in});return d},
 async logout(){try{await raw('/auth/v1/logout',{},await token())}finally{save(null)}},
 async rpc(name,args={}){if(!configured)throw Error('El servicio de cuentas todavía no está configurado. Puedes jugar en modo de prueba.');return raw('/rest/v1/rpc/'+name,args,await token())},
 async read(table,query=''){return raw('/rest/v1/'+table+'?'+query,undefined,await token(),'GET')}
};
