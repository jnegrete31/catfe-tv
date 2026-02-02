ALTER TABLE `polls` ADD `pollType` enum('template','custom') DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE `polls` ADD `catCount` int DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `polls` ADD `lastShownAt` timestamp;