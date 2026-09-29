CREATE TABLE `challenges` (
	`owner_user_id` text PRIMARY KEY NOT NULL,
	`days` integer NOT NULL,
	`target` integer NOT NULL,
	`start` text NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`today` integer DEFAULT 0 NOT NULL,
	`today_date` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
