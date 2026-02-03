ALTER TABLE `screens` MODIFY COLUMN `screenType` enum('SNAP_AND_PURR','EVENT','TODAY_AT_CATFE','MEMBERSHIP','REMINDER','ADOPTION','ADOPTION_SHOWCASE','ADOPTION_COUNTER','THANK_YOU','LIVESTREAM','HAPPY_TAILS','SNAP_PURR_GALLERY','HAPPY_TAILS_QR','SNAP_PURR_QR','POLL','POLL_QR','CHECK_IN') NOT NULL DEFAULT 'EVENT';--> statement-breakpoint
ALTER TABLE `settings` ADD `wifiName` varchar(255);--> statement-breakpoint
ALTER TABLE `settings` ADD `wifiPassword` varchar(255);--> statement-breakpoint
ALTER TABLE `settings` ADD `houseRules` json;