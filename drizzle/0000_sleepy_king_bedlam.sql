CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actor_id` varchar(36) NOT NULL,
	`actor_name` varchar(100),
	`action` varchar(60) NOT NULL,
	`entity_type` varchar(40) NOT NULL,
	`entity_id` varchar(40),
	`details` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`delivery_id` varchar(20) NOT NULL,
	`order_id` int NOT NULL,
	`warehouse_id` int,
	`transporter` varchar(150),
	`vehicle_number` varchar(30),
	`driver_name` varchar(100),
	`tracking_number` varchar(60),
	`dispatch_date` timestamp,
	`expected_delivery_date` timestamp,
	`actual_delivery_date` timestamp,
	`status` varchar(30) NOT NULL DEFAULT 'processing',
	`proof_of_delivery_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `deliveries_delivery_id_unique` UNIQUE(`delivery_id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`franchisee_id` int NOT NULL,
	`doc_type` varchar(50) NOT NULL,
	`doc_name` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`uploaded_by` varchar(50) DEFAULT 'admin',
	`expiry_date` timestamp,
	`status` varchar(20) DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `franchise_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`application_id` varchar(20) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`mobile` varchar(15) NOT NULL,
	`whatsapp` varchar(15),
	`email` varchar(255) NOT NULL,
	`date_of_birth` varchar(10),
	`gender` varchar(10),
	`pan_number` varchar(10) NOT NULL,
	`aadhaar_number` varchar(12) NOT NULL,
	`gst_number` varchar(15),
	`address_line1` text NOT NULL,
	`address_line2` text,
	`city` varchar(100) NOT NULL,
	`district` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`pincode` varchar(6) NOT NULL,
	`business_name` varchar(255),
	`business_type` varchar(100),
	`years_in_business` varchar(10),
	`existing_fertilizer_dealer` boolean DEFAULT false,
	`current_brands` text,
	`shop_area` varchar(50),
	`warehouse_area` varchar(50),
	`franchise_type` varchar(50) NOT NULL,
	`preferred_location` varchar(255) NOT NULL,
	`coverage_area` text,
	`investment_capacity` decimal(12,2) NOT NULL,
	`bank_name` varchar(255),
	`account_number` varchar(20),
	`ifsc_code` varchar(11),
	`account_holder_name` varchar(255),
	`pan_document` text,
	`aadhaar_document` text,
	`gst_document` text,
	`address_proof` text,
	`bank_statement` text,
	`shop_photo` text,
	`passport_photo` text,
	`status` varchar(30) NOT NULL DEFAULT 'submitted',
	`remarks` text,
	`reviewed_by` varchar(100),
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `franchise_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `franchise_applications_application_id_unique` UNIQUE(`application_id`)
);
--> statement-breakpoint
CREATE TABLE `franchise_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`franchisee_id` int NOT NULL,
	`stage` int NOT NULL,
	`stage_name` varchar(100) NOT NULL,
	`status` varchar(20) DEFAULT 'pending',
	`remarks` text,
	`completed_at` timestamp,
	`updated_by` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `franchise_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `franchisee_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`application_id` varchar(20),
	`franchise_code` varchar(20),
	`franchise_type` varchar(50),
	`mobile` varchar(15),
	`address` text,
	`city` varchar(100),
	`state` varchar(100),
	`pan_number` varchar(10),
	`gst_number` varchar(15),
	`profile_photo` text,
	`total_investment` decimal(14,2) DEFAULT '0',
	`paid_amount` decimal(14,2) DEFAULT '0',
	`pending_amount` decimal(14,2) DEFAULT '0',
	`progress_stage` int DEFAULT 0,
	`progress_percent` int DEFAULT 0,
	`status` varchar(30) DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `franchisee_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `franchisee_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `franchisee_stock` (
	`id` int AUTO_INCREMENT NOT NULL,
	`franchisee_id` int NOT NULL,
	`product_id` int NOT NULL,
	`batch_number` varchar(64) NOT NULL DEFAULT '',
	`quantity` int NOT NULL DEFAULT 0,
	`reserved` int NOT NULL DEFAULT 0,
	`expiry_date` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `franchisee_stock_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`franchisee_id` int NOT NULL,
	`invoice_number` varchar(30) NOT NULL,
	`invoice_date` timestamp NOT NULL,
	`due_date` timestamp,
	`amount` decimal(12,2) NOT NULL,
	`tax_amount` decimal(12,2) DEFAULT '0',
	`total_amount` decimal(12,2) NOT NULL,
	`status` varchar(20) DEFAULT 'unpaid',
	`description` text,
	`file_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(30) DEFAULT 'info',
	`is_read` boolean DEFAULT false,
	`link` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity` int NOT NULL,
	`rate` decimal(12,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` varchar(20) NOT NULL,
	`franchisee_id` int NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'order_received',
	`total_amount` decimal(14,2) NOT NULL DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_id_unique` UNIQUE(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`franchisee_id` int NOT NULL,
	`transaction_id` varchar(50) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`payment_date` timestamp NOT NULL,
	`payment_mode` varchar(30),
	`reference_number` varchar(100),
	`purpose` varchar(255),
	`status` varchar(20) DEFAULT 'completed',
	`remarks` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_transaction_id_unique` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sku` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`unit` varchar(30) NOT NULL DEFAULT 'bag',
	`sale_price` decimal(12,2) NOT NULL DEFAULT '0',
	`gst_rate` decimal(5,2) NOT NULL DEFAULT '0',
	`min_stock_level` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `staff_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(30) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_members_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`franchisee_id` int,
	`warehouse_id` int,
	`batch_number` varchar(64) NOT NULL DEFAULT '',
	`movement_type` varchar(20) NOT NULL,
	`quantity` int NOT NULL,
	`reference_number` varchar(50),
	`remarks` text,
	`performed_by` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_id` int NOT NULL,
	`sender_type` varchar(20) NOT NULL,
	`sender_name` varchar(100),
	`message` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`franchisee_id` int NOT NULL,
	`ticket_number` varchar(20) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(50),
	`priority` varchar(20) DEFAULT 'medium',
	`status` varchar(20) DEFAULT 'open',
	`assigned_to` varchar(100),
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `support_tickets_ticket_number_unique` UNIQUE(`ticket_number`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`is_admin` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`city` varchar(100),
	`state` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouses_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_franchisee_id_franchisee_profiles_id_fk` FOREIGN KEY (`franchisee_id`) REFERENCES `franchisee_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `franchise_progress` ADD CONSTRAINT `franchise_progress_franchisee_id_franchisee_profiles_id_fk` FOREIGN KEY (`franchisee_id`) REFERENCES `franchisee_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `franchisee_profiles` ADD CONSTRAINT `franchisee_profiles_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `franchisee_stock` ADD CONSTRAINT `franchisee_stock_franchisee_id_franchisee_profiles_id_fk` FOREIGN KEY (`franchisee_id`) REFERENCES `franchisee_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `franchisee_stock` ADD CONSTRAINT `franchisee_stock_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_franchisee_id_franchisee_profiles_id_fk` FOREIGN KEY (`franchisee_id`) REFERENCES `franchisee_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_franchisee_id_franchisee_profiles_id_fk` FOREIGN KEY (`franchisee_id`) REFERENCES `franchisee_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_franchisee_id_franchisee_profiles_id_fk` FOREIGN KEY (`franchisee_id`) REFERENCES `franchisee_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_members` ADD CONSTRAINT `staff_members_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_franchisee_id_franchisee_profiles_id_fk` FOREIGN KEY (`franchisee_id`) REFERENCES `franchisee_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_messages` ADD CONSTRAINT `support_messages_ticket_id_support_tickets_id_fk` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_franchisee_id_franchisee_profiles_id_fk` FOREIGN KEY (`franchisee_id`) REFERENCES `franchisee_profiles`(`id`) ON DELETE cascade ON UPDATE no action;