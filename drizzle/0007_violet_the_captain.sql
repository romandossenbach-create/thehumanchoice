UPDATE entries
SET athlete_id = (
  SELECT COALESCE(
    MAX(CASE WHEN candidate.id = '0431b2b7-b3d3-4666-b5ad-f0d53709b686' THEN candidate.id END),
    MIN(candidate.id)
  )
  FROM athletes current_profile
  JOIN athletes candidate ON candidate.owner_user_id = current_profile.owner_user_id
  WHERE current_profile.id = entries.athlete_id AND current_profile.owner_user_id <> ''
)
WHERE athlete_id IN (
  SELECT duplicate.id FROM athletes duplicate
  JOIN (
    SELECT owner_user_id FROM athletes WHERE owner_user_id <> ''
    GROUP BY owner_user_id HAVING COUNT(*) > 1
  ) owners ON owners.owner_user_id = duplicate.owner_user_id
);
--> statement-breakpoint
DELETE FROM athletes
WHERE owner_user_id <> '' AND id <> (
  SELECT COALESCE(
    MAX(CASE WHEN candidate.id = '0431b2b7-b3d3-4666-b5ad-f0d53709b686' THEN candidate.id END),
    MIN(candidate.id)
  )
  FROM athletes candidate WHERE candidate.owner_user_id = athletes.owner_user_id
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_athletes_owner_user_id` ON `athletes` (`owner_user_id`) WHERE "athletes"."owner_user_id" <> '';
