create or replace view projects_by_most_recent as
select 
    p.id, 
    p.created_at, 
    p.name, 
    p.description, 
    p.status, 
    p.user_id, 
    p.billable, 
    p.seq, 
    p.hidden,
    coalesce(w.max_start_time, p.created_at) as last_used,
    (w.max_start_time is null) as "new"
from 
    projects p
left join (
    select 
        project_id, 
        user_id,
        max(start_time) as max_start_time
    from 
        worksession
    group by 
        project_id, user_id
) w on p.id = w.project_id and p.user_id = w.user_id

order by 
    coalesce(w.max_start_time, p.created_at) desc;