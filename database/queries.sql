SELECT 
    u.user_id,
    u.email,
    u.name,
    r.role_name,
    r.role_description,
    ur.assigned_at
FROM Users u
INNER JOIN UserRoles ur ON u.user_id = ur.user_id
INNER JOIN Roles r ON ur.role_id = r.role_id
ORDER BY u.email, r.role_name;

SELECT 
    p.product_id,
    p.product_code,
    p.name,
    p.price,
    p.stock,
    c.category_name,
    c.category_slug
FROM Products p
INNER JOIN Categories c ON p.category_id = c.category_id
ORDER BY c.category_name, p.name;

SELECT 
    o.order_id,
    o.order_number,
    u.name AS customer_name,
    u.email AS customer_email,
    o.total,
    o.status,
    o.created_at
FROM Orders o
INNER JOIN Users u ON o.user_id = u.user_id
ORDER BY o.created_at DESC;

SELECT 
    o.order_number,
    u.name AS customer_name,
    oi.product_name,
    oi.quantity,
    oi.product_price,
    oi.subtotal AS item_subtotal,
    o.total AS order_total,
    o.status
FROM Orders o
INNER JOIN Users u ON o.user_id = u.user_id
INNER JOIN OrderItems oi ON o.order_id = oi.order_id
LEFT JOIN Products p ON oi.product_id = p.product_id
ORDER BY o.order_number, oi.order_item_id;

SELECT 
    p.product_code,
    p.name,
    c.category_name,
    p.price,
    p.stock,
    COUNT(oi.order_item_id) AS orders_count,
    SUM(oi.quantity) AS total_quantity_sold
FROM Products p
INNER JOIN Categories c ON p.category_id = c.category_id
LEFT JOIN OrderItems oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.product_code, p.name, c.category_name, p.price, p.stock
ORDER BY orders_count DESC, p.name;

SELECT 
    p.product_code,
    p.name,
    p.price,
    c.category_name,
    p.sales_status
FROM Products p
INNER JOIN Categories c ON p.category_id = c.category_id
WHERE p.sales_status = 1 
    AND p.is_active = 1
    AND p.stock > 0
ORDER BY p.price;

SELECT 
    u.user_id,
    u.email,
    u.name,
    r.role_name
FROM Users u
INNER JOIN UserRoles ur ON u.user_id = ur.user_id
INNER JOIN Roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'admin'
    AND u.is_active = 1;

SELECT 
    o.order_number,
    u.name AS customer_name,
    o.total,
    o.status,
    o.created_at
FROM Orders o
INNER JOIN Users u ON o.user_id = u.user_id
WHERE o.status = 'pending'
ORDER BY o.created_at;

SELECT 
    p.product_code,
    p.name,
    p.price,
    p.rating,
    p.popularity
FROM Products p
INNER JOIN Categories c ON p.category_id = c.category_id
WHERE c.category_slug = 'suitcases'
    AND p.rating >= 4.5
    AND p.is_active = 1
ORDER BY p.rating DESC, p.popularity DESC;

SELECT 
    c.category_name,
    COUNT(p.product_id) AS products_count,
    AVG(p.price) AS avg_price,
    MIN(p.price) AS min_price,
    MAX(p.price) AS max_price,
    SUM(p.stock) AS total_stock
FROM Categories c
LEFT JOIN Products p ON c.category_id = p.category_id AND p.is_active = 1
GROUP BY c.category_id, c.category_name
ORDER BY products_count DESC;

SELECT 
    u.user_id,
    u.email,
    u.name,
    COUNT(o.order_id) AS orders_count,
    COALESCE(SUM(o.total), 0) AS total_spent,
    AVG(o.total) AS avg_order_value
FROM Users u
LEFT JOIN Orders o ON u.user_id = o.user_id
GROUP BY u.user_id, u.email, u.name
ORDER BY total_spent DESC;

SELECT 
    p.product_code,
    p.name,
    p.price,
    COUNT(oi.order_item_id) AS times_ordered,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.subtotal) AS total_revenue
FROM Products p
LEFT JOIN OrderItems oi ON p.product_id = oi.product_id
WHERE p.is_active = 1
GROUP BY p.product_id, p.product_code, p.name, p.price
ORDER BY total_quantity_sold DESC, times_ordered DESC
LIMIT 5;

SELECT 
    o.status,
    COUNT(o.order_id) AS orders_count,
    SUM(o.total) AS total_revenue,
    AVG(o.total) AS avg_order_value
FROM Orders o
GROUP BY o.status
ORDER BY orders_count DESC;

SELECT 
    (SELECT COUNT(*) FROM Users WHERE is_active = 1) AS total_users,
    (SELECT COUNT(*) FROM Products WHERE is_active = 1) AS total_products,
    (SELECT COUNT(*) FROM Orders) AS total_orders,
    (SELECT SUM(total) FROM Orders) AS total_revenue,
    (SELECT AVG(total) FROM Orders) AS avg_order_value,
    (SELECT COUNT(*) FROM Orders WHERE status = 'completed') AS completed_orders;

SELECT 
    u.user_id,
    u.email,
    u.name,
    (SELECT COUNT(*) FROM Orders WHERE user_id = u.user_id) AS orders_count,
    (SELECT SUM(total) FROM Orders WHERE user_id = u.user_id) AS total_spent
FROM Users u
WHERE (SELECT COUNT(*) FROM Orders WHERE user_id = u.user_id) > 1
ORDER BY orders_count DESC;

SELECT 
    p.product_code,
    p.name,
    p.price,
    c.category_name
FROM Products p
INNER JOIN Categories c ON p.category_id = c.category_id
WHERE p.product_id NOT IN (SELECT DISTINCT product_id FROM OrderItems WHERE product_id IS NOT NULL)
    AND p.is_active = 1
ORDER BY p.name;

SELECT 
    u.email,
    u.name,
    o.order_number,
    o.total,
    o.created_at
FROM Users u
INNER JOIN Orders o ON u.user_id = o.user_id
WHERE o.total = (
    SELECT MAX(total) 
    FROM Orders 
    WHERE user_id = u.user_id
)
ORDER BY o.total DESC;

SELECT 
    o.order_number,
    u.name AS customer_name,
    o.total,
    o.status,
    o.created_at
FROM Orders o
INNER JOIN Users u ON o.user_id = u.user_id
WHERE o.created_at >= datetime('now', '-1 month')
ORDER BY o.created_at DESC;

SELECT 
    u.email,
    u.name,
    u.created_at,
    r.role_name
FROM Users u
INNER JOIN UserRoles ur ON u.user_id = ur.user_id
INNER JOIN Roles r ON ur.role_id = r.role_id
WHERE u.created_at >= datetime('now', '-7 days')
ORDER BY u.created_at DESC;
