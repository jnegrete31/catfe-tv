CREATE TABLE `guestSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guestName` varchar(255) NOT NULL,
	`guestCount` int NOT NULL DEFAULT 1,
	`sessionDuration` enum('15','30','60') NOT NULL,
	`sessionStatus` enum('active','completed','extended') NOT NULL DEFAULT 'active',
	`checkInAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`checkedOutAt` timestamp,
	`notes` text,
	`reminderShown` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guestSessions_id` PRIMARY KEY(`id`)
);
