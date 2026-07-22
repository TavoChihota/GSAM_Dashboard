# GSAM Portal Dashboard

This repository contains the GSAM Portal application.
It is a Laravel backend with an Inertia-powered React frontend.
The React app lives in `resources/js`, and the Laravel app provides routing, API integration, and server-side rendering of the Inertia pages.

## What this project includes

- Laravel 13 application with PHP 8.3 support
- Inertia.js + React UI in `resources/js`
- Tailwind CSS and Vite for frontend assets
- Highcharts visualization components
- GSAM API integration through `app/Services/GsamApiClient.php`
- Dashboard and analytics pages served via Inertia

## Prerequisites

- PHP 8.3
- Composer
- Node.js 18+ / npm
- Git
- A local or accessible GSAM .NET API instance

## Quick start

```bash
cd gsam-portal-app
composer install
cp .env.example .env
php artisan key:generate
npm install
```

### Configure environment

Open `.env` and set these values at minimum:

```env
APP_NAME="GSAM Portal"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

GSAM_API_BASE_URL=https://localhost:44356

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gsam_portal
DB_USERNAME=root
DB_PASSWORD=
```

> If you do not need the local database for frontend development, you may still need a valid `.env` and app key.

The GSAM API base URL is configured in `config/services.php` under the `gsam.base_url` key.

## Run the app locally

### Option 1: Development mode

This starts the Laravel server, Vite, the queue listener, and logs watcher if you use the built-in dev script.

```bash
npm run dev
```

Then visit:

- `http://127.0.0.1:8000`

### Option 2: Manual start

If you want a simpler startup without the extra queue watcher:

```bash
php artisan serve
npm run dev
```

## Build for production

```bash
npm run build
```

## Project structure

- `app/` — Laravel application code and controllers
- `app/Http/Controllers/DashboardController.php` — dashboard and analytics controller
- `app/Services/GsamApiClient.php` — HTTP client integration to the GSAM .NET API
- `config/` — Laravel config files
- `config/services.php` — GSAM base URL and service credentials
- `database/` — migrations, factories, seeders
- `public/` — public web assets
- `resources/js/` — React frontend source
  - `resources/js/app.jsx` — Vite + Inertia entry point
  - `resources/js/Components/` — reusable React components
  - `resources/js/Pages/` — Inertia page components
- `routes/web.php` — web routes for the app
- `vite.config.js` — Vite configuration for Laravel + React
- `package.json` — frontend dependencies and scripts
- `composer.json` — PHP dependencies and scripts

## Useful commands

```bash
composer install
npm install
php artisan key:generate
php artisan migrate
php artisan serve
npm run dev
npm run build
php artisan test
```

## Notes

- The React UI is rendered through Inertia, so page navigation is managed by Laravel routes with React views.
- The GSAM API client uses `config('services.gsam.base_url')`, so update `GSAM_API_BASE_URL` in `.env` if your API is running on a different port.
- `resources/js` is the active frontend code, not a separate standalone app.
- If the GSAM backend uses a self-signed certificate, the Laravel HTTP client currently disables SSL verification in `app/Services/GsamApiClient.php`.

## Troubleshooting

- If you see missing environment values, ensure `.env` exists and `APP_KEY` is generated.
- If Vite does not compile, check `npm install` completed successfully.
- If pages fail to load, make sure both `php artisan serve` and `npm run dev` are running.
- If the dashboard cannot fetch API data, verify `GSAM_API_BASE_URL` points to your .NET API instance.

## Getting started

1. Clone the repo
2. Install PHP and Node dependencies
3. Copy `.env.example` to `.env`
4. Generate `APP_KEY`
5. Update `GSAM_API_BASE_URL` and any DB settings
6. Start the app with `npm run dev`
7. Open `http://127.0.0.1:8000`

If you want, I can also add a second README section that explains the GSAM API endpoints and the React dashboard page flow. 