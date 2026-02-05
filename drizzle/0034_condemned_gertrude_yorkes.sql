CREATE TABLE `photoLikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`voterFingerprint` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photoLikes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `photoSubmissions` ADD `likesCount` int DEFAULT 0 NOT NULL;