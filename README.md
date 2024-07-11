# Cozey Backend Question

## Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB

## Getting Started

1. Clone the repository
2. Go to the project directory
3. Install dependencies: npm install
4. Create a `.env` file in the root directory with the following content:
   ``MONGODB_URI=mongodb://localhost:27017/warehouse_db``
   ``PORT=5000``
   Adjust the MONGODB_URI as needed for your setup.
5. Seed the database:
   `node src/config/seedDatabase.js`

The server should now be running on `http://localhost:5000` with seeded data.

## Scripts

- `npm run dev`: Start the server with nodemon for development
- `npm start`: Start the server for production
- `npm test`: Run the test suite

## Database Seeding

To populate the database with initial data, run:

`node src/config/seedDatabase.js`

This script will clear existing data and add sample orders, products, and line items to the database.

## Dependencies

- express
- mongoose
- cors
- dotenv

## Dev Dependencies

- nodemon
- jest
- mongodb-memory-server
- supertest
