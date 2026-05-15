ALTER TABLE `evaluations` ADD `shareCode` varchar(32);--> statement-breakpoint
ALTER TABLE `evaluations` ADD `sharedAt` timestamp;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `viewCount` int DEFAULT 0 NOT NULL;