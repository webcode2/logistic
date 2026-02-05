create or replace function keepalive()
returns void
language plpgsql
as $$
begin
  insert into pam (name) values ('Heartbeat at ' || now());
end;
$$;