-- Create the image_generation_logs table
create table if not exists public.image_generation_logs (
    id uuid primary key,
    user_id uuid references auth.users(id),
    timestamp bigint not null,
    status text not null check (status in ('processing', 'completed', 'error')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.image_generation_logs enable row level security;

-- Create policies
create policy "Users can insert their own logs"
    on public.image_generation_logs
    for insert
    with check (
        auth.uid() = user_id
    );

create policy "Users can view their own logs"
    on public.image_generation_logs
    for select
    using (
        auth.uid() = user_id
    );

create policy "Users can update their own logs"
    on public.image_generation_logs
    for update
    using (
        auth.uid() = user_id
    );

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on public.image_generation_logs to authenticated;