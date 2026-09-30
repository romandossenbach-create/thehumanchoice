CREATE TABLE `athlete_history` (
	`activity_id` text PRIMARY KEY NOT NULL,
	`athlete_id` text NOT NULL,
	`activity_type` text NOT NULL,
	`challenge_type` text,
	`snapshot_json` text NOT NULL,
	`status` text NOT NULL,
	`verification_status` text DEFAULT 'UNVERIFIED' NOT NULL,
	`visibility` text DEFAULT 'PRIVATE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_athlete_history_athlete_created` ON `athlete_history` (`athlete_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `athlete_history_audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activity_id` text NOT NULL,
	`old_value` text NOT NULL,
	`new_value` text NOT NULL,
	`reason` text NOT NULL,
	`actor_user_id` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `athlete_history`(`activity_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_history_audit_activity` ON `athlete_history_audit` (`activity_id`);--> statement-breakpoint
CREATE TABLE `athlete_history_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activity_id` text NOT NULL,
	`snapshot_type` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`visibility` text DEFAULT 'PRIVATE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `athlete_history`(`activity_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_history_snapshots_activity` ON `athlete_history_snapshots` (`activity_id`);--> statement-breakpoint
ALTER TABLE `challenges` ADD `time_zone` text DEFAULT 'Europe/Zurich' NOT NULL;