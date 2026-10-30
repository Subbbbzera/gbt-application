# Gold Bud Trans

Web application for **Gold Bud Trans**, a company specializing in the rental and sale of heavy construction equipment and machinery (excavators, mobile cranes, dump trucks, loaders, etc.).

The project is implemented as a client-server web application (React Single Page Application + Express.js REST API with a MySQL database).

---

## Features

### For Users / Customers:
- **Equipment Catalog:** Filter by category and deal type (rental / purchase), view detailed specifications and photo galleries.
- **Order Placement:** Flexible rental period selection, automatic cost calculation, and promo code discounts.
- **Verification:** Securely attach identity/driver license documents for rental verification.
- **User Profile / Dashboard:** Order history, real-time status tracking (document verification, awaiting prepayment, active rental, completed), and PDF invoice download.
- **Reviews & Ratings:** Leave feedback, ratings, and threaded replies for equipment.

### For Administrators:
- **Catalog Management:** Add, edit, delete equipment, upload image galleries, and toggle item availability.
- **Order Processing:** Review customer identity documents, update order statuses, and track prepayments.
- **Analytics & Statistics:** Monthly revenue charts (Chart.js), top popular equipment metrics, and summary sales reports with Excel (.xlsx) export.
- **Promo Codes & Content:** Generate discount coupons with expiration dates and usage limits, manage company news and homepage slider banners.
- **Notifications:** Automated alerts for new orders via Telegram Bot and email notifications (Nodemailer).

---

## Tech Stack

- **Frontend:** React 19, Tailwind CSS, React Router 7, Chart.js, React Icons
- **Backend:** Node.js, Express 5, JWT, Multer, Nodemailer, PDFKit, Helmet, express-rate-limit
- **API Documentation:** Swagger UI / OpenAPI 3.0
- **Database:** MySQL 8/9 (ACID transactions for order processing)
- **Testing:** Jest, Supertest
- **Containerization:** Docker, Docker Compose

---

## Quick Start

### Method 1: Using Docker Compose (Recommended)
Launch all services (MySQL, Backend, Frontend) with a single command:

```bash
docker compose up --build
```

- Frontend: `http://localhost` (Port 80)
- Backend API: `http://localhost:5000`
- Swagger API Documentation: `http://localhost:5000/api-docs`

The database schema and initial seed data (demo equipment, coupons, default admin account) will be initialized automatically.

---

### Method 2: Local Setup with Node.js

#### 1. Database (MySQL)
1. Ensure the MySQL service is running.
2. Create the `my_store` database and import the schema:
   ```bash
   mysql -u root -p my_store < database_schema.sql
   ```

#### 2. Backend API
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (based on `.env.example`) and configure your database and environment settings:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=my_store
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:5000`. Initial demo data is seeded automatically on first startup.

#### 3. Frontend Client
1. In a new terminal window, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the React application:
   ```bash
   npm install
   npm start
   ```
   The application will open at `http://localhost:3000`.

---

## API Documentation (Swagger)

Once the backend is running, interactive API documentation is available in your browser at:
`http://localhost:5000/api-docs`

You can test authentication endpoints, catalog queries, orders, and promo codes directly from the Swagger UI.

---

## Testing

To run the automated test suite:

```bash
cd backend
npm test
```

The test suite includes:
- **API Integration Tests** ([`api.test.js`](file:///E:/Fitcailo_Diplomna/backend/tests/api.test.js)): Checks server health, equipment catalog queries, news feed, slider banners, reviews validation, coupon application, user & admin authentication, and route security guards (unauthorized access prevention).
- **Unit Tests** ([`pdfGenerator.test.js`](file:///E:/Fitcailo_Diplomna/backend/tests/pdfGenerator.test.js)): Verifies PDF invoice stream generation for rentals, purchases with applied discount coupons, and edge cases.

---

## Default Administrator Credentials

To access the admin dashboard:
- **Username:** `admin`
- **Password:** `admin123`
