Best Shop - Інтернет-магазин

Багатосторінковий інтернет-магазин, розроблений з використанням HTML, SCSS та JavaScript.

Вимоги

Node.js
npm

Встановлення та запуск

1. Встановити залежності:
npm install

2. Запуск повного сервера (бекенд + фронтенд):

Для production:
npm run start:all

Для development (з автоперезавантаженням):
npm run dev:all

Ці команди запускають:
- Backend API сервер на http://localhost:3000
- Frontend сервер на http://localhost:5050
- Автоматичну компіляцію SCSS (тільки для dev:all)

3. Альтернативно - запуск окремо:

Термінал 1 (бекенд):
npm run server

Термінал 2 (фронтенд):
npm run dev

Або просто фронтенд без бекенду:
npm run start

Можливості

- Адаптивний дизайн: Підтримка breakpoints 768px, 1024px та 1440px
- Динамічний контент: Товари завантажуються з JSON файлу та API
- Кошик покупок: Управління кошиком на основі LocalStorage
- Фільтрація товарів: Фільтр за категорією, кольором, розміром та статусом знижок
- Пошук: Пошук товарів в реальному часі
- Відгуки користувачів: Додавання та перегляд відгуків про товари
- Валідація форм: Перевірка email та обов'язкових полів
- Авторизація: Система реєстрації та входу з JWT токенами
- Адмін-панель: Управління товарами, замовленнями та користувачами
- Розмежування прав доступу: Ролі guest, user та admin

Розробка

- Frontend сервер: http://localhost:5050
- Backend API сервер: http://localhost:3000
- API endpoints: http://localhost:3000/api
- Головна сторінка: index.html

Backend API Endpoints

Товари
- GET /api/products - Отримати всі товари
- GET /api/products/:id - Отримати товар за ID
- POST /api/products - Створити товар (тільки адмін)
- PUT /api/products/:id - Оновити товар (тільки адмін)
- DELETE /api/products/:id - Видалити товар (тільки адмін)

Категорії
- GET /api/categories - Отримати всі категорії
- GET /api/categories/:id - Отримати категорію за ID

Замовлення
- GET /api/orders - Отримати замовлення (авторизовані користувачі)
- GET /api/orders/:id - Отримати замовлення за ID
- POST /api/orders - Створити замовлення (авторизовані користувачі)
- PUT /api/orders/:id/status - Оновити статус замовлення (тільки адмін)

Авторизація
- POST /api/auth/login - Вхід в систему
- POST /api/auth/register - Реєстрація нового користувача
- GET /api/auth/me - Отримати поточного користувача
- POST /api/auth/logout - Вихід з системи

Користувачі
- GET /api/users - Отримати всіх користувачів (тільки адмін)
- GET /api/users/:id - Отримати користувача за ID
- PUT /api/users/:id - Оновити користувача
- DELETE /api/users/:id - Видалити користувача (тільки адмін)

Службові
- GET /api/health - Перевірка статусу сервера

Структура проекту

web/
├── database/              # База даних SQLite
│   ├── schema.sql         # Схема бази даних
│   ├── seed.sql           # Початкові дані
│   ├── queries.sql        # Тестові SQL запити
│   ├── bestshop.db        # Файл бази даних SQLite
│   └── DATABASE_README.md # Документація БД
├── server/                # Backend сервер
│   ├── config/            # Конфігурація
│   │   └── database.js    # Підключення до БД
│   ├── middleware/         # Middleware
│   │   └── auth.js        # Авторизація та ролі
│   ├── routes/            # API маршрути
│   │   ├── auth.js        # Авторизація
│   │   ├── products.js    # Товари
│   │   ├── orders.js      # Замовлення
│   │   ├── users.js       # Користувачі
│   │   └── categories.js  # Категорії
│   ├── test-api.http      # Приклади HTTP запитів
│   └── index.js           # Точка входу сервера
├── src/                   # Frontend код
│   ├── html/              # HTML сторінки
│   ├── js/                # JavaScript файли
│   ├── scss/              # SCSS стилі
│   └── assets/            # Зображення та дані
│       ├── data.json      # JSON дані товарів
│       └── images/        # Зображення
├── dist/                  # Скомпільовані файли
│   └── css/               # Скомпільований CSS
└── index.html             # Головна сторінка

Технології

- Frontend: HTML5, SCSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- База даних: SQLite
- Авторизація: JWT (JSON Web Tokens)
- Хешування паролів: bcrypt

Авторизація

Система підтримує три ролі:
- Guest - гість, може переглядати товари
- User - зареєстрований користувач, може робити замовлення
- Admin - адміністратор, має повний доступ до системи

Ліцензія

ISC
