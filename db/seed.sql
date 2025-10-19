-- Seed data for BookHive
USE bookhive;

INSERT INTO publisher (name) VALUES ('Penguin'),('O''Reilly'),('HarperCollins');

INSERT INTO author (name) VALUES ('J. K. Rowling'),('George R. R. Martin'),('Robert C. Martin');

INSERT INTO category (name) VALUES ('Fantasy'),('Programming'),('Fiction');

INSERT INTO book (isbn, title, publisher_id, publish_year, price, stock_qty, description)
VALUES 
('9780439554930','Harry Potter and the Sorcerer''s Stone',1,1997,399.00,50,'First book in the Harry Potter series'),
('9780596007126','Head First Design Patterns',2,2004,899.00,25,'Design patterns in Java'),
('9780061120084','To Kill a Mockingbird',3,1960,499.00,30,'Classic novel');

INSERT INTO book_author VALUES (1,1),(2,3),(3,2);
INSERT INTO book_category VALUES (1,1),(2,2),(3,3);

-- demo password hashes are placeholders; replace with real hashes when registering
INSERT INTO customer (email, password_hash, full_name, phone) VALUES
('alice@example.com','$2a$10$U6a0nC9.3i7P0bqz8U6GEOiY1l5/2Qq2aZC8bS6dZ1e4v1r6a7bKe','Alice Kumar','9999999999'),
('bob@example.com','$2a$10$U6a0nC9.3i7P0bqz8U6GEOiY1l5/2Qq2aZC8bS6dZ1e4v1r6a7bKe','Bob Rao','8888888888');

INSERT INTO address (customer_id, line1, city, state, postal_code, country, is_default)
VALUES (1,'221B Baker Street','Chennai','TN','600001','India',1),
       (2,'742 Evergreen Terrace','Hyderabad','TS','500001','India',1);

INSERT INTO cart_item (customer_id, book_id, qty) VALUES (1,1,1),(1,2,1);
