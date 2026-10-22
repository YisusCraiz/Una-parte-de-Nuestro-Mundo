-- Ampliación aditiva. Aplicar después de schema.sql.
create schema if not exists mundo_private;
revoke all on schema mundo_private from public,anon,authenticated;
create table mundo_private.sessions(
 code text primary key,host uuid not null references public.profiles(id)on delete cascade,
 mode text not null check(mode in('uno','eights','highcard','twentyone','never','whatif','likely','piano')),
 players jsonb not null,settings jsonb not null,state jsonb,status text not null default 'lobby',revision integer not null default 0,
 created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '24 hours'
);
create index sessions_by_host on mundo_private.sessions(host,created_at desc);
alter table mundo_private.sessions enable row level security;
grant usage on schema mundo_private to service_role;
grant all on mundo_private.sessions to service_role;

create function public.mundo_session(p_action text,p_actor uuid,p_code text default '',p_mode text default '',p_settings jsonb default '{}',p_state jsonb default null,p_status text default null,p_revision integer default null)returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r mundo_private.sessions;c text;person jsonb;
begin
 if not exists(select 1 from public.profiles where id=p_actor)then raise exception 'Cuenta no disponible.';end if;
 if p_action='create' then
  if(select count(*)from mundo_private.sessions where host=p_actor and created_at>now()-interval '24 hours')>=20 then raise exception 'Máximo de 20 salas al día.';end if;
  if p_mode not in('uno','eights','highcard','twentyone','never','whatif','likely','piano')or(p_settings->>'maxPlayers')::int not between 2 and 6 then raise exception 'Ajustes inválidos.';end if;
  select jsonb_build_object('id',id,'name',display_name,'avatar',avatar,'skin',skin)into person from public.profiles where id=p_actor;
  loop c:=upper(encode(extensions.gen_random_bytes(4),'hex'));exit when not exists(select 1 from mundo_private.sessions where code=c)and not exists(select 1 from public.rooms where code=c);end loop;
  insert into mundo_private.sessions(code,host,mode,players,settings)values(c,p_actor,p_mode,jsonb_build_array(person),p_settings)returning * into r;
 else
  select * into r from mundo_private.sessions where code=upper(p_code)and expires_at>now()for update;
  if not found then raise exception 'No existe esa sala o ya caducó.';end if;
  if p_action='join' and not r.players@>jsonb_build_array(jsonb_build_object('id',p_actor))then
   if r.status<>'lobby'or jsonb_array_length(r.players)>=(r.settings->>'maxPlayers')::int then raise exception 'La sala está completa o ya comenzó.';end if;
   select jsonb_build_object('id',id,'name',display_name,'avatar',avatar,'skin',skin)into person from public.profiles where id=p_actor;
   update mundo_private.sessions set players=players||jsonb_build_array(person),revision=revision+1 where code=r.code returning * into r;
  end if;
  if not r.players@>jsonb_build_array(jsonb_build_object('id',p_actor))then raise exception 'No perteneces a esta sala.';end if;
  if p_action='commit' then
   if p_revision is null or r.revision<>p_revision then raise exception 'STALE: la sala cambió. Reintenta.';end if;
   if p_status not in('lobby','playing','finished','closed')or length(p_state::text)>200000 then raise exception 'Estado inválido.';end if;
   update mundo_private.sessions set state=p_state,settings=p_settings,status=p_status,revision=revision+1 where code=r.code returning * into r;
  elsif p_action='leave' then
   if r.status='lobby' and p_actor<>r.host then update mundo_private.sessions set players=(select jsonb_agg(x)from jsonb_array_elements(players)x where x->>'id'<>p_actor::text),revision=revision+1 where code=r.code returning * into r;
   else update mundo_private.sessions set status='closed',revision=revision+1 where code=r.code returning * into r;end if;
  elsif p_action not in('read','join')then raise exception 'Acción inválida.';end if;
 end if;
 return to_jsonb(r);
end $$;
revoke all on function public.mundo_session(text,uuid,text,text,jsonb,jsonb,text,integer)from public,anon,authenticated;
grant execute on function public.mundo_session(text,uuid,text,text,jsonb,jsonb,text,integer)to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)values('mundo-audio','mundo-audio',false,31457280,array['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/ogg','audio/mp4','audio/x-m4a','audio/webm','audio/flac'])on conflict(id)do nothing;
create function public.mundo_audio_access(p_path text,p_upload boolean default false)returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare r mundo_private.sessions;parts text[]:=string_to_array(p_path,'/');
begin
 if auth.uid()is null or array_length(parts,1)<>3 then return false;end if;
 if p_upload then select * into r from mundo_private.sessions where code=parts[2]and mode='piano'and expires_at>now()for update;
 else select * into r from mundo_private.sessions where code=parts[2]and mode='piano'and expires_at>now();end if;
 if not found then return false;end if;
 if p_upload then return r.host=auth.uid()and parts[1]=auth.uid()::text and r.status='lobby'and not exists(select 1 from storage.objects where bucket_id='mundo-audio'and name like parts[1]||'/'||parts[2]||'/%');end if;
 return (r.host=auth.uid()and parts[1]=auth.uid()::text)or(r.players@>jsonb_build_array(jsonb_build_object('id',auth.uid()))and r.state->>'audioPath'=p_path);
end $$;
revoke all on function public.mundo_audio_access(text,boolean)from public,anon,authenticated;
grant execute on function public.mundo_audio_access(text,boolean)to authenticated;
create policy mundo_audio_upload on storage.objects for insert to authenticated with check(bucket_id='mundo-audio'and public.mundo_audio_access(name,true));
create policy mundo_audio_read on storage.objects for select to authenticated using(bucket_id='mundo-audio'and public.mundo_audio_access(name,false));
create function public.mundo_audio_exists(p_path text)returns boolean language sql stable security definer set search_path=public,pg_temp as $$select exists(select 1 from storage.objects where bucket_id='mundo-audio'and name=p_path and coalesce((metadata->>'size')::bigint,0)<=31457280)$$;
revoke all on function public.mundo_audio_exists(text)from public,anon,authenticated;
grant execute on function public.mundo_audio_exists(text)to service_role;
