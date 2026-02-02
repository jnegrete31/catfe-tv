CREATE TABLE `pollVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pollId` int NOT NULL,
	`optionId` varchar(50) NOT NULL,
	`voterFingerprint` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pollVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` varchar(255) NOT NULL,
	`pollStatus` enum('draft','active','ended') NOT NULL DEFAULT 'draft',
	`options` text NOT NULL,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`totalVotes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `polls_id` PRIMARY KEY(`id`)
);
