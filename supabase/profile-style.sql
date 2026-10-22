alter table public.profiles add column background text not null default 'cosmos' check(background in('cosmos','sakura','aurora','medianoche'));
alter table public.profiles add column frame text not null default 'simple' check(frame in('simple','estelar','corazon'));
alter table public.profiles add column mascot text check(mascot in('axolote','gato','zorro','conejo','dragon'));
alter table public.inventory drop constraint inventory_item_id_check;
alter table public.inventory add constraint inventory_item_id_check check(item_id in('axolote','gato','zorro','conejo','dragon','fondo_sakura','fondo_aurora','fondo_medianoche','marco_estelar','marco_corazon'));
create function public.buy_decoration(p_item text)returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare cost integer;
begin
 if auth.uid()is null then raise exception 'Inicia sesión.';end if;
 cost:=case p_item when 'fondo_sakura'then 1500 when 'fondo_aurora'then 2000 when 'fondo_medianoche'then 2500 when 'marco_estelar'then 1000 when 'marco_corazon'then 1800 else null end;
 if cost is null then raise exception 'Decoración desconocida.';end if;
 perform 1 from public.wallets where user_id=auth.uid()for update;
 if exists(select 1 from public.inventory where user_id=auth.uid()and item_id=p_item)then raise exception 'Ya tienes esta decoración.';end if;
 update public.wallets set jjv2=jjv2-cost,spent=spent+cost where user_id=auth.uid()and jjv2>=cost;
 if not found then raise exception 'No tienes suficientes JJV2.';end if;
 insert into public.inventory(user_id,item_id)values(auth.uid(),p_item);
 insert into public.transactions(user_id,kind,details)values(auth.uid(),'decoration',jsonb_build_object('item_id',p_item,'jjv2',-cost));
end $$;
create function public.equip_style(p_background text,p_frame text,p_mascot text)returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid()is null then raise exception 'Inicia sesión.';end if;
 if p_background is null or p_background not in('cosmos','sakura','aurora','medianoche')or p_frame is null or p_frame not in('simple','estelar','corazon')then raise exception 'Estilo inválido.';end if;
 if p_background<>'cosmos'and not exists(select 1 from public.inventory where user_id=auth.uid()and item_id='fondo_'||p_background)then raise exception 'Ese fondo no está en tu colección.';end if;
 if p_frame<>'simple'and not exists(select 1 from public.inventory where user_id=auth.uid()and item_id='marco_'||p_frame)then raise exception 'Ese marco no está en tu colección.';end if;
 if p_mascot is not null and not exists(select 1 from public.inventory where user_id=auth.uid()and item_id=p_mascot and item_id in('axolote','gato','zorro','conejo','dragon'))then raise exception 'Ese peluche no está en tu colección.';end if;
 update public.profiles set background=p_background,frame=p_frame,mascot=p_mascot where id=auth.uid();
end $$;
revoke all on function public.buy_decoration(text),public.equip_style(text,text,text)from public,anon,authenticated;
grant execute on function public.buy_decoration(text),public.equip_style(text,text,text)to authenticated;
create policy mundo_audio_owner_delete on storage.objects for delete to authenticated using(bucket_id='mundo-audio'and(storage.foldername(name))[1]=(select auth.uid())::text);
