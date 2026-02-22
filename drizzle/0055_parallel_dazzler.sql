CREATE TABLE `bookingArrivals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`bookingRef` varchar(64),
	`arrivedAt` timestamp NOT NULL DEFAULT (now()),
	`markedByUserId` int,
	`guestName` varchar(255),
	`partySize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookingArrivals_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookingArrivals_bookingId_unique` UNIQUE(`bookingId`)
);
