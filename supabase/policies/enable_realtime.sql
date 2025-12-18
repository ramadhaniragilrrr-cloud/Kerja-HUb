-- Enable Realtime for Chat Tables
-- Run this in Supabase SQL Editor

begin;
  -- Remove tables first to avoid errors if they are already added
  alter publication supabase_realtime drop table if exists messages;
  alter publication supabase_realtime drop table if exists chats;
  alter publication supabase_realtime drop table if exists chat_participants;

  -- Add tables to publication
  alter publication supabase_realtime add table messages;
  alter publication supabase_realtime add table chats;
  alter publication supabase_realtime add table chat_participants;
commit;
