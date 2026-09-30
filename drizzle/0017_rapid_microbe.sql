ALTER TABLE `athletes` ADD `private_mode` integer DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE athletes SET private_mode = 1 WHERE athlete_number = 1 AND id = '0431b2b7-b3d3-4666-b5ad-f0d53709b686';
