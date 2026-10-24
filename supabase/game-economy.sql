-- Apply after multiplayer + party games. Currency is virtual JJV2 only.
create table mundo_private.game_matches(
 id uuid primary key default gen_random_uuid(),code text not null,mode text not null,
 players uuid[] not null,stake integer not null check(stake in(0,25,50,100,250,500)),
 started_at timestamptz not null default now(),expires_at timestamptz not null,
 ended_at timestamptz,result jsonb
);
create unique index game_match_active on mundo_private.game_matches(code)where ended_at is null;
create index game_match_expiry on mundo_private.game_matches(expires_at)where ended_at is null;
create table mundo_private.game_daily(user_id uuid not null references public.profiles(id)on delete cascade,day date not null,amount integer not null check(amount between 0 and 400),primary key(user_id,day));
alter table mundo_private.game_matches enable row level security;
alter table mundo_private.game_daily enable row level security;
revoke all on mundo_private.game_matches,mundo_private.game_daily from public,anon,authenticated;

create function mundo_private.settle_game(p_id uuid,p_winner uuid default null,p_refund boolean default false,p_participation boolean default false)returns jsonb
language plpgsql security definer set search_path='' as $$
declare m mundo_private.game_matches;u uuid;bonus integer;wanted integer;used integer;pot integer;outcome text;receipts jsonb:='[]';today date:=(now()at time zone 'UTC')::date;
begin
 select * into m from mundo_private.game_matches where id=p_id for update;
 if not found then raise exception 'Partida inexistente.';end if;
 if m.ended_at is not null then return m.result;end if;
 if p_winner is not null and not p_winner=any(m.players)then raise exception 'Ganador inválido.';end if;
 -- All wallet mutations (including daily caps) use one consistent lock order.
 perform 1 from public.wallets where user_id=any(m.players)order by user_id for update;
 foreach u in array m.players loop
  pot:=case when p_refund then m.stake when p_winner=u then m.stake*cardinality(m.players)when p_winner is null then m.stake else 0 end;
  outcome:=case when p_refund then 'refund' when p_participation then 'participation' when p_winner is null then 'draw'when p_winner=u then 'win'else 'loss'end;
  wanted:=case when p_refund or now()-m.started_at<interval '30 seconds'then 0 when p_participation then 20 when p_winner is null then 30 when p_winner=u then 60 else 20 end;
  insert into mundo_private.game_daily(user_id,day,amount)values(u,today,0)on conflict do nothing;
  select amount into used from mundo_private.game_daily where user_id=u and day=today for update;
  bonus:=least(wanted,400-used);
  update mundo_private.game_daily set amount=amount+bonus where user_id=u and day=today;
  update public.wallets set jjv2=jjv2+pot+bonus where user_id=u;
  insert into public.transactions(user_id,kind,details)values(u,'game_settlement',jsonb_build_object('match',m.id,'code',m.code,'mode',m.mode,'outcome',outcome,'stake',m.stake,'pot',pot,'reward',bonus));
  receipts:=receipts||jsonb_build_array(jsonb_build_object('match',m.id,'user',u,'outcome',outcome,'stake',m.stake,'pot',pot,'reward',bonus));
 end loop;
 update mundo_private.game_matches set ended_at=now(),result=receipts where id=m.id;
 return receipts;
end $$;

create function mundo_private.game_economy()returns trigger language plpgsql security definer set search_path='' as $$
declare m mundo_private.game_matches;participants uuid[];u uuid;bet integer;winner uuid;idx integer;summary jsonb;competitive boolean;
begin
 select * into m from mundo_private.game_matches where code=new.code and ended_at is null for update;
 if old.status='lobby'and new.status='playing'then
  select array_agg((x->>'id')::uuid order by ord)into participants from jsonb_array_elements(new.players)with ordinality as p(x,ord);
  bet:=coalesce((new.settings->>'stake')::integer,0);
  if m.id is null then
   if bet not in(0,25,50,100,250,500)or bet>0 and(new.mode not in('uno','eights','highcard','twentyone','pool','lottery','draw')or cardinality(participants)<>2)then raise exception 'Apuesta inválida.';end if;
   perform 1 from public.wallets where user_id=any(participants)order by user_id for update;
   foreach u in array participants loop
    if bet>0 and coalesce(old.state->'economyConsent'->>u::text,'false')<>'true'then raise exception 'Todos deben aceptar la apuesta.';end if;
    if not exists(select 1 from public.wallets where user_id=u and jjv2>=bet)then raise exception 'Saldo insuficiente para la apuesta.';end if;
   end loop;
   insert into mundo_private.game_matches(code,mode,players,stake,expires_at)values(new.code,new.mode,participants,bet,new.expires_at)returning * into m;
   foreach u in array participants loop
    if bet>0 then
     update public.wallets set jjv2=jjv2-bet where user_id=u;
     insert into public.transactions(user_id,kind,details)values(u,'game_stake',jsonb_build_object('match',m.id,'stake',bet,'code',new.code));
    end if;
   end loop;
  elsif m.players<>participants or m.stake<>bet then raise exception 'Reinicia la serie para cambiar participantes o apuesta.';
  end if;
 end if;
 if m.id is not null then
  competitive:=new.mode in('uno','eights','highcard','twentyone','piano','pool','lottery','draw','wands','bombitas');
  if new.status='finished'and(not competitive or new.state->'series'->>'champion' is not null or new.state->'series'->>'draw'='true')then
   idx:=(new.state->'series'->>'champion')::integer;
   winner:=case when idx is not null then m.players[idx+1]else null end;
   summary:=mundo_private.settle_game(m.id,winner,false,not competitive);
   new.state:=jsonb_set(coalesce(new.state,'{}'),'{payout}',summary);
  elsif new.status='closed'or old.state->'series' is not null and new.status='lobby'and new.state->'series' is null then
   -- Explicit series reset or server closure: no participation rewards.
   perform mundo_private.settle_game(m.id,null,true);
  end if;
 end if;
 return new;
end $$;
create trigger game_economy before update on mundo_private.sessions for each row execute function mundo_private.game_economy();

-- Expired rooms are reconciled on the next wallet refresh, without a cron dependency.
create function public.recover_game_bets()returns void language plpgsql security definer set search_path='' as $$
declare r record;m record;
begin
 if auth.uid()is null then raise exception 'Inicia sesión.';end if;
 for r in select s.code from mundo_private.sessions s where s.expires_at<=now()and exists(select 1 from mundo_private.game_matches g where g.code=s.code and g.ended_at is null and auth.uid()=any(g.players))order by s.code for update of s skip locked loop
  for m in select id from mundo_private.game_matches where code=r.code and ended_at is null loop
   perform mundo_private.settle_game(m.id,null,true);
  end loop;
 end loop;
end $$;
revoke all on function mundo_private.settle_game(uuid,uuid,boolean,boolean),mundo_private.game_economy()from public,anon,authenticated,service_role;
revoke all on function public.recover_game_bets()from public,anon,authenticated;
grant execute on function public.recover_game_bets()to authenticated;
