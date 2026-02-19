ALTER TABLE `cats` MODIFY COLUMN `catStatus` enum('available','adopted','medical_hold','foster','trial') NOT NULL DEFAULT 'available';--> statement-breakpoint
ALTER TABLE `slideTemplates` ADD CONSTRAINT `slideTemplates_screenType_unique` UNIQUE(`screenType`);--> statement-breakpoint
ALTER TABLE `screens` DROP COLUMN `eventDate`;--> statement-breakpoint
ALTER TABLE `slideTemplates` DROP COLUMN `screenId`;