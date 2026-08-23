-- Thamarai Queue — unowned restaurant waitlist (auth-off, no user_id)
create table if not exists branches (
  id text primary key,
  name text not null,
  area text not null,
  address text not null,
  capacity integer not null,
  hours text not null default '6:00 AM – 2:00 AM',
  phone text not null
);

create table if not exists seats (
  id text primary key,
  branch_id text not null references branches(id),
  seat_code text not null,
  label text not null,
  capacity integer not null,
  hall text not null,
  reserved boolean not null default false
);
create unique index if not exists seats_branch_code_idx on seats (branch_id, seat_code);
create index if not exists seats_branch_idx on seats (branch_id);

create table if not exists tokens (
  id text primary key,
  branch_id text not null references branches(id),
  token_no text not null,
  service_date text not null,
  session text not null,
  guest_label text not null,
  phone_last4 text not null,
  guests integer not null,
  notes text not null default '',
  allow_split boolean not null default false,
  status text not null,
  notified boolean not null default false,
  created_at timestamptz not null default now(),
  seated_at timestamptz,
  completed_at timestamptz
);
create unique index if not exists tokens_day_no_idx on tokens (branch_id, service_date, token_no);
create index if not exists tokens_board_idx on tokens (branch_id, service_date, status, created_at);

create table if not exists seatings (
  id serial primary key,
  token_id text not null references tokens(id) on delete cascade,
  seat_id text not null references seats(id),
  guests integer not null,
  created_at timestamptz not null default now()
);
create index if not exists seatings_token_idx on seatings (token_id);
create index if not exists seatings_seat_idx on seatings (seat_id);

create table if not exists callouts (
  id serial primary key,
  branch_id text not null,
  token_no text not null,
  guest_label text not null,
  table_label text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists callouts_branch_idx on callouts (branch_id, created_at desc);

create table if not exists seed_meta (
  k text primary key,
  v text not null
);
