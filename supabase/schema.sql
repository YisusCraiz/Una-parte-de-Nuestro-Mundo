-- Ejecutar en un proyecto NUEVO de Supabase. No usar la base privada de la pareja.
begin;
create extension if not exists pgcrypto with schema extensions;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check(username ~ '^[a-z0-9_]{3,20}$'),
 display_name text not null check(length(display_name) between 1 and 35),
 bio text not null default '' check(length(bio)<=180), avatar text not null default '🪐',
 color text not null default '#b5a0ff' check(color ~ '^#[0-9a-fA-F]{6}$'),
 skin text check(skin in ('jesus','julissa')), ranking_opt_in boolean not null default false,
 created_at timestamptz not null default now()
);
create unique index one_owner_per_skin on public.profiles(skin) where skin is not null;
create table public.wallets (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 jjv2 bigint not null default 0 check(jjv2 between 0 and 1000000000000),
 jxjv2 bigint not null default 0 check(jxjv2 between 0 and 1000000000000),
 spent bigint not null default 0 check(spent>=0), casino_losses bigint not null default 0 check(casino_losses>=0),
 daily_date date
);
create table public.inventory(user_id uuid references public.profiles(id) on delete cascade,item_id text check(item_id in ('axolote','gato','zorro','conejo','dragon')),quantity integer not null default 1 check(quantity>0),primary key(user_id,item_id));
create table public.transactions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,kind text not null,details jsonb not null,request_id uuid,created_at timestamptz not null default now(),unique(user_id,request_id));
create table public.posts(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,username text not null,title text not null check(length(title) between 4 and 100),body text not null check(length(body) between 10 and 2000),created_at timestamptz not null default now());
create index posts_by_time on public.posts(created_at desc);
create index posts_by_owner_time on public.posts(user_id,created_at desc);
create table public.rooms(code text primary key,host uuid not null references public.profiles(id) on delete cascade,guest uuid references public.profiles(id) on delete cascade,board jsonb not null default '[null,null,null,null,null,null,null,null,null]',turn text not null default 'X',revision integer not null default 0,created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '24 hours',check(host is distinct from guest));
create index rooms_host_time on public.rooms(host,created_at desc);
create index rooms_guest on public.rooms(guest);
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.inventory enable row level security;
alter table public.transactions enable row level security;
alter table public.posts enable row level security;
alter table public.rooms enable row level security;
create policy own_profile on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy own_wallet on public.wallets for select to authenticated using(user_id=(select auth.uid()));
create policy own_inventory on public.inventory for select to authenticated using(user_id=(select auth.uid()));
create policy own_transactions on public.transactions for select to authenticated using(user_id=(select auth.uid()));
create policy public_post_read on public.posts for select to anon,authenticated using(true);
revoke all on public.profiles,public.wallets,public.inventory,public.transactions,public.posts,public.rooms from anon,authenticated;
grant select on public.profiles,public.wallets,public.inventory,public.transactions to authenticated;
grant select on public.posts to anon,authenticated;
create view public.public_posts with(security_invoker=true) as select id,user_id,username,title,body,created_at from public.posts;
grant select on public.public_posts to anon,authenticated;

create function public.new_player() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare u text:=lower(new.raw_user_meta_data->>'username');
begin
 if u is null or u !~ '^[a-z0-9_]{3,20}$' then raise exception 'Usuario inválido: usa 3–20 letras, números o guion bajo.';end if;
 insert into public.profiles(id,username,display_name) values(new.id,u,u);
 insert into public.wallets(user_id) values(new.id);
 return new;
end $$;
create trigger on_new_player after insert on auth.users for each row execute function public.new_player();

create function public.update_profile(p_name text,p_bio text,p_avatar text,p_color text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare s text;
begin
 if auth.uid() is null then raise exception 'Inicia sesión.';end if;
 if p_name is null or length(trim(p_name)) not between 1 and 35 or p_bio is null or length(p_bio)>180 or p_color is null or p_color !~ '^#[0-9a-fA-F]{6}$' then raise exception 'Revisa el nombre, la descripción y el color.';end if;
 select skin into s from public.profiles where id=auth.uid();
 if p_avatar is null or not coalesce(p_avatar=any(array['🪐','🌙','🐈‍⬛','🦊','🐰','🐉','🌸','🎮','🎨','🧸']) or(p_avatar='🤵🏻' and s='jesus')or(p_avatar='👩🏻' and s='julissa'),false) then raise exception 'Ese avatar no está disponible en tu cuenta.';end if;
 update public.profiles set display_name=trim(p_name),bio=p_bio,avatar=p_avatar,color=p_color where id=auth.uid();
end $$;

create function public.claim_daily() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.wallets;today date:=(now() at time zone 'UTC')::date;
begin
 select * into w from public.wallets where user_id=auth.uid() for update;
 if not found then raise exception 'Inicia sesión.';end if;
 if w.daily_date=today then return jsonb_build_object('awarded',false);end if;
 update public.wallets set jjv2=jjv2+100,daily_date=today where user_id=auth.uid();
 insert into public.transactions(user_id,kind,details)values(auth.uid(),'daily',jsonb_build_object('jjv2',100,'date',today));
 return jsonb_build_object('awarded',true);
end $$;

create function public.exchange_coins(p_amount integer) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_amount is null or p_amount not between 1 and 100000 then raise exception 'Elige de 1 a 100000 monedas enteras.';end if;
 update public.wallets set jjv2=jjv2-p_amount*2,jxjv2=jxjv2+p_amount where user_id=auth.uid() and jjv2>=p_amount*2;
 if not found then raise exception 'No tienes JJV2 suficientes o falta iniciar sesión.';end if;
 insert into public.transactions(user_id,kind,details)values(auth.uid(),'exchange',jsonb_build_object('jjv2',-p_amount*2,'jxjv2',p_amount));
end $$;

create function public.buy_capsule() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare roll integer;item text;
begin
 update public.wallets set jjv2=jjv2-500,spent=spent+500 where user_id=auth.uid() and jjv2>=500;
 if not found then raise exception 'Necesitas 500 JJV2 para abrir una cápsula.';end if;
 -- Rechazo de 200–255 para que las 100 posibilidades sean equiprobables.
 loop roll:=get_byte(extensions.gen_random_bytes(1),0);exit when roll<200;end loop;roll:=roll%100;
 item:=case when roll<40 then 'axolote' when roll<70 then 'gato' when roll<90 then 'zorro' when roll<99 then 'conejo' else 'dragon' end;
 insert into public.inventory(user_id,item_id)values(auth.uid(),item)on conflict(user_id,item_id)do update set quantity=public.inventory.quantity+1;
 insert into public.transactions(user_id,kind,details)values(auth.uid(),'capsule',jsonb_build_object('jjv2',-500,'item_id',item));
 return jsonb_build_object('item_id',item);
end $$;

create function public.spin_roulette(p_bet integer,p_color text,p_request uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.wallets;result jsonb;roll integer;col text;pay integer;
begin
 if p_request is null or p_bet is null or p_bet not between 1 and 1000 or p_color is null or p_color not in('red','black')then raise exception 'Revisa el color y la apuesta (1–1000).';end if;
 select * into w from public.wallets where user_id=auth.uid() for update;
 if not found then raise exception 'Inicia sesión.';end if;
 select details into result from public.transactions where user_id=auth.uid() and request_id=p_request;
 if found then return result;end if;
 if w.jxjv2<p_bet then raise exception 'No tienes suficientes JXJV2.';end if;
 loop roll:=get_byte(extensions.gen_random_bytes(1),0);exit when roll<222;end loop;roll:=roll%37;
 col:=case when roll=0 then 'green' when roll=any(array[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])then 'red' else 'black' end;
 pay:=case when col=p_color then p_bet*2 else 0 end;
 update public.wallets set jxjv2=jxjv2-p_bet+pay,casino_losses=casino_losses+case when pay=0 then p_bet else 0 end where user_id=auth.uid();
 result:=jsonb_build_object('number',roll,'color',col,'bet',p_bet,'payout',pay);
 insert into public.transactions(user_id,kind,details,request_id)values(auth.uid(),'roulette',result,p_request);
 return result;
end $$;

create function public.set_ranking(p_enabled boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin update public.profiles set ranking_opt_in=coalesce(p_enabled,false) where id=auth.uid();end $$;
create function public.get_ranking(p_kind text) returns table(username text,amount bigint) language sql stable security definer set search_path=public,pg_temp as $$
 select p.username,case p_kind when 'balance' then w.jjv2 when 'spent' then w.spent when 'casino' then w.casino_losses else 0 end as amount
 from public.profiles p join public.wallets w on w.user_id=p.id where p.ranking_opt_in and p_kind in('balance','spent','casino') order by amount desc,p.username limit 50;
$$;

create function public.create_post(p_title text,p_body text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare u text;
begin
 select username into u from public.profiles where id=auth.uid();if not found then raise exception 'Inicia sesión.';end if;
 if exists(select 1 from public.posts where user_id=auth.uid() and created_at>now()-interval '1 minute')then raise exception 'Espera un minuto antes de publicar otra idea.';end if;
 if p_title is null or length(trim(p_title)) not between 4 and 100 or p_body is null or length(trim(p_body)) not between 10 and 2000 then raise exception 'Revisa la longitud del título y del mensaje.';end if;
 insert into public.posts(user_id,username,title,body)values(auth.uid(),u,trim(p_title),trim(p_body));
end $$;
create function public.remove_post(p_id uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin delete from public.posts where id=p_id and user_id=auth.uid();end $$;

create function public.ttt_winner(b jsonb)returns text language plpgsql immutable set search_path=public,pg_temp as $$
declare l integer[];
begin
 foreach l slice 1 in array array[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]] loop
 if b->>l[1] is not null and b->>l[1]=b->>l[2] and b->>l[2]=b->>l[3]then return b->>l[1];end if;end loop;
 if not exists(select 1 from jsonb_array_elements(b) x where x='null'::jsonb)then return 'draw';end if;return null;
end $$;
create function public.create_room()returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare c text;
begin
 if auth.uid()is null then raise exception 'Inicia sesión.';end if;
 if(select count(*)from public.rooms where host=auth.uid()and created_at>now()-interval '24 hours')>=20 then raise exception 'Llegaste al límite de 20 salas al día.';end if;
 loop c:=upper(encode(extensions.gen_random_bytes(4),'hex'));exit when not exists(select 1 from public.rooms where code=c);end loop;
 insert into public.rooms(code,host)values(c,auth.uid());return jsonb_build_object('code',c);
end $$;
create function public.join_room(p_code text)returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.rooms;
begin
 if auth.uid()is null then raise exception 'Inicia sesión.';end if;
 select * into r from public.rooms where code=upper(p_code)and expires_at>now()for update;
 if not found then raise exception 'No existe esa sala o ya caducó.';end if;
 if r.host=auth.uid()or r.guest=auth.uid()then return;end if;
 if r.guest is not null then raise exception 'La sala ya está completa.';end if;
 update public.rooms set guest=auth.uid(),revision=revision+1 where code=r.code;
end $$;
create function public.get_room(p_code text)returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare r public.rooms;
begin
 select * into r from public.rooms where code=upper(p_code)and expires_at>now()and(auth.uid()=host or auth.uid()=guest);
 if not found then raise exception 'No tienes acceso a esta sala o ya caducó.';end if;
 return to_jsonb(r);
end $$;
create function public.move_room(p_code text,p_index integer,p_revision integer)returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.rooms;m text;
begin
 select * into r from public.rooms where code=upper(p_code)and expires_at>now()and(auth.uid()=host or auth.uid()=guest)for update;
 if not found then raise exception 'No tienes acceso a esta sala.';end if;
 if r.guest is null then raise exception 'Espera a la otra persona.';end if;
 if p_revision is null or r.revision<>p_revision then raise exception 'La sala cambió. Espera a que se actualice.';end if;
 m:=case when r.host=auth.uid()then 'X'else 'O'end;
 if r.turn<>m then raise exception 'Todavía no es tu turno.';end if;
 if public.ttt_winner(r.board)is not null then raise exception 'Esta partida ya terminó.';end if;
 if p_index is null or p_index not between 0 and 8 or r.board->>p_index is not null then raise exception 'Elige una casilla vacía.';end if;
 update public.rooms set board=jsonb_set(board,array[p_index::text],to_jsonb(m)),turn=case when m='X'then 'O'else 'X'end,revision=revision+1 where code=r.code;
end $$;

revoke all on function public.new_player(),public.update_profile(text,text,text,text),public.claim_daily(),public.exchange_coins(integer),public.buy_capsule(),public.spin_roulette(integer,text,uuid),public.set_ranking(boolean),public.get_ranking(text),public.create_post(text,text),public.remove_post(uuid),public.ttt_winner(jsonb),public.create_room(),public.join_room(text),public.get_room(text),public.move_room(text,integer,integer)from public,anon,authenticated;
grant execute on function public.update_profile(text,text,text,text),public.claim_daily(),public.exchange_coins(integer),public.buy_capsule(),public.spin_roulette(integer,text,uuid),public.set_ranking(boolean),public.get_ranking(text),public.create_post(text,text),public.remove_post(uuid),public.create_room(),public.join_room(text),public.get_room(text),public.move_room(text,integer,integer)to authenticated;
grant execute on function public.get_ranking(text)to anon;
commit;
