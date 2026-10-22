-- Estructura para reservar las dos identidades. Los enlaces secretos NO van en GitHub.
create table mundo_private.owner_reservations(
 username text primary key check(username in('yisus','julissa')),display_name text not null,
 skin text not null unique check(skin in('jesus','julissa')),invitation_hash text not null,
 claimed_by uuid references auth.users(id)on delete set null,claimed_at timestamptz
);
alter table mundo_private.owner_reservations enable row level security;
revoke all on mundo_private.owner_reservations from public,anon,authenticated;
create or replace function public.new_player()returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare u text:=lower(new.raw_user_meta_data->>'username');reservation mundo_private.owner_reservations;token text:=new.raw_user_meta_data->>'owner_invitation';
begin
 if u is null or u !~ '^[a-z0-9_]{3,20}$'then raise exception 'Usuario inválido: usa 3–20 letras, números o guion bajo.';end if;
 select * into reservation from mundo_private.owner_reservations where username=u for update;
 if found then
  if reservation.claimed_by is not null or reservation.claimed_at is not null or token is null or encode(extensions.digest(token,'sha256'),'hex')<>reservation.invitation_hash then raise exception 'Este nombre está reservado. Usa el enlace privado de activación.';end if;
  insert into public.profiles(id,username,display_name,skin,avatar)values(new.id,u,reservation.display_name,reservation.skin,case when reservation.skin='jesus'then '🤵🏻'else '👩🏻'end);
  update mundo_private.owner_reservations set claimed_by=new.id,claimed_at=now()where username=u;
  update auth.users set raw_user_meta_data=raw_user_meta_data-'owner_invitation'where id=new.id;
 else insert into public.profiles(id,username,display_name)values(new.id,u,u);end if;
 insert into public.wallets(user_id)values(new.id);return new;
end $$;
revoke all on function public.new_player()from public,anon,authenticated;

