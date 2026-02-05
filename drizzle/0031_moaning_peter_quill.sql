CREATE TABLE `slideTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`screenType` enum('SNAP_AND_PURR','EVENT','TODAY_AT_CATFE','MEMBERSHIP','REMINDER','ADOPTION','ADOPTION_SHOWCASE','ADOPTION_COUNTER','THANK_YOU','LIVESTREAM','HAPPY_TAILS','SNAP_PURR_GALLERY','HAPPY_TAILS_QR','SNAP_PURR_QR','POLL','POLL_QR','CHECK_IN') NOT NULL DEFAULT 'EVENT',
	`name` varchar(255) NOT NULL,
	`backgroundColor` varchar(32) DEFAULT '#1a1a2e',
	`backgroundGradient` varchar(255),
	`backgroundImageUrl` varchar(1024),
	`elements` text NOT NULL,
	`defaultFontFamily` varchar(64) DEFAULT 'Inter',
	`defaultFontColor` varchar(32) DEFAULT '#ffffff',
	`showAnimations` boolean NOT NULL DEFAULT true,
	`animationStyle` varchar(32) DEFAULT 'fade',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `slideTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `slideTemplates_screenType_unique` UNIQUE(`screenType`)
);
