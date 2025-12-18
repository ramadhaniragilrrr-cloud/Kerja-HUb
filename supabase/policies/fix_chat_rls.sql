-- Enable RLS on tables
alter table profiles enable row level security;
alter table chats enable row level security;
alter table chat_participants enable row level security;
alter table messages enable row level security;

-- Drop existing policies to ensure clean state (ignore errors if they don't exist)
drop policy if exists "profiles_select_authenticated" on profiles;
drop policy if exists "chats_select_by_participant_or_announcement" on chats;
drop policy if exists "chats_insert_authenticated_with_self_participant" on chats;
drop policy if exists "chats_update_admin_only" on chats;
drop policy if exists "chats_delete_admin_only" on chats;
drop policy if exists "chat_participants_select_self" on chat_participants;
drop policy if exists "chat_participants_insert_by_chat_member" on chat_participants;
drop policy if exists "chat_participants_insert_by_chat_member_private" on chat_participants;
drop policy if exists "chat_participants_insert_group_admin_only" on chat_participants;
drop policy if exists "messages_select_by_chat_member" on messages;
drop policy if exists "messages_insert_by_chat_member_non_announcement_or_admin" on messages;

-- PROFILES
create policy "profiles_select_authenticated" on profiles 
  for select using (auth.uid() is not null);

-- CHATS
create policy "chats_select_by_participant_or_announcement" on chats 
  for select using (
    exists (
      select 1 from chat_participants cp 
      where cp.chat_id = chats.id and cp.user_id = auth.uid()
    ) 
    or type = 'announcement'
  );

create policy "chats_insert_authenticated" on chats 
  for insert with check (auth.uid() is not null);

create policy "chats_update_admin_only" on chats 
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "chats_delete_admin_only" on chats 
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- CHAT_PARTICIPANTS
create policy "chat_participants_select_self" on chat_participants 
  for select using (user_id = auth.uid());

-- Allow inserting participants if:
-- 1. It's a new chat (user adding themselves and one other for private chat)
-- 2. It's an admin adding to group/announcement
create policy "chat_participants_insert_authenticated" on chat_participants 
  for insert with check (
    -- User can add themselves
    user_id = auth.uid()
    OR
    -- Or user is creating a private chat (adding the other person)
    (
      exists (
        select 1 from chats c 
        where c.id = chat_id 
        and c.type = 'private'
        and exists (select 1 from chat_participants cp where cp.chat_id = c.id and cp.user_id = auth.uid())
      )
    )
    OR
    -- Or user is admin
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- MESSAGES
create policy "messages_select_by_chat_member" on messages 
  for select using (
    exists (
      select 1 from chat_participants cp 
      where cp.chat_id = chat_id and cp.user_id = auth.uid()
    )
  );

create policy "messages_insert_by_chat_member" on messages 
  for insert with check (
    exists (
      select 1 from chat_participants cp 
      where cp.chat_id = chat_id and cp.user_id = auth.uid()
    )
    AND
    (
      -- If announcement, only admin can send
      not exists (select 1 from chats c where c.id = chat_id and c.type = 'announcement')
      OR
      exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );
