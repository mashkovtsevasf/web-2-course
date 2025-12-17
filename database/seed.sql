INSERT INTO Roles (role_name, role_description) VALUES
('guest', 'Гість - неавторизований користувач'),
('user', 'Звичайний користувач - авторизований користувач'),
('admin', 'Адміністратор - повний доступ до системи');

INSERT INTO Categories (category_name, category_slug, description) VALUES
('Suitcases', 'suitcases', 'Великі валізи для подорожей'),
('Carry-ons', 'carry-ons', 'Ручна поклажа'),
('Luggage Sets', 'luggage-sets', 'Набори валіз'),
('Kids'' Luggage', 'kids-luggage', 'Дитячі валізи');

INSERT INTO Users (email, password_hash, name, phone, address, is_active) VALUES
('admin@bestshop.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Admin', NULL, NULL, 1),
('user@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'John Doe', NULL, NULL, 1),
('test@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Jane Smith', NULL, NULL, 1),
('customer@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Bob Johnson', NULL, NULL, 1);

INSERT INTO UserRoles (user_id, role_id, assigned_by) 
SELECT u.user_id, r.role_id, u.user_id
FROM Users u, Roles r
WHERE u.email = 'admin@bestshop.com' AND r.role_name = 'admin';

INSERT INTO UserRoles (user_id, role_id, assigned_by)
SELECT u.user_id, r.role_id, (SELECT user_id FROM Users WHERE email = 'admin@bestshop.com')
FROM Users u, Roles r
WHERE u.email != 'admin@bestshop.com' AND r.role_name = 'user';

INSERT INTO Products (product_code, name, description, price, stock, image_url, color, size, category_id, sales_status, rating, popularity) VALUES
('SU001', 'Global Explorer Max Comfort Suitcase Pro', 'Велика валіза з максимальним комфортом для подорожей', 250.00, 15, 'assets/images/suitcases/selected-suitcase-red-card.png', 'red', 'M', 1, 1, 4.5, 90),
('SU002', 'Luxury Lightweight Travel Suitcase', 'Легка розкішна валіза для подорожей', 280.00, 20, 'assets/images/suitcases/catalog-blue-suitcase.png', 'blue', 'L', 1, 0, 4.0, 85),
('SU003', 'Urban Compact Travel Suitcase', 'Компактна міська валіза', 310.00, 12, 'assets/images/suitcases/new-suitcase-handgrey-card.png', 'grey', 'XL', 1, 1, 4.7, 95),
('SU004', 'Traveller''s Comfort Weekender Suitcase', 'Валіза для коротких поїздок', 240.00, 18, 'assets/images/suitcases/catalog-green-suitcase.png', 'green', 'S', 1, 1, 4.2, 88),
('SU005', 'Explorer Pro Durable Suitcase', 'Міцна валіза для дослідників', 270.00, 10, 'assets/images/suitcases/catalog-black-suitcase.png', 'black', 'M', 1, 0, 4.0, 70),
('CO001', 'Business Class Carry-On', 'Ручна поклажа бізнес-класу', 180.00, 25, 'assets/images/suitcases/catalog-blue-suitcase.png', 'blue', 'S', 2, 1, 4.3, 80),
('CO002', 'Compact Travel Carry-On', 'Компактна ручна поклажа', 160.00, 30, 'assets/images/suitcases/catalog-red-suitcase.png', 'red', 'S', 2, 1, 4.1, 75),
('SET001', 'Premium Travel Set (3 pieces)', 'Преміум набір з 3 валіз', 750.00, 8, 'assets/images/suitcases/set-of-suitcase-red-small.png', 'red', 'M-L-XL', 3, 1, 4.8, 92),
('SET002', 'Family Travel Set (4 pieces)', 'Сімейний набір з 4 валіз', 950.00, 5, 'assets/images/suitcases/set-of-suitcase-blue-small.png', 'blue', 'S-M-L-XL', 3, 1, 4.6, 88),
('KL001', 'Kids Adventure Suitcase', 'Дитяча валіза для пригод', 120.00, 20, 'assets/images/suitcases/catalog-kids-suitcase-1.png', 'yellow', 'S', 4, 1, 4.4, 82),
('KL002', 'Kids Fun Travel Suitcase', 'Весела дитяча валіза', 110.00, 22, 'assets/images/suitcases/catalog-kids-suitcase-2.png', 'pink', 'S', 4, 1, 4.2, 78);

INSERT INTO Orders (order_number, user_id, subtotal, shipping, discount, total, status, shipping_address) VALUES
('ORD-20240101-001', (SELECT user_id FROM Users WHERE email = 'user@example.com'), 490.00, 30.00, 0.00, 520.00, 'completed', 'Lviv, Ukraine'),
('ORD-20240102-002', (SELECT user_id FROM Users WHERE email = 'user@example.com'), 250.00, 30.00, 0.00, 280.00, 'processing', 'Lviv, Ukraine'),
('ORD-20240103-003', (SELECT user_id FROM Users WHERE email = 'test@example.com'), 750.00, 30.00, 75.00, 705.00, 'pending', 'Odesa, Ukraine'),
('ORD-20240104-004', (SELECT user_id FROM Users WHERE email = 'customer@example.com'), 180.00, 30.00, 0.00, 210.00, 'completed', 'Kharkiv, Ukraine'),
('ORD-20240105-005', (SELECT user_id FROM Users WHERE email = 'test@example.com'), 310.00, 30.00, 0.00, 340.00, 'completed', 'Odesa, Ukraine');

INSERT INTO OrderItems (order_id, product_id, product_name, product_price, quantity, size, color, subtotal)
SELECT 
    (SELECT order_id FROM Orders WHERE order_number = 'ORD-20240101-001'),
    p.product_id,
    p.name,
    p.price,
    1,
    p.size,
    p.color,
    p.price
FROM Products p
WHERE p.product_code = 'SU001'
UNION ALL
SELECT 
    (SELECT order_id FROM Orders WHERE order_number = 'ORD-20240101-001'),
    p.product_id,
    p.name,
    p.price,
    1,
    p.size,
    p.color,
    p.price
FROM Products p
WHERE p.product_code = 'SU004';

INSERT INTO OrderItems (order_id, product_id, product_name, product_price, quantity, size, color, subtotal)
SELECT 
    (SELECT order_id FROM Orders WHERE order_number = 'ORD-20240102-002'),
    p.product_id,
    p.name,
    p.price,
    1,
    p.size,
    p.color,
    p.price
FROM Products p
WHERE p.product_code = 'SU001';

INSERT INTO OrderItems (order_id, product_id, product_name, product_price, quantity, size, color, subtotal)
SELECT 
    (SELECT order_id FROM Orders WHERE order_number = 'ORD-20240103-003'),
    p.product_id,
    p.name,
    p.price,
    1,
    p.size,
    p.color,
    p.price
FROM Products p
WHERE p.product_code = 'SET001';

INSERT INTO OrderItems (order_id, product_id, product_name, product_price, quantity, size, color, subtotal)
SELECT 
    (SELECT order_id FROM Orders WHERE order_number = 'ORD-20240104-004'),
    p.product_id,
    p.name,
    p.price,
    1,
    p.size,
    p.color,
    p.price
FROM Products p
WHERE p.product_code = 'CO001';

INSERT INTO OrderItems (order_id, product_id, product_name, product_price, quantity, size, color, subtotal)
SELECT 
    (SELECT order_id FROM Orders WHERE order_number = 'ORD-20240105-005'),
    p.product_id,
    p.name,
    p.price,
    1,
    p.size,
    p.color,
    p.price
FROM Products p
WHERE p.product_code = 'SU003';

INSERT INTO AuditLogs (user_id, action_type, table_name, record_id, new_values, ip_address) VALUES
((SELECT user_id FROM Users WHERE email = 'admin@bestshop.com'), 'INSERT', 'Products', (SELECT product_id FROM Products WHERE product_code = 'SU001'), '{"name": "Global Explorer Max Comfort Suitcase Pro", "price": 250.00}', '192.168.1.1'),
((SELECT user_id FROM Users WHERE email = 'admin@bestshop.com'), 'UPDATE', 'Orders', (SELECT order_id FROM Orders WHERE order_number = 'ORD-20240102-002'), '{"status": "processing"}', '192.168.1.1');
