CREATE TABLE `road_plans` (
	`owner_user_id` text PRIMARY KEY NOT NULL,
	`day` integer DEFAULT 1 NOT NULL,
	`max_reps` integer DEFAULT 0 NOT NULL,
	`done_json` text DEFAULT '[]' NOT NULL,
	`actuals_json` text DEFAULT '{}' NOT NULL,
	`plan_date` text NOT NULL,
	`actual_day` text NOT NULL,
	`celebrated` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
