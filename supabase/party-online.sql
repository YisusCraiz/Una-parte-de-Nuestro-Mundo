begin;
alter table mundo_private.sessions drop constraint if exists sessions_mode_check;
alter table mundo_private.sessions add constraint sessions_mode_check check(mode in('uno','eights','highcard','twentyone','never','whatif','likely','piano','lottery','draw','truth','pool','bombitas','wands','puzzle','shooter'));
create or replace function public.mundo_session(p_action text,p_actor uuid,p_code text default '',p_mode text default '',p_settings jsonb default '{}',p_state jsonb default null,p_status text default null,p_revision integer default null)returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r mundo_private.sessions;c text;person jsonb;
begin
 if not exists(select 1 from public.profiles where id=p_actor)then raise exception 'Cuenta no disponible.';end if;
 if p_action='create' then
  if(select count(*)from mundo_private.sessions where host=p_actor and created_at>now()-interval '24 hours')>=20 then raise exception 'Máximo de 20 salas al día.';end if;
  if p_mode not in('uno','eights','highcard','twentyone','never','whatif','likely','piano','lottery','draw','truth','pool','bombitas','wands','puzzle','shooter')or(p_settings->>'maxPlayers')::int not between 2 and 6 then raise exception 'Ajustes inválidos.';end if;
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


create or replace function mundo_private.live_access(topic text,writing boolean) returns boolean language plpgsql stable security definer set search_path='' as $$
declare parts text[]:=string_to_array(topic,':');r mundo_private.sessions;begin
 if auth.uid() is null or cardinality(parts)<>3 or parts[1]<>'mundo' or parts[2]!~'^[A-F0-9]{8}$' then return false;end if;
 select * into r from mundo_private.sessions where code=parts[2] and expires_at>now() and status='playing' and mode in('bombitas','shooter');
 if not found or not r.players@>jsonb_build_array(jsonb_build_object('id',auth.uid())) or not exists(select 1 from jsonb_array_elements(r.players)p where p->>'id'=parts[3])then return false;end if;
 return not writing or parts[3]=auth.uid()::text;
end $$;
revoke all on function mundo_private.live_access(text,boolean) from public,anon,authenticated;
grant usage on schema mundo_private to authenticated;
grant execute on function mundo_private.live_access(text,boolean) to authenticated;
create policy mundo_live_receive on realtime.messages for select to authenticated using(extension='broadcast' and mundo_private.live_access((select realtime.topic()),false));
create policy mundo_live_send on realtime.messages for insert to authenticated with check(extension='broadcast' and mundo_private.live_access((select realtime.topic()),true));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)values('mundo-images','mundo-images',false,5242880,array['image/webp','image/png','image/jpeg'])on conflict(id)do nothing;
create or replace function mundo_private.image_access(path text,uploading boolean)returns boolean language plpgsql stable security definer set search_path='' as $$
declare parts text[]:=string_to_array(path,'/');r mundo_private.sessions;begin
 if auth.uid()is null or cardinality(parts)<>3 then return false;end if;
 select * into r from mundo_private.sessions where code=parts[2] and mode='puzzle' and expires_at>now();
 if not found then return false;end if;
 if uploading then return r.host=auth.uid() and parts[1]=auth.uid()::text and r.status='lobby' and not exists(select 1 from storage.objects where bucket_id='mundo-images' and name like parts[1]||'/'||parts[2]||'/%');end if;
 return (r.host=auth.uid() and parts[1]=auth.uid()::text)or(r.players@>jsonb_build_array(jsonb_build_object('id',auth.uid()))and r.state->>'imagePath'=path);
end $$;
revoke all on function mundo_private.image_access(text,boolean) from public,anon,authenticated;
grant execute on function mundo_private.image_access(text,boolean) to authenticated;
create policy mundo_image_upload on storage.objects for insert to authenticated with check(bucket_id='mundo-images' and mundo_private.image_access(name,true));
create policy mundo_image_read on storage.objects for select to authenticated using(bucket_id='mundo-images' and mundo_private.image_access(name,false));
create policy mundo_image_delete on storage.objects for delete to authenticated using(bucket_id='mundo-images' and split_part(name,'/',1)=auth.uid()::text);
create or replace function public.mundo_image_exists(p_path text)returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from storage.objects where bucket_id='mundo-images'and name=p_path and coalesce((metadata->>'size')::bigint,0)<=5242880)$$;
revoke all on function public.mundo_image_exists(text) from public,anon,authenticated;
grant execute on function public.mundo_image_exists(text) to service_role;
commit;

