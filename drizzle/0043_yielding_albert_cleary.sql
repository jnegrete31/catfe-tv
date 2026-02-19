ALTER TABLE `slideTemplates` DROP INDEX `slideTemplates_screenType_unique`;--> statement-breakpoint
ALTER TABLE `slideTemplates` ADD `screenId` int;