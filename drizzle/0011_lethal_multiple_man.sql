CREATE TABLE `athlete_number_sequence` (
	`id` integer PRIMARY KEY NOT NULL,
	`next_number` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `athletes` ADD `athlete_number` integer;--> statement-breakpoint
UPDATE `athletes` SET `athlete_number` = 1 WHERE `id` = '0431b2b7-b3d3-4666-b5ad-f0d53709b686';--> statement-breakpoint
UPDATE `athletes`
SET `athlete_number` = 1 + (
	SELECT COUNT(*) FROM `athletes` AS earlier
	WHERE earlier.`id` <> '0431b2b7-b3d3-4666-b5ad-f0d53709b686'
	AND (earlier.`created_at` < `athletes`.`created_at` OR (earlier.`created_at` = `athletes`.`created_at` AND earlier.`id` <= `athletes`.`id`))
)
WHERE `id` <> '0431b2b7-b3d3-4666-b5ad-f0d53709b686';--> statement-breakpoint
CREATE UNIQUE INDEX `idx_athletes_athlete_number` ON `athletes` (`athlete_number`);--> statement-breakpoint
INSERT INTO `athlete_number_sequence` (`id`, `next_number`)
VALUES (1, COALESCE((SELECT MAX(`athlete_number`) + 1 FROM `athletes`), 2));
