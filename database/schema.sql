DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS UserRoles;
DROP TABLE IF EXISTS Sessions;
DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Roles;

CREATE TABLE Roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (role_name IN ('guest', 'user', 'admin'))
);

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    CHECK (email LIKE '%@%.%'),
    CHECK (LENGTH(password_hash) >= 8)
);

CREATE TABLE UserRoles (
    user_role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES Users(user_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    UNIQUE(user_id, role_id)
);

CREATE TABLE Categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES Categories(category_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CHECK (category_name != '')
);

CREATE TABLE Products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    color VARCHAR(50),
    size VARCHAR(20),
    category_id INTEGER NOT NULL,
    sales_status BOOLEAN DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    popularity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CHECK (price >= 0),
    CHECK (stock >= 0),
    CHECK (rating >= 0 AND rating <= 5),
    CHECK (popularity >= 0)
);

CREATE TABLE Orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping DECIMAL(10, 2) DEFAULT 30.00,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    shipping_address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CHECK (subtotal >= 0),
    CHECK (shipping >= 0),
    CHECK (discount >= 0),
    CHECK (total >= 0),
    CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
);

CREATE TABLE OrderItems (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CHECK (quantity > 0),
    CHECK (product_price >= 0),
    CHECK (subtotal >= 0)
);

CREATE TABLE Sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CHECK (expires_at > created_at)
);

CREATE TABLE AuditLogs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_active ON Users(is_active);
CREATE INDEX idx_userroles_user_id ON UserRoles(user_id);
CREATE INDEX idx_userroles_role_id ON UserRoles(role_id);
CREATE INDEX idx_products_category_id ON Products(category_id);
CREATE INDEX idx_products_code ON Products(product_code);
CREATE INDEX idx_products_active ON Products(is_active);
CREATE INDEX idx_products_sales_status ON Products(sales_status);
CREATE INDEX idx_products_price ON Products(price);
CREATE INDEX idx_orders_user_id ON Orders(user_id);
CREATE INDEX idx_orders_status ON Orders(status);
CREATE INDEX idx_orders_created_at ON Orders(created_at);
CREATE INDEX idx_orders_number ON Orders(order_number);
CREATE INDEX idx_orderitems_order_id ON OrderItems(order_id);
CREATE INDEX idx_orderitems_product_id ON OrderItems(product_id);
CREATE INDEX idx_sessions_user_id ON Sessions(user_id);
CREATE INDEX idx_sessions_token ON Sessions(token);
CREATE INDEX idx_sessions_expires_at ON Sessions(expires_at);
CREATE INDEX idx_auditlogs_user_id ON AuditLogs(user_id);
CREATE INDEX idx_auditlogs_table_name ON AuditLogs(table_name);
CREATE INDEX idx_auditlogs_created_at ON AuditLogs(created_at);

CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON Users
BEGIN
    UPDATE Users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER update_products_timestamp 
AFTER UPDATE ON Products
BEGIN
    UPDATE Products SET updated_at = CURRENT_TIMESTAMP WHERE product_id = NEW.product_id;
END;

CREATE TRIGGER update_orders_timestamp 
AFTER UPDATE ON Orders
BEGIN
    UPDATE Orders SET updated_at = CURRENT_TIMESTAMP WHERE order_id = NEW.order_id;
END;

CREATE TRIGGER update_categories_timestamp 
AFTER UPDATE ON Categories
BEGIN
    UPDATE Categories SET updated_at = CURRENT_TIMESTAMP WHERE category_id = NEW.category_id;
END;
