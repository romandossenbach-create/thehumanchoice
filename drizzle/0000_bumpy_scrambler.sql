CREATE TABLE `athletes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` text NOT NULL,
	`request_id` text NOT NULL,
	`reps` integer NOT NULL,
	`entry_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_entries_athlete_date` ON `entries` (`athlete_id`,`entry_date`);--> statement-breakpoint
CREATE INDEX `idx_entries_date` ON `entries` (`entry_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_entries_request_id` ON `entries` (`request_id`);