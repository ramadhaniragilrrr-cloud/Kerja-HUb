alter table profiles enable row level security;
create policy "profiles_select_authenticated" on profiles for select using (auth.uid() is not null);

alter table chats enable row level security;
create policy "chats_select_by_participant_or_announcement" on chats for select using (exists (select 1 from chat_participants cp where cp.chat_id = chats.id and cp.user_id = auth.uid()) or chats.type = 'announcement');
create policy "chats_insert_authenticated_with_self_participant" on chats for insert with check (auth.uid() is not null and auth.uid() = any (participants));
create policy "chats_update_admin_only" on chats for update using (exists (select 1 from profiles p where p.id = auth.uid() and lower(p.role) = 'admin'));
create policy "chats_delete_admin_only" on chats for delete using (exists (select 1 from profiles p where p.id = auth.uid() and lower(p.role) = 'admin'));

alter table chat_participants enable row level security;
create policy "chat_participants_select_self" on chat_participants for select using (user_id = auth.uid());
create policy "chat_participants_insert_by_chat_member_private" on chat_participants for insert with check (exists (select 1 from chats c where c.id = chat_id and auth.uid() = any (c.participants) and c.type <> 'group'));
create policy "chat_participants_insert_group_admin_only" on chat_participants for insert with check (exists (select 1 from chats c where c.id = chat_id and c.type = 'group' and exists (select 1 from profiles p where p.id = auth.uid() and lower(p.role) = 'admin')));

alter table messages enable row level security;
create policy "messages_select_by_chat_member" on messages for select using (exists (select 1 from chat_participants cp where cp.chat_id = chat_id and cp.user_id = auth.uid()));
create policy "messages_insert_by_chat_member_non_announcement_or_admin" on messages for insert with check (exists (select 1 from chats c where c.id = chat_id and auth.uid() = any (c.participants) and (c.type <> 'announcement' or exists (select 1 from profiles p where p.id = auth.uid() and lower(p.role) = 'admin'))));
