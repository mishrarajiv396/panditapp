-- ============================================================================
--  PanditApp — MySQL 8 schema
--  Run with:  npm run migrate   (or: mysql -u root -p < sql/schema.sql)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS panditapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE panditapp;

-- ---------------------------------------------------------------------------
-- Admin users (JWT login for the dashboard / API)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL DEFAULT 'Admin',
  role          ENUM('admin', 'manager') NOT NULL DEFAULT 'admin',
  active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Customer accounts (JWT login for the website / account page)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name               VARCHAR(120) NOT NULL,
  email              VARCHAR(190) DEFAULT NULL,
  phone              VARCHAR(20) DEFAULT NULL,
  password_hash      VARCHAR(255) NOT NULL,
  active             TINYINT(1) NOT NULL DEFAULT 1,
  email_verified     TINYINT(1) NOT NULL DEFAULT 0,
  phone_verified     TINYINT(1) NOT NULL DEFAULT 0,
  last_login_at      DATETIME DEFAULT NULL,
  reset_code_hash    VARCHAR(255) DEFAULT NULL,
  reset_code_expires DATETIME DEFAULT NULL,
  reset_code_channel VARCHAR(16) DEFAULT NULL,
  reset_code_target  VARCHAR(190) DEFAULT NULL,
  reset_attempts     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  KEY idx_users_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Cities / service areas (mirrors PanditData.CITIES)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cities (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(190) NOT NULL,
  state      VARCHAR(120) NOT NULL,
  lat        DECIMAL(9, 6) DEFAULT NULL,
  lon        DECIMAL(9, 6) DEFAULT NULL,
  tz         VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  hot        TINYINT(1) NOT NULL DEFAULT 0,
  district   TINYINT(1) NOT NULL DEFAULT 0,
  active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cities_name (name),
  KEY idx_cities_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Pooja catalogue (mirrors PanditData.POOJAS)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS poojas (
  id          VARCHAR(64) NOT NULL,
  name        VARCHAR(190) NOT NULL,
  name_hi     VARCHAR(190) DEFAULT NULL,
  category    VARCHAR(120) NOT NULL,
  icon        VARCHAR(32) DEFAULT NULL,
  price       INT UNSIGNED NOT NULL DEFAULT 0,
  mrp         INT UNSIGNED NOT NULL DEFAULT 0,
  duration    VARCHAR(60) DEFAULT NULL,
  popular     TINYINT(1) NOT NULL DEFAULT 0,
  tags        JSON DEFAULT NULL,
  description TEXT DEFAULT NULL,
  includes    JSON DEFAULT NULL,
  samagri     JSON DEFAULT NULL,
  active      TINYINT(1) NOT NULL DEFAULT 1,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_poojas_category (category),
  KEY idx_poojas_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Add-ons / extras (mirrors PanditData.EXTRAS)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS extras (
  id         VARCHAR(64) NOT NULL,
  name       VARCHAR(190) NOT NULL,
  price      INT UNSIGNED NOT NULL DEFAULT 0,
  icon       VARCHAR(32) DEFAULT NULL,
  note       VARCHAR(255) DEFAULT NULL,
  active     TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Pandit profiles (mirrors PanditData.PANDITS)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pandits (
  id               VARCHAR(64) NOT NULL,
  name             VARCHAR(190) NOT NULL,
  title            VARCHAR(120) DEFAULT NULL,
  area             VARCHAR(190) DEFAULT NULL,
  experience_years SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  rating           DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
  reviews          INT UNSIGNED NOT NULL DEFAULT 0,
  languages        JSON DEFAULT NULL,
  tradition        VARCHAR(120) DEFAULT NULL,
  specialities     JSON DEFAULT NULL,
  base_price       INT UNSIGNED NOT NULL DEFAULT 0,
  verified         TINYINT(1) NOT NULL DEFAULT 0,
  color            VARCHAR(16) DEFAULT NULL,
  bio              TEXT DEFAULT NULL,
  active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pandits_tradition (tradition),
  KEY idx_pandits_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Shop products (mirrors PanditData.PRODUCTS)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          VARCHAR(64) NOT NULL,
  name        VARCHAR(190) NOT NULL,
  category    VARCHAR(120) NOT NULL,
  price       INT UNSIGNED NOT NULL DEFAULT 0,
  mrp         INT UNSIGNED NOT NULL DEFAULT 0,
  icon        VARCHAR(32) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  active      TINYINT(1) NOT NULL DEFAULT 1,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category (category),
  KEY idx_products_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Pooja bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                 VARCHAR(32) NOT NULL,
  user_id            INT UNSIGNED DEFAULT NULL,
  type               VARCHAR(32) NOT NULL DEFAULT 'pooja',
  status             VARCHAR(40) NOT NULL DEFAULT 'Confirmed',
  pooja_id           VARCHAR(64) DEFAULT NULL,
  pooja_name         VARCHAR(190) DEFAULT NULL,
  booking_date       DATE DEFAULT NULL,
  date_label         VARCHAR(60) DEFAULT NULL,
  muhurat            VARCHAR(190) DEFAULT NULL,
  pandit_id          VARCHAR(64) DEFAULT NULL,
  pandit_name        VARCHAR(190) DEFAULT NULL,
  city               VARCHAR(120) DEFAULT NULL,
  place              VARCHAR(255) DEFAULT NULL,

  base_amount        INT UNSIGNED NOT NULL DEFAULT 0,
  extras_amount      INT UNSIGNED NOT NULL DEFAULT 0,
  gst_amount         INT UNSIGNED NOT NULL DEFAULT 0,
  total_amount       INT UNSIGNED NOT NULL DEFAULT 0,

  payment_method     VARCHAR(40) NOT NULL DEFAULT 'UPI',
  payment_status     VARCHAR(60) NOT NULL DEFAULT 'Pending',
  payment_ref        VARCHAR(190) DEFAULT NULL,
  pay_now            INT UNSIGNED NOT NULL DEFAULT 0,
  balance            INT UNSIGNED NOT NULL DEFAULT 0,
  amount_paid        INT UNSIGNED NOT NULL DEFAULT 0,
  upi_id             VARCHAR(190) DEFAULT NULL,
  otp                VARCHAR(8) DEFAULT NULL,

  customer_name      VARCHAR(190) NOT NULL,
  customer_phone     VARCHAR(40) NOT NULL,
  customer_email     VARCHAR(190) DEFAULT NULL,
  address            VARCHAR(255) DEFAULT NULL,
  society            VARCHAR(190) DEFAULT NULL,
  pincode            VARCHAR(12) DEFAULT NULL,
  gate               VARCHAR(120) DEFAULT NULL,
  gotra              VARCHAR(120) DEFAULT NULL,
  language           VARCHAR(60) DEFAULT NULL,
  tradition          VARCHAR(120) DEFAULT NULL,
  notes              TEXT DEFAULT NULL,
  gstin              VARCHAR(40) DEFAULT NULL,
  company            VARCHAR(190) DEFAULT NULL,
  gate_pass          TINYINT(1) NOT NULL DEFAULT 0,

  extras             JSON DEFAULT NULL,
  extras_list        JSON DEFAULT NULL,

  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment_claimed_at DATETIME DEFAULT NULL,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_bookings_user (user_id),
  KEY idx_bookings_phone (customer_phone),
  KEY idx_bookings_date (booking_date),
  KEY idx_bookings_status (status),
  KEY idx_bookings_payment_status (payment_status),
  KEY idx_bookings_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Samagri shop orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             VARCHAR(32) NOT NULL,
  user_id        INT UNSIGNED DEFAULT NULL,
  customer_name  VARCHAR(190) NOT NULL,
  phone          VARCHAR(40) NOT NULL,
  email          VARCHAR(190) DEFAULT NULL,
  address        VARCHAR(255) DEFAULT NULL,
  city           VARCHAR(120) DEFAULT NULL,
  pincode        VARCHAR(12) DEFAULT NULL,
  items          JSON DEFAULT NULL,
  subtotal       INT UNSIGNED NOT NULL DEFAULT 0,
  shipping       INT UNSIGNED NOT NULL DEFAULT 0,
  total          INT UNSIGNED NOT NULL DEFAULT 0,
  status         VARCHAR(40) NOT NULL DEFAULT 'new',
  payment_status VARCHAR(60) NOT NULL DEFAULT 'Pending',
  notes          TEXT DEFAULT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_user (user_id),
  KEY idx_orders_phone (phone),
  KEY idx_orders_status (status),
  KEY idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Pandit join applications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pandit_applications (
  id         VARCHAR(32) NOT NULL,
  name       VARCHAR(190) NOT NULL,
  phone      VARCHAR(40) NOT NULL,
  city       VARCHAR(120) NOT NULL,
  experience VARCHAR(60) DEFAULT NULL,
  tradition  VARCHAR(120) DEFAULT NULL,
  note       TEXT DEFAULT NULL,
  status     VARCHAR(40) NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_applications_phone (phone),
  KEY idx_applications_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Contact / enquiry messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(190) NOT NULL,
  email      VARCHAR(190) DEFAULT NULL,
  phone      VARCHAR(40) DEFAULT NULL,
  subject    VARCHAR(190) DEFAULT NULL,
  message    TEXT NOT NULL,
  status     VARCHAR(40) NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Editable site settings (owner details, seva text, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(64) NOT NULL,
  value       JSON NOT NULL,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
