Best Shop Database Schema

Опис

Ця база даних створена для веб-застосунку Best Shop згідно з вимогами Практичної роботи 4.

Структура файлів

- schema.sql - SQL-схема бази даних (створення таблиць, ключів, індексів, тригерів)
- seed.sql - Початкові дані для наповнення бази
- queries.sql - Тестові SELECT-запити для перевірки зв'язків

Використання

SQLite (рекомендовано для тестування)

Створити базу даних:
sqlite3 bestshop.db < database/schema.sql

Наповнити даними:
sqlite3 bestshop.db < database/seed.sql

Виконати тестові запити:
sqlite3 bestshop.db < database/queries.sql

PostgreSQL

Створити базу даних:
createdb bestshop
psql bestshop < database/schema.sql
psql bestshop < database/seed.sql

MySQL

Створити базу даних:
mysql -u root -p
CREATE DATABASE bestshop;
USE bestshop;
source database/schema.sql;
source database/seed.sql;

Структура таблиць

Основні таблиці

1. Roles - Ролі користувачів (guest, user, admin)
2. Users - Користувачі системи
3. UserRoles - Зв'язок користувачів та ролей (many-to-many)
4. Categories - Категорії продуктів
5. Products - Продукти магазину
6. Orders - Замовлення
7. OrderItems - Позиції замовлень

Службові таблиці

8. Sessions - Сесії користувачів (токени)
9. AuditLogs - Журнал змін (аудит)

Ключі та обмеження

PRIMARY KEY
- Всі таблиці мають автоінкрементний PRIMARY KEY

FOREIGN KEY
- UserRoles: 
  - user_id -> Users(user_id) (CASCADE DELETE/UPDATE)
  - role_id -> Roles(role_id) (RESTRICT DELETE)
  - assigned_by -> Users(user_id) (SET NULL DELETE)
- Categories:
  - parent_category_id -> Categories(category_id) (SET NULL DELETE)
- Products: 
  - category_id -> Categories(category_id) (RESTRICT DELETE)
- Orders: 
  - user_id -> Users(user_id) (RESTRICT DELETE)
- OrderItems: 
  - order_id -> Orders(order_id) (CASCADE DELETE)
  - product_id -> Products(product_id) (SET NULL DELETE)
- Sessions: 
  - user_id -> Users(user_id) (CASCADE DELETE)
- AuditLogs: 
  - user_id -> Users(user_id) (SET NULL DELETE)

UNIQUE
- Users.email - унікальний email
- Roles.role_name - унікальна назва ролі
- Categories.category_name - унікальна назва категорії
- Categories.category_slug - унікальний slug категорії
- Products.product_code - унікальний код продукту
- Orders.order_number - унікальний номер замовлення
- UserRoles(user_id, role_id) - унікальна комбінація
- Sessions.token - унікальний токен сесії

CHECK
- Roles.role_name IN ('guest', 'user', 'admin')
- Users.email має формат email (LIKE '%@%.%')
- Users.password_hash мінімум 8 символів
- Categories.category_name != ''
- Products.price >= 0
- Products.stock >= 0
- Products.rating від 0 до 5
- Products.popularity >= 0
- Orders.subtotal >= 0
- Orders.shipping >= 0
- Orders.discount >= 0
- Orders.total >= 0
- Orders.status IN ('pending', 'processing', 'completed', 'cancelled')
- OrderItems.quantity > 0
- OrderItems.product_price >= 0
- OrderItems.subtotal >= 0
- Sessions.expires_at > created_at
- AuditLogs.action_type IN ('INSERT', 'UPDATE', 'DELETE')

Індекси

Створені індекси для оптимізації:
- Users: email, is_active
- UserRoles: user_id, role_id
- Products: category_id, product_code, is_active, sales_status, price
- Orders: user_id, status, created_at, order_number
- OrderItems: order_id, product_id
- Sessions: user_id, token, expires_at
- AuditLogs: user_id, table_name, created_at

Тригери

Автоматичне оновлення updated_at при зміні записів:
- update_users_timestamp
- update_products_timestamp
- update_orders_timestamp
- update_categories_timestamp

Початкові дані

Ролі
- guest
- user
- admin

Користувачі
- admin@bestshop.com (admin)
- user@example.com (user)
- test@example.com (user)
- customer@example.com (user)

Категорії
- Suitcases
- Carry-ons
- Luggage Sets
- Kids' Luggage

Продукти
- 12 тестових продуктів у різних категоріях

Замовлення
- 5 тестових замовлень з різними статусами

Тестові запити

Файл queries.sql містить:
1. JOIN запити між таблицями
2. Фільтри та умови
3. Агрегатні функції (COUNT, SUM, AVG)
4. Складні запити з підзапитами
5. Запити з датами

Примітки

- Схема оптимізована для SQLite, але сумісна з PostgreSQL та MySQL
- Паролі в seed.sql - це приклади, в реальній системі використовуйте bcrypt
- Для production додайте додаткові індекси за потреби
