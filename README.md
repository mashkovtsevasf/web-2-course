Best Shop - E-commerce Website

Multi-page e-commerce website built with HTML, SCSS, and JavaScript.

Prerequisites

Node.js
npm

Setup and Run

1. Install dependencies:
   npm install

2. Compile SCSS and start development server:
   npm run dev

   This command will:
   - Run linting checks (ESLint for JavaScript, Stylelint for SCSS)
   - Compile SCSS to CSS (compiled CSS files are placed in dist/css folder)
   - Watch for SCSS file changes and automatically recompile
   - Start a local HTTP server on port 5050
   - Open the website in your default browser

Features

- Responsive Design: Supports 768px, 1024px, and 1440px breakpoints
- Dynamic Content: Products loaded from JSON file
- Shopping Cart: LocalStorage-based cart management
- Product Filtering: Filter by category, color, size, and sales status
- Search: Real-time product search
- User Reviews: Add and view product reviews
- Form Validation: Email validation and required field checks

Development

- The development server runs on http://localhost:5050
- Main entry point: src/index.html

Build

To compile SCSS without watching:
npm run compile

Linting

Linting runs automatically when you start the development server with npm run dev. The linting process checks JavaScript and SCSS files before compiling and starting the server.

Checklist

64 out of 64 points achieved.

