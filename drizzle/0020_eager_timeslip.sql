CREATE TABLE `suggestedCaptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`captionType` enum('happy_tails','snap_purr') NOT NULL,
	`text` varchar(100) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suggestedCaptions_id` PRIMARY KEY(`id`)
);
