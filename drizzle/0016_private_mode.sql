ALTER TABLE athletes ADD COLUMN private_mode integer NOT NULL DEFAULT 0;
--> statement-breakpoint
UPDATE athletes SET private_mode = 1 WHERE id = '0431b2b7-b3d3-4666-b5ad-f0d53709b686' AND athlete_number = 1 AND owner_user_id = '77e8d9e3-e947-4185-955f-28502e4a8deb';
