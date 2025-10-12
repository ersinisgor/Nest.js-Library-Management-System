# NestJS Library Management System

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [How It Works](#how-it-works)
- [Technologies](#technologies)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Database Migrations](#database-migrations)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Roles and Permissions](#roles-and-permissions)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This is a backend application built with NestJS for managing a library system. It was developed as a learning project for NestJS and implements real-world library rules for book borrowing, fines, and user management. The system tracks books, authors, users, borrows, and fines, with role-based access for admins and members.

The application uses a PostgreSQL database and provides RESTful APIs for CRUD operations, authentication, and library-specific logic like borrowing limits and fine calculations.

## Features

- User registration and login with JWT authentication.
- Role-based access: Admin and Member.
- Manage books and authors (CRUD operations, mostly admin-only).
- Borrowing system: Members can borrow/return/renew books.
- Fine management: Automatic fines for overdue books, payment to unblock.
- History tracking: Borrow history per book.
- Validation and error handling for business rules.

## How It Works

The library enforces the following rules:

- A user (member) can borrow a maximum of 3 books at a time.
- Borrow duration: 14 days. If not returned on time, a fine of $0.50 per overdue day is applied.
- If total unpaid fines reach $10, the user is blocked from borrowing new books.
- Blocked users can borrow again after paying fines.
- Members can request a renewal, extending the due date by 7 days (if not already overdue or renewed).
- Full borrow history: Who borrowed a book, when, return date, and overdue days.
- Admins have access to all data and management features; members can only manage their borrows and view profiles/fines.

Business logic is handled in services (e.g., BorrowService calculates fines on return, checks limits).

## Technologies

This project uses the following technologies and libraries:

- **NestJS (^11.0.1)**: Core framework for building the server-side application. Provides modular structure with modules, controllers, services, guards, and pipes.
- **TypeORM (0.3.22)**: ORM for interacting with the database. Entities define models (User, Book, Author, Borrow, Fine). Supports migrations and relations (OneToMany, ManyToOne).
- **PostgreSQL (via pg ^8.14.1)**: Database engine. Configured via environment variables for host, port, username, password, and database.
- **JWT (@nestjs/jwt ^11.0.0)**: For authentication tokens. Tokens include user ID, email, and role; expiration configured via env.
- **bcrypt (^5.1.1)**: Password hashing for secure user registration/login.
- **class-validator (^0.14.1) and class-transformer (^0.5.1)**: For DTO validation and transformation.
- **ConfigModule (@nestjs/config ^4.0.2)**: Manages environment variables (.env file).
- **Express (via @nestjs/platform-express)**: Underlying HTTP server.
- **ValidationPipe**: Global pipe for request validation (whitelist, transform).
- **Guards**: AuthGuard (JWT verification) and RolesGuard (role-based access).
- **Testing**: Jest for unit/e2e tests.
- **Dev Tools**: ESLint, Prettier for linting/formatting; ts-node for TypeScript execution.
- **Other**: RxJS for observables, reflect-metadata for decorators.

The app is private (UNLICENSED) and uses TypeScript (^5.7.3).

## Installation

1. **Clone the repository**:

```bash
git clone <repository-url>
cd nestjs-library-management
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_DATABASE=library_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=3600s  # e.g., 1 hour
PORT=3000  # Optional, default 3000
```

Replace values accordingly. Ensure PostgreSQL is installed and running.

4. **Set up PostgreSQL**:

- Create the database: `CREATE DATABASE library_db;`
- Note: An "Unknown Author" entity should be created manually or via script for book reassignments on author deletion.

## Running the Application

- **Development mode** (with watch):

```bash
npm run start:dev
```

- **Production mode**:

```bash
npm run build
npm run start:prod
```

- The server runs on `http://localhost:3000` (or configured PORT).

## Database Migrations

TypeORM migrations handle schema changes.

- Create a migration: `npm run migration:create --name=YourMigrationName`
- Generate from entities: `npm run migration:generate --name=YourMigrationName`
- Run migrations: `npm run migration:run`
- Revert: `npm run migration:revert`
- Show: `npm run migration:show`

Entities are auto-loaded; synchronize is false for production safety.

## API Endpoints

All endpoints return JSON. Use tools like Postman or curl. Authenticated endpoints require Bearer Token in headers.

### Auth

- `POST /auth/register`: Register a new member (body: { name, email, password }).
- `POST /auth/login`: Login (body: { email, password }) → Returns JWT.
- `GET /auth/profile`: Get logged-in user profile (authenticated).

### Authors (GET open; others admin-only)

- `POST /authors`: Create author (body: { name, biography }).
- `GET /authors`: List all authors with books.
- `GET /authors/:id`: Get author by ID.
- `GET /authors/:id/books`: Get books by author.
- `PUT /authors/:id`: Update author.
- `DELETE /authors/:id`: Delete author (reassigns books to 'Unknown Author').

### Books

- `GET /books`: List all books (authenticated).
- `GET /books/:id`: Get book by ID.
- `POST /books`: Create book (admin, body: { title, isbn, pageCount, authorId }).
- `PUT /books/:id`: Update book (admin).
- `DELETE /books/:id`: Delete book (admin).

### Borrows (Member for actions; Admin for views)

- `POST /borrows`: Borrow a book (member, body: { bookId }) → Checks limits/fines/block.
- `GET /borrows`: List all borrows (admin).
- `GET /borrows/current`: List current borrows (admin).
- `GET /borrows/overdue`: List overdue (admin).
- `GET /borrows/:id`: Get borrow by ID (admin).
- `GET /borrows/book/:bookId`: Borrow history for book (admin).
- `GET /borrows/user/:userId/current-count`: Current borrows count (admin).
- `PATCH /borrows/:id`: Return book (member) → Calculates fine if overdue.
- `PATCH /borrows/:id/renew`: Renew borrow (member) → +7 days.
- `DELETE /borrows/:id`: Delete (admin).

### Fines

- `GET /fines/user/:userId`: Get unpaid fines (own or admin).
- `GET /fines/user/:userId/total`: Total unpaid amount.
- `POST /fines/pay/:userId`: Pay all fines (own or admin) → Unblocks user.

### Users (Admin mostly)

- `GET /users`: List all users.
- `GET /users/:id`: Get user by ID (admin).
- `PUT /users/:id`: Update user (admin, body: { name, email, role, isActive }).
- `DELETE /users/:id`: Delete user (admin).

## Authentication

- JWT-based. Login returns `accessToken`.
- Include in headers: `Authorization: Bearer <token>`.
- Guards protect routes; invalid token → 401.

## Roles and Permissions

- **Admin**: Full access (create/delete/update sensitive data).
- **Member**: Borrow/return/renew, view own fines/profile.
- Decorator `@Roles()` and RolesGuard enforce this.
- New users register as MEMBER only; admins promote via update.

## License

UNLICENSED - Private project.
