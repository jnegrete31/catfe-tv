ALTER TABLE `settings` ADD `wixAutoSyncEnabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `wixLastSyncAt` timestamp;