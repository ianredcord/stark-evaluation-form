CREATE TABLE `evaluationFeedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evaluationId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evaluationFeedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `evaluationFeedbacks_evaluationId_idx` ON `evaluationFeedbacks` (`evaluationId`);
