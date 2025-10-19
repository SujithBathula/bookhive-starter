-- BookHive MySQL schema, triggers, views, and stored procedure
CREATE DATABASE IF NOT EXISTS bookhive CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE bookhive;

-- Customers & Addresses
CREATE TABLE IF NOT EXISTS customer (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS address (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  line1 VARCHAR(200) NOT NULL,
  line2 VARCHAR(200),
  city VARCHAR(80) NOT NULL,
  state VARCHAR(80) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(80) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_address_customer FOREIGN KEY (customer_id)
    REFERENCES customer(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Catalog
CREATE TABLE IF NOT EXISTS publisher (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS author (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL
) ENGINE=InnoDB;
CREATE INDEX idx_author_name ON author(name);

CREATE TABLE IF NOT EXISTS category (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS book (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  isbn VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  publisher_id BIGINT,
  publish_year YEAR,
  price DECIMAL(10,2) NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  CONSTRAINT fk_book_publisher FOREIGN KEY (publisher_id)
    REFERENCES publisher(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
CREATE INDEX idx_book_title ON book(title);
CREATE INDEX idx_book_price ON book(price);

CREATE TABLE IF NOT EXISTS book_author (
  book_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL,
  PRIMARY KEY (book_id, author_id),
  CONSTRAINT fk_ba_book FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE,
  CONSTRAINT fk_ba_author FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS book_category (
  book_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  PRIMARY KEY (book_id, category_id),
  CONSTRAINT fk_bc_book FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE,
  CONSTRAINT fk_bc_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cart
CREATE TABLE IF NOT EXISTS cart_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_cart_customer_book (customer_id, book_id),
  CONSTRAINT fk_ci_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_book FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Orders
CREATE TABLE IF NOT EXISTS `order` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT NOT NULL,
  shipping_address_id BIGINT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('placed','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'placed',
  placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT,
  CONSTRAINT fk_order_address FOREIGN KEY (shipping_address_id) REFERENCES address(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE INDEX idx_order_customer ON `order`(customer_id);
CREATE INDEX idx_order_status ON `order`(status);

CREATE TABLE IF NOT EXISTS order_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  line_total DECIMAL(10,2) AS (ROUND(unit_price * qty, 2)) STORED,
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES `order`(id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_book FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
CREATE INDEX idx_order_item_order ON order_item(order_id);

CREATE TABLE IF NOT EXISTS payment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL UNIQUE,
  method ENUM('card','upi','netbanking','cod') NOT NULL,
  status ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  txn_ref VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  paid_at DATETIME NULL,
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES `order`(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Admin
CREATE TABLE IF NOT EXISTS admin (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_action_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT NOT NULL,
  action VARCHAR(120) NOT NULL,
  payload JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aal_admin FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Triggers & Procedure
DELIMITER $$
CREATE TRIGGER trg_check_stock_before_insert
BEFORE INSERT ON order_item
FOR EACH ROW
BEGIN
  DECLARE available INT;
  SELECT stock_qty INTO available FROM book WHERE id = NEW.book_id FOR UPDATE;
  IF available < NEW.qty THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for this book';
  END IF;
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_decrement_stock_after_insert
AFTER INSERT ON order_item
FOR EACH ROW
BEGIN
  UPDATE book SET stock_qty = stock_qty - NEW.qty WHERE id = NEW.book_id;
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_restore_stock_after_order_update
AFTER UPDATE ON `order`
FOR EACH ROW
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    UPDATE book b
    JOIN order_item oi ON oi.book_id = b.id
    SET b.stock_qty = b.stock_qty + oi.qty
    WHERE oi.order_id = NEW.id;
  END IF;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_place_order (
  IN p_customer_id BIGINT,
  IN p_shipping_address_id BIGINT,
  OUT p_order_id BIGINT
)
BEGIN
  DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0.00;
  DECLARE v_tax DECIMAL(10,2) DEFAULT 0.00;
  DECLARE v_shipping DECIMAL(10,2) DEFAULT 49.00;
  DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;

  SELECT SUM(b.price * ci.qty)
    INTO v_subtotal
  FROM cart_item ci
  JOIN book b ON b.id = ci.book_id
  WHERE ci.customer_id = p_customer_id;

  IF v_subtotal IS NULL OR v_subtotal = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cart is empty';
  END IF;

  SET v_tax = ROUND(v_subtotal * 0.10, 2);
  SET v_total = v_subtotal + v_tax + v_shipping;

  INSERT INTO `order` (customer_id, shipping_address_id, subtotal, tax, shipping_fee, total_amount, status)
  VALUES (p_customer_id, p_shipping_address_id, v_subtotal, v_tax, v_shipping, v_total, 'placed');
  SET p_order_id = LAST_INSERT_ID();

  INSERT INTO order_item (order_id, book_id, unit_price, qty)
  SELECT p_order_id, b.id, b.price, ci.qty
  FROM cart_item ci
  JOIN book b ON b.id = ci.book_id
  WHERE ci.customer_id = p_customer_id;

  DELETE FROM cart_item WHERE customer_id = p_customer_id;
END $$
DELIMITER ;
