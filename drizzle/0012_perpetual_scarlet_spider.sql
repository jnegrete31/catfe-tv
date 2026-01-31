CREATE TABLE `guestSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guestName` varchar(255) NOT NULL,
	`partySize` int NOT NULL DEFAULT 1,
	`durationMinutes` int NOT NULL,
	`checkInTime` timestamp NOT NULL DEFAULT (now()),
	`endTime` timestamp NOT NULL,
	`guestSessionStatus` enum('active','completed','expired') NOT NULL DEFAULT 'active',
	`reminderShown` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guestSessions_id` PRIMARY KEY(`id`)
);
