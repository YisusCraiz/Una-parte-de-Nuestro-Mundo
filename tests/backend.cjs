const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');
(async()=>{const db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema auth;create schema extensions;
create table auth.users(id uuid primary key,raw_user_meta_data jsonb not null default '{}');
create function auth.uid()returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid()to anon,authenticated;
-- Sustituto SOLO de prueba; el esquema real usa pgcrypto criptográfico.
create function extensions.gen_random_bytes(n integer)returns bytea language sql volatile as $$select decode(substr(md5(random()::text),1,n*2),'hex')$$;`);
let schema=fs.readFileSync(path.join(__dirname,'../supabase/schema.sql'),'utf8').replace('create extension if not exists pgcrypto with schema extensions;','');await db.exec(schema);
const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333'];
for(let i=0;i<3;i++)await db.query('insert into auth.users(id,raw_user_meta_data)values($1,$2)',[ids[i],JSON.stringify({username:'player'+i})]);
async function as(i){await db.exec(`reset role;set request.jwt.claim.sub='${ids[i]}';set role authenticated;`)}
async function rpc(sql,args=[]){return(await db.query(sql,args)).rows}
await as(0);const daily=await rpc('select public.claim_daily()as r');assert.equal(daily[0].r.awarded,true);assert.equal((await rpc('select public.claim_daily()as r'))[0].r.awarded,false);
assert.equal((await rpc('select jjv2 from public.wallets'))[0].jjv2,100);assert.equal((await rpc('select * from public.profiles')).length,1);
await assert.rejects(()=>rpc('update public.wallets set jjv2=1000000'));
await assert.rejects(()=>rpc('select public.exchange_coins(-1)'));await assert.rejects(()=>rpc('select public.exchange_coins(10000)'));
await rpc('select public.exchange_coins(10)');assert.equal((await rpc('select jjv2 from public.wallets'))[0].jjv2,80);assert.equal((await rpc('select jxjv2 from public.wallets'))[0].jxjv2,10);
await assert.rejects(()=>rpc('select public.buy_capsule()'));await assert.rejects(()=>rpc("select public.update_profile('A','','🤵🏻','#ffffff')"));await assert.rejects(()=>rpc("select public.update_profile('A','','unsupported','#ffffff')"));await rpc("select public.update_profile('Estrella','','🌙','#abcdef')");
const req='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',a=(await rpc("select public.spin_roulette(1,'red',$1)as r",[req]))[0].r,b=(await rpc("select public.spin_roulette(1,'red',$1)as r",[req]))[0].r;assert.deepEqual(a,b);assert.equal((await rpc("select count(*)::int as n from public.transactions where kind='roulette'"))[0].n,1);
await rpc("select public.create_post('Una idea','Un mensaje de prueba para el foro')");await assert.rejects(()=>rpc("select public.create_post('Otra idea','Un mensaje de prueba para el foro')"));
const room=(await rpc('select public.create_room()as r'))[0].r.code;
await as(2);await assert.rejects(()=>rpc('select public.get_room($1)',[room]));
await as(1);await rpc('select public.join_room($1)',[room]);await as(2);await assert.rejects(()=>rpc('select public.join_room($1)',[room]));
await as(0);let r=(await rpc('select public.get_room($1)as r',[room]))[0].r;await rpc('select public.move_room($1,0,$2)',[room,r.revision]);await assert.rejects(()=>rpc('select public.move_room($1,1,$2)',[room,r.revision]));
for(const [who,cell]of [[1,3],[0,1],[1,4],[0,2]]){await as(who);r=(await rpc('select public.get_room($1)as r',[room]))[0].r;await rpc('select public.move_room($1,$2,$3)',[room,cell,r.revision])}
await as(1);r=(await rpc('select public.get_room($1)as r',[room]))[0].r;await assert.rejects(()=>rpc('select public.move_room($1,5,$2)',[room,r.revision]));
await db.exec('reset role');assert.equal((await rpc('select public.ttt_winner($1::jsonb)as winner',[JSON.stringify(r.board)]))[0].winner,'X');
await db.query('update public.wallets set jjv2=1000 where user_id=$1',[ids[0]]);await as(0);const item=(await rpc('select public.buy_capsule()as r'))[0].r.item_id;assert.ok(['axolote','gato','zorro','conejo','dragon'].includes(item));assert.equal((await rpc('select jjv2 from public.wallets'))[0].jjv2,500);assert.equal((await rpc('select quantity from public.inventory'))[0].quantity,1);
await db.exec('reset role;set role anon');assert.equal((await rpc('select * from public.public_posts')).length,1);await assert.rejects(()=>rpc('select * from public.wallets'));await assert.rejects(()=>rpc('select public.claim_daily()'));
await db.close();console.log('Backend SQL: instalación, RLS, fondos, regalo único, cambio, avatar reservado, gachapón, ruleta idempotente, foro y salas por turnos: OK');})().catch(e=>{console.error(e);process.exitCode=1});
