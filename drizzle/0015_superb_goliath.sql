CREATE TABLE `photoSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoType` enum('happy_tails','snap_purr') NOT NULL,
	`photoStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`submitterName` varchar(255) NOT NULL,
	`submitterEmail` varchar(320),
	`photoUrl` varchar(1024) NOT NULL,
	`caption` varchar(500),
	`catName` varchar(255),
	`adoptionDate` timestamp,
	`reviewedAt` timestamp,
	`reviewedBy` int,
	`rejectionReason` varchar(500),
	`displayOrder` int NOT NULL DEFAULT 0,
	`showOnTv` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photoSubmissions_id` PRIMARY KEY(`id`)
);
