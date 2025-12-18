-- ABSOLUTE FIX: Run this ENTIRE script
-- This script explicitly drops policies immediately before creating them to avoid conflicts.

-- 1. CHATS TABLE
alter table chats enable row level security;

drop policy if exists "chats_insert_authenticated" on chats;
create policy "chats_insert_authenticated" on chats 
  for insert with check (auth.uid() is not null);

drop policy if exists "chats_select_participated" on chats;
create policy "chats_select_participated" on chats 
  for select using (
    exists (
      select 1 from chat_participants cp 
      where cp.chat_id = id and cp.user_id = auth.uid()
    ) 
    or type = 'announcement'
  );

drop policy if exists "chats_all_admin" on chats;
create policy "chats_all_admin" on chats 
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Cleanup old policies on chats just in case
drop policy if exists "chats_insert_authenticated_with_self_participant" on chats;
drop policy if exists "chats_select_by_participant_or_announcement" on chats;
drop policy if exists "chats_update_admin_only" on chats;
drop policy if exists "chats_delete_admin_only" on chats;


-- 2. CHAT_PARTICIPANTS TABLE
alter table chat_participants enable row level security;

drop policy if exists "participants_select_self" on chat_participants;
create policy "participants_select_self" on chat_participants 
  for select using (user_id = auth.uid());

drop policy if exists "participants_insert_authenticated" on chat_participants;
create policy "participants_insert_authenticated" on chat_participants 
  for insert with check (auth.uid() is not null);

-- Cleanup old policies on participants
drop policy if exists "chat_participants_select_self" on chat_participants;
drop policy if exists "chat_participants_insert_by_chat_member_private" on chat_participants;
drop policy if exists "chat_participants_insert_group_admin_only" on chat_participants;
drop policy if exists "chat_participants_insert_authenticated" on chat_participants;


-- 3. MESSAGES TABLE
alter table messages enable row level security;

drop policy if exists "messages_select_participant" on messages;
create policy "messages_select_participant" on messages 
  for select using (
    exists (
      select 1 from chat_participants cp 
      where cp.chat_id = chat_id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "messages_insert_participant" on messages;
create policy "messages_insert_participant" on messages 
  for insert with check (
    auth.uid() is not null 
    AND (
       exists (
        select 1 from chat_participants cp 
        where cp.chat_id = chat_id and cp.user_id = auth.uid()
      )
      OR 
      (
        exists (select 1 from chats c where c.id = chat_id and c.type = 'announcement')
        AND
        exists (select 1 from profiles where id = auth.uid() and role = 'admin')
      )
    )
  );

-- Cleanup old policies on messages
drop policy if exists "messages_select_by_chat_member" on messages;
drop policy if exists "messages_insert_by_chat_member_non_announcement_or_admin" on messages;
drop policy if exists "messages_insert_by_chat_member" on messages;
