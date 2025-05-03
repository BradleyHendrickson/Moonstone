DROP VIEW IF EXISTS public.projects_by_most_recent;

CREATE VIEW
  public.projects_by_most_recent WITH (security_invoker) AS
SELECT
  p.id,
  p.created_at,
  p.name,
  p.description,
  p.status,
  p.user_id,
  p.billable,
  p.seq,
  p.hidden,
  COALESCE(w.max_start_time, p.created_at) AS last_used,
  (w.max_start_time IS NULL) AS "new"
FROM
  projects p
  LEFT JOIN (
    SELECT
      project_id,
      user_id,
      MAX(start_time) AS max_start_time
    FROM
      worksession
    GROUP BY
      project_id,
      user_id
  ) w ON p.id = w.project_id
  AND p.user_id = w.user_id
ORDER BY
  COALESCE(w.max_start_time, p.created_at) DESC;