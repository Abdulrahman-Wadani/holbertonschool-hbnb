# HBnB

A simplified AirBnB-style rental app, built as a team project at Holberton School. Users register, owners list places with amenities, and other users leave reviews with a 1–5 rating.

The project was built in four stages, each in its own folder:

| Folder | Stage | What it contains |
|---|---|---|
| [`part1`](part1) | Design | Package, class and sequence diagrams for a three-layer architecture |
| [`part2`](part2) | REST API | Flask-RESTX API with in-memory storage, a facade, tests and a testing report |
| [`part3`](part3) | Auth and database | JWT login, admin role, SQLAlchemy models and repositories, SQL schema |
| [`part4`](part4) | Web client | Login, place list, place details and review pages in HTML, CSS and JavaScript |

## Architecture

```
Presentation    Flask-RESTX namespaces: /users, /places, /reviews, /amenities, /auth
     │
     ▼
Business logic  Facade + models (User, Place, Review, Amenity) with validation
     │
     ▼
Persistence     Repositories: in-memory (part 2) → SQLAlchemy (part 3)
```

The facade is the only entry point from the API into the business logic, so the storage could be swapped from memory to a database in part 3 without changing the endpoints.

The full design document, with diagrams, is in [`part1/documentation.md`](part1/documentation.md).

## Features

**API (part 2 and 3)**
- CRUD for users, places, reviews and amenities, documented with Swagger at `/api/v1/`.
- Validation in the models: email format and uniqueness, price ≥ 0, latitude and longitude ranges, rating 1–5.
- Login with email and password returns a JWT. Passwords are hashed with bcrypt.
- Authorization rules:
  - Only the owner can update or delete a place.
  - Users cannot review their own place, or review the same place twice.
  - Users can only edit their own profile, and cannot change email or password through the update endpoint.
  - Creating users and managing amenities requires an admin token.

**Database (part 3)**
- SQLAlchemy models with relationships: a user owns places, places have reviews, and places and amenities are linked many-to-many.
- SQLite for development, MySQL for production (through `DATABASE_URL`).
- Raw SQL [`schema.sql`](part3/sql/schema.sql) and [`seed.sql`](part3/sql/seed.sql), plus an [ER diagram](part3/ER_Diagram.md).

**Web client (part 4)**
- Login page that stores the JWT in a cookie.
- Place list with a price filter, place details with reviews, and a form to add a review.

## Run it

Requires Python 3.10+.

```bash
cd part3
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run.py
```

The API runs on `http://127.0.0.1:5000`, and Swagger UI is at `http://127.0.0.1:5000/api/v1/`. On first start, `run.py` creates a development admin user (`admin@hbnb.io` / `admin1234`). Use it only locally.

To open the web client, serve `part4` in a second terminal and open `http://127.0.0.1:8000`:

```bash
cd part4
python3 -m http.server 8000
```

## Tests

Part 2 was checked with cURL and Swagger, written up in [`part2/testing_report.md`](part2/testing_report.md), and has `unittest` suites in [`part2/tests`](part2/tests) for the models, the facade and each endpoint.

## Tech stack

Python, Flask, Flask-RESTX, Flask-JWT-Extended, Flask-Bcrypt, SQLAlchemy, SQLite / MySQL, HTML, CSS, JavaScript.
