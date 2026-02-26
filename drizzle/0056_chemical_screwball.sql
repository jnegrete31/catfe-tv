CREATE TABLE `catPhotoVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`voterFingerprint` varchar(64) NOT NULL,
	`voteCount` int NOT NULL DEFAULT 1,
	`isDonationVote` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catPhotoVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donationVoteTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`voterFingerprint` varchar(64) NOT NULL,
	`tokensTotal` int NOT NULL,
	`tokensRemaining` int NOT NULL,
	`amountCents` int NOT NULL,
	`stripePaymentId` varchar(255),
	`donorName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `donationVoteTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guestCatPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`catId` int NOT NULL,
	`photoUrl` varchar(1024) NOT NULL,
	`uploaderName` varchar(255) NOT NULL,
	`uploaderFingerprint` varchar(64) NOT NULL,
	`caption` varchar(300),
	`voteCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guestCatPhotos_id` PRIMARY KEY(`id`)
);
