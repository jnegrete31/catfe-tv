CREATE TABLE `instagramPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instagramId` varchar(255) NOT NULL,
	`mediaType` varchar(50) NOT NULL,
	`mediaUrl` varchar(1024) NOT NULL,
	`thumbnailUrl` varchar(1024),
	`caption` text,
	`permalink` varchar(1024),
	`postedAt` timestamp,
	`isHidden` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instagramPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `instagramPosts_instagramId_unique` UNIQUE(`instagramId`)
);
--> statement-breakpoint
CREATE TABLE `volunteers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`photoUrl` varchar(1024),
	`bio` text,
	`role` varchar(255),
	`startDate` timestamp,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `volunteers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `screens` MODIFY COLUMN `screenType` enum('SNAP_AND_PURR','EVENT','TODAY_AT_CATFE','MEMBERSHIP','REMINDER','ADOPTION','ADOPTION_SHOWCASE','ADOPTION_COUNTER','THANK_YOU','LIVESTREAM','HAPPY_TAILS','SNAP_PURR_GALLERY','HAPPY_TAILS_QR','SNAP_PURR_QR','POLL','POLL_QR','CHECK_IN','GUEST_STATUS_BOARD','LIVE_AVAILABILITY','SESSION_BOARD','SOCIAL_FEED','BIRTHDAY_CELEBRATION','VOLUNTEER_SPOTLIGHT','CUSTOM') NOT NULL DEFAULT 'EVENT';--> statement-breakpoint
ALTER TABLE `slideTemplates` MODIFY COLUMN `screenType` enum('SNAP_AND_PURR','EVENT','TODAY_AT_CATFE','MEMBERSHIP','REMINDER','ADOPTION','ADOPTION_SHOWCASE','ADOPTION_COUNTER','THANK_YOU','LIVESTREAM','HAPPY_TAILS','SNAP_PURR_GALLERY','HAPPY_TAILS_QR','SNAP_PURR_QR','POLL','POLL_QR','CHECK_IN','GUEST_STATUS_BOARD','LIVE_AVAILABILITY','SESSION_BOARD','SOCIAL_FEED','BIRTHDAY_CELEBRATION','VOLUNTEER_SPOTLIGHT','CUSTOM') NOT NULL DEFAULT 'EVENT';