CREATE TABLE `screenTimeSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`screenId` int NOT NULL,
	`timeSlotId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `screenTimeSlots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `screenViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`screenId` int NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	`sessionId` varchar(64),
	CONSTRAINT `screenViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `screens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`screenType` enum('SNAP_AND_PURR','EVENT','TODAY_AT_CATFE','MEMBERSHIP','REMINDER','ADOPTION','THANK_YOU') NOT NULL DEFAULT 'EVENT',
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`body` text,
	`imagePath` varchar(1024),
	`qrUrl` varchar(1024),
	`startAt` timestamp,
	`endAt` timestamp,
	`daysOfWeek` json,
	`timeStart` varchar(5),
	`timeEnd` varchar(5),
	`priority` int NOT NULL DEFAULT 1,
	`durationSeconds` int NOT NULL DEFAULT 10,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`isProtected` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `screens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationName` varchar(255) NOT NULL DEFAULT 'Catfé',
	`defaultDurationSeconds` int NOT NULL DEFAULT 10,
	`fallbackMode` enum('AMBIENT','LOOP_DEFAULT') NOT NULL DEFAULT 'LOOP_DEFAULT',
	`brandColors` json,
	`snapAndPurrFrequency` int NOT NULL DEFAULT 5,
	`githubRepo` varchar(255),
	`githubBranch` varchar(64) DEFAULT 'main',
	`refreshIntervalSeconds` int NOT NULL DEFAULT 60,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`timeStart` varchar(5) NOT NULL,
	`timeEnd` varchar(5) NOT NULL,
	`daysOfWeek` json NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeSlots_id` PRIMARY KEY(`id`)
);
