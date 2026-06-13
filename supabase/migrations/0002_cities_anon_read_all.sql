-- Allow anon to read all cities regardless of is_active.
-- is_active now only controls nav/footer visibility (filtered in code via
-- getNavCities), not whether a city's pages exist or are indexed.
drop policy "anon read cities" on cities;
create policy "anon read cities" on cities for select using (true);
