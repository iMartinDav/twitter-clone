-- Create a trigger function
create or replace function public.handle_new_user()
returns trigger as $$
declare
  username text;
begin
  -- Get username from metadata or generate a random one
  username := coalesce(
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'user_' || substr(md5(random()::text), 1, 10)
  );

  insert into public.profiles (
    user_id,
    username,
    full_name,
    avatar_url,
    created_at
  ) values (
    new.id,
    username,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      username
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Ensure trigger exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
