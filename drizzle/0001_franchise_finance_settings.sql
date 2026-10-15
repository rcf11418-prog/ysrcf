CREATE TABLE `franchise_settings` (
  `id` int NOT NULL,
  `franchise_types` text NOT NULL,
  `investment_categories` text NOT NULL,
  `legal_name` varchar(255),
  `gstin` varchar(15),
  `pan` varchar(10),
  `registered_address` text,
  `state` varchar(100),
  `state_code` varchar(2),
  `payment_details_ciphertext` text,
  `payment_details_published` boolean NOT NULL DEFAULT false,
  `updated_by` varchar(36),
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
