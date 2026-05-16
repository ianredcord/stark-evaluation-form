CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`birthdate` varchar(20),
	`gender` varchar(16),
	`height` int,
	`weight` int,
	`phone` varchar(32),
	`primaryConcern` text,
	`primaryTherapistId` varchar(64),
	`tenantId` varchar(64),
	`status` enum('active','pending','completed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prescriptionKB` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`slug` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameEn` varchar(100),
	`category` enum('core','hip','shoulder','balance','mobility','redcord') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`defaultSets` int NOT NULL,
	`defaultReps` varchar(32) NOT NULL,
	`videoUrl` varchar(500),
	`thumbnailUrl` varchar(500),
	`thumbnailEmoji` varchar(16),
	`targetAreas` json,
	`description` text,
	`tag` varchar(64),
	`cues` json,
	`contraindications` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescriptionKB_id` PRIMARY KEY(`id`),
	CONSTRAINT `prescriptionKB_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `evaluations` ADD `clientId` int;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `chiefComplaint` text;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `clientGoals` text;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `plainExplanation` text;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `interventionNotes` text;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `topThreeIssues` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `recommendedPlan` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `interventionTypes` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `weekPlan` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `reassessDate` varchar(20);--> statement-breakpoint
ALTER TABLE `evaluations` ADD `riskLevel` enum('low','mid','high');--> statement-breakpoint
ALTER TABLE `evaluations` ADD `overallScore` int;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `subScores` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `bodyRiskMap` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `strengths` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `inBodyData` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `assignedTherapistId` varchar(64);--> statement-breakpoint
ALTER TABLE `evaluations` ADD `prescriptions` json;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `shareCode` varchar(20);--> statement-breakpoint
ALTER TABLE `evaluations` ADD `shareCodeCreatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `evaluations` ADD `lastViewedByClient` timestamp;