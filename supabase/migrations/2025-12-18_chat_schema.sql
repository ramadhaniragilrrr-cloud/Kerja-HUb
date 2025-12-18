alter table chats add column if not exists type text default 'private';
alter table chats add constraint chats_type_check check (type in ('private','group','announcement'));
alter table chats add column if not exists participants uuid[] default '{}'::uuid[];
