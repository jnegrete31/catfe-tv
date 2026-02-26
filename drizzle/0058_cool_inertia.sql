CREATE TABLE `contestRounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roundNumber` int NOT NULL,
	`startAt` timestamp NOT NULL,
	`endAt` timestamp NOT NULL,
	`contestRoundStatus` enum('active','completed') NOT NULL DEFAULT 'active',
	`totalPhotos` int NOT NULL DEFAULT 0,
	`totalVotes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contestRounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contestWinners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roundId` int NOT NULL,
	`catId` int NOT NULL,
	`photoId` int NOT NULL,
	`photoUrl` varchar(1024) NOT NULL,
	`uploaderName` varchar(255) NOT NULL,
	`caption` varchar(300),
	`catName` varchar(255) NOT NULL,
	`rank` int NOT NULL,
	`voteCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contestWinners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `guestCatPhotos` ADD `roundId` int;