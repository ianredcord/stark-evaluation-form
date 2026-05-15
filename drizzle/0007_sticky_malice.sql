ALTER TABLE `evaluationTemplates` ADD `clinicId` varchar(64);--> statement-breakpoint
ALTER TABLE `evaluations` ADD `clinicId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `clinicId` varchar(64);