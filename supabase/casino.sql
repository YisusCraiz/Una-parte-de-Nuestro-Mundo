-- Casino virtual: instalar DESPUÉS del esquema base. No contiene dinero real.
begin;
create schema if not exists jj_casino;
revoke all on schema jj_casino from public,anon,authenticated;
create table if not exists jj_casino.poker (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 round_id uuid not null, bet integer not null, hand integer[] not null, deck integer[] not null,
 result jsonb, created_at timestamptz not null default now()
);
alter table jj_casino.poker enable row level security;
revoke all on jj_casino.poker from public,anon,authenticated;
create or replace function jj_casino.roll(n integer) returns integer language plpgsql volatile set search_path='' as $$
declare v integer;begin
 if n not between 1 and 256 then raise exception 'Rango inválido';end if;
 loop v:=get_byte(extensions.gen_random_bytes(1),0);exit when v<(256/n)*n;end loop;
 return v%n;
end $$;
create or replace function jj_casino.score(h integer[]) returns jsonb language plpgsql immutable set search_path='' as $$
declare ranks integer[];counts integer[];flush boolean;straight boolean;label text;mult integer;begin
 select array_agg(r order by r) into ranks from (select (v%13)+2 r from unnest(h)v)s;
 select array_agg(c order by c desc) into counts from (select count(*)::int c from unnest(ranks)r group by r)s;
 select count(distinct v/13)=1 into flush from unnest(h)v;
 straight:=cardinality(counts)=5 and (ranks[5]-ranks[1]=4 or ranks=array[2,3,4,5,14]);
 if straight and flush and ranks[1]=10 then label:='Escalera real';mult:=250;
 elsif straight and flush then label:='Escalera de color';mult:=50;
 elsif counts[1]=4 then label:='Póker';mult:=25;
 elsif counts=array[3,2] then label:='Full';mult:=9;
 elsif flush then label:='Color';mult:=6;
 elsif straight then label:='Escalera';mult:=4;
 elsif counts[1]=3 then label:='Trío';mult:=3;
 elsif counts[1]=2 and counts[2]=2 then label:='Doble pareja';mult:=2;
 elsif exists(select 1 from unnest(ranks)r where r>=11 group by r having count(*)=2) then label:='Jotas o mejor';mult:=1;
 else label:='Sin combinación premiada';mult:=0;end if;
 return jsonb_build_object('label',label,'multiplier',mult);
end $$;
-- Las funciones privilegiadas permanecen en esquema privado. Las envolturas públicas son invoker.
create or replace function jj_casino.play(p_game text,p_bet integer,p_pick integer,p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare w public.wallets;r jsonb;win integer;pay integer;col text;begin
 if auth.uid() is null then raise exception 'Inicia sesión.';end if;
 if p_request is null or p_bet is null or p_bet not between 1 and 1000 or p_game is null or p_game not in('number','plush') or p_pick is null or (p_game='number' and p_pick not between 0 and 36) or (p_game='plush' and p_pick not between 0 and 3) then raise exception 'Revisa tu selección y apuesta (1–1000).';end if;
 select * into w from public.wallets where user_id=auth.uid() for update;
 if not found then raise exception 'Cuenta no disponible.';end if;
 select details into r from public.transactions where user_id=auth.uid() and request_id=p_request;
 if found then
  if r->>'game' is distinct from p_game or (r->>'bet')::int<>p_bet or (r->>'pick')::int<>p_pick then raise exception 'Solicitud ya usada.';end if;
  return r;
 end if;
 if w.jxjv2<p_bet then raise exception 'No tienes suficientes JXJV2.';end if;
 win:=jj_casino.roll(case when p_game='number' then 37 else 4 end);
 pay:=case when win=p_pick then p_bet*(case when p_game='number' then 36 else 3 end) else 0 end;
 col:=case when win=0 then 'green' when win=any(array[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]) then 'red' else 'black' end;
 r:=jsonb_build_object('game',p_game,'number',win,'winner',win,'color',col,'bet',p_bet,'pick',p_pick,'payout',pay);
 update public.wallets set jxjv2=jxjv2-p_bet+pay,casino_losses=casino_losses+greatest(p_bet-pay,0) where user_id=auth.uid();
 insert into public.transactions(user_id,kind,details,request_id)values(auth.uid(),'casino_'||p_game,r,p_request);
 return r;
end $$;
create or replace function jj_casino.poker_action(p_action text,p_bet integer,p_request uuid,p_hold integer[]) returns jsonb language plpgsql security definer set search_path='' as $$
declare w public.wallets;g jj_casino.poker;r jsonb;d integer[];i integer;j integer;v integer;pos integer:=6;pay integer;begin
 if auth.uid() is null then raise exception 'Inicia sesión.';end if;
 select * into w from public.wallets where user_id=auth.uid() for update;
 if not found then raise exception 'Cuenta no disponible.';end if;
 select * into g from jj_casino.poker where user_id=auth.uid() for update;
 if p_action='status' then
  if g.user_id is null then return null;end if;
  return coalesce(g.result,jsonb_build_object('hand',g.hand,'round_id',g.round_id,'bet',g.bet,'pending',true));
 end if;
 if p_action='deal' then
  if p_request is null or p_bet is null or p_bet not between 1 and 1000 then raise exception 'Apuesta de 1–1000.';end if;
  select details into r from public.transactions where user_id=auth.uid() and request_id=p_request;
  if found then
   if r->>'game' is distinct from 'poker' or (r->>'bet')::int<>p_bet then raise exception 'Solicitud ya usada.';end if;
   return r;
  end if;
  if g.user_id is not null and g.result is null then raise exception 'Termina tu mano pendiente antes de repartir.';end if;
  if w.jxjv2<p_bet then raise exception 'No tienes suficientes JXJV2.';end if;
  select array_agg(x) into d from generate_series(0,51)x;
  for i in reverse 52..2 loop j:=jj_casino.roll(i)+1;v:=d[i];d[i]:=d[j];d[j]:=v;end loop;
  insert into jj_casino.poker(user_id,round_id,bet,hand,deck,result)values(auth.uid(),p_request,p_bet,d[1:5],d,null)
  on conflict(user_id)do update set round_id=excluded.round_id,bet=excluded.bet,hand=excluded.hand,deck=excluded.deck,result=null,created_at=now();
  update public.wallets set jxjv2=jxjv2-p_bet where user_id=auth.uid();
  r:=jsonb_build_object('game','poker','round_id',p_request,'hand',d[1:5],'bet',p_bet,'pending',true);
  insert into public.transactions(user_id,kind,details,request_id)values(auth.uid(),'poker_deal',r,p_request);return r;
 elsif p_action='draw' then
  if g.user_id is null or p_request is null or p_request<>g.round_id then raise exception 'No existe esa mano.';end if;
  if g.result is not null then return g.result;end if;
  if p_hold is null or cardinality(p_hold)>5 or exists(select 1 from unnest(p_hold)x where x is null or x not between 0 and 4) or (select count(distinct x) from unnest(p_hold)x)<>cardinality(p_hold) then raise exception 'Selección de cartas inválida.';end if;
  for i in 1..5 loop if not (i-1=any(p_hold))then g.hand[i]:=g.deck[pos];pos:=pos+1;end if;end loop;
  r:=jj_casino.score(g.hand);pay:=(r->>'multiplier')::int*g.bet;
  r:=r||jsonb_build_object('game','poker','round_id',g.round_id,'hand',g.hand,'bet',g.bet,'payout',pay,'pending',false);
  update public.wallets set jxjv2=jxjv2+pay,casino_losses=casino_losses+greatest(g.bet-pay,0) where user_id=auth.uid();
  update jj_casino.poker set hand=g.hand,deck='{}',result=r where user_id=auth.uid();
  insert into public.transactions(user_id,kind,details)values(auth.uid(),'poker_draw',r);return r;
 end if;
 raise exception 'Acción inválida.';
end $$;
revoke all on all functions in schema jj_casino from public,anon,authenticated;
-- El esquema NO está expuesto en Data API; solo estas dos operaciones autenticadas son accesibles.
grant usage on schema jj_casino to authenticated;
grant execute on function jj_casino.play(text,integer,integer,uuid),jj_casino.poker_action(text,integer,uuid,integer[]) to authenticated;
create or replace function public.play_casino(p_game text,p_bet integer,p_pick integer,p_request uuid) returns jsonb language sql security invoker set search_path='' as $$select jj_casino.play(p_game,p_bet,p_pick,p_request)$$;
create or replace function public.casino_poker(p_action text,p_bet integer default 0,p_request uuid default null,p_hold integer[] default '{}') returns jsonb language sql security invoker set search_path='' as $$select jj_casino.poker_action(p_action,p_bet,p_request,p_hold)$$;
revoke all on function public.play_casino(text,integer,integer,uuid),public.casino_poker(text,integer,uuid,integer[]) from public,anon,authenticated;
grant execute on function public.play_casino(text,integer,integer,uuid),public.casino_poker(text,integer,uuid,integer[]) to authenticated;
commit;
