ALTER TABLE `playlists` ADD `schedulingEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `playlists` ADD `playlistDaysOfWeek` json;--> statement-breakpoint
ALTER TABLE `playlists` ADD `playlistTimeStart` varchar(5);--> statement-breakpoint
ALTER TABLE `playlists` ADD `playlistTimeEnd` varchar(5);--> statement-breakpoint
ALTER TABLE `playlists` ADD `color` varchar(32) DEFAULT '#C2884E';