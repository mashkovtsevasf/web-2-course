Best Shop - E-commerce Website

Multi-page e-commerce website built with HTML, SCSS, and JavaScript.

Prerequisites

Node.js
npm

Setup and Run

1. Install dependencies:
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

Features

- Responsive Design: Supports 768px, 1024px, and 1440px breakpoints
- Dynamic Content: Products loaded from JSON file
- Shopping Cart: LocalStorage-based cart management
- Product Filtering: Filter by category, color, size, and sales status
- Search: Real-time product search
- User Reviews: Add and view product reviews
- Form Validation: Email validation and required field checks

Development

- Frontend server: http://localhost:5050
- Backend API server: http://localhost:3000
- API endpoints: http://localhost:3000/api
- Main entry point: src/index.html

Backend API Endpoints

- GET /api/products - Отримати всі продукти
- GET /api/products/:id - Отримати продукт за ID
- POST /api/products - Створити продукт
- PUT /api/products/:id - Оновити продукт
- DELETE /api/products/:id - Видалити продукт
- GET /api/categories - Отримати категорії
- GET /api/orders - Отримати замовлення
- POST /api/orders - Створити замовлення
- POST /api/auth/login - Вхід
- POST /api/auth/register - Реєстрація
- GET /api/health - Перевірка статусу сервера



